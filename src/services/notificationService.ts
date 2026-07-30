import { db, isMockEnabled } from "../firebase/config";
import { collection, addDoc, onSnapshot, query, orderBy, limit, setDoc, doc, getDocs } from "firebase/firestore";

export interface PushSubscriptionKeys {
  p256dh: string;
  auth: string;
}

export interface PushTokenDoc {
  endpoint: string;
  keys: PushSubscriptionKeys;
  userAgent: string;
  subscribedAt: string;
}

export interface BroadcastDoc {
  id?: string;
  title: string;
  body: string;
  createdAt: string;
  sentBy: string;
}

const NOTIFICATION_PERMISSION_KEY = "day_push_notification_permission";
const CLIENT_TOKEN_KEY = "day_push_client_token";
const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY || "BI7IxzEzNwapWwO64Mi1G10V4xdgqxyrmUAexGi4nuA4m5cIylnEMJ3TAMK_vSwMbhgeY5r_Dh8bATHrFfcK-l0";

/**
 * Helper to convert VAPID base64 public key to Uint8Array
 */
function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

/**
 * Checks if the user has already subscribed to notifications
 */
export const getSubscriptionStatus = (): string => {
  return localStorage.getItem(NOTIFICATION_PERMISSION_KEY) || "default";
};

/**
 * Requests Notification permission and registers the client's token
 */
export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!("Notification" in window) || !("serviceWorker" in navigator)) {
    console.warn("This browser does not support desktop notifications or service workers.");
    return false;
  }

  try {
    const permission = await Notification.requestPermission();
    localStorage.setItem(NOTIFICATION_PERMISSION_KEY, permission);

    if (permission === "granted") {
      let clientToken = localStorage.getItem(CLIENT_TOKEN_KEY);
      if (!clientToken) {
        clientToken = "token_" + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
        localStorage.setItem(CLIENT_TOKEN_KEY, clientToken);
      }

      // Try to fetch public IP address
      let ip = "Unknown IP";
      try {
        const ipRes = await fetch("https://api.ipify.org?format=json");
        const ipData = await ipRes.json();
        if (ipData && ipData.ip) {
          ip = ipData.ip;
        }
      } catch (ipErr) {
        console.warn("Failed to retrieve subscriber IP address:", ipErr);
      }

      // Try to register for native Web Push
      let subscription: PushSubscription | null = null;
      try {
        const reg = await navigator.serviceWorker.ready;
        if (reg.pushManager) {
          subscription = await reg.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
          });
        }
      } catch (swErr) {
        console.warn("Service worker push subscription failed (likely dev mode or local host/ssl issues):", swErr);
      }

      // Store in Firestore
      if (!isMockEnabled && db) {
        const docId = clientToken;
        
        let payload: any;
        if (subscription) {
          const subJSON = subscription.toJSON();
          payload = {
            endpoint: subJSON.endpoint,
            keys: subJSON.keys,
            ip,
            userAgent: navigator.userAgent,
            subscribedAt: new Date().toISOString()
          };
        } else {
          // Fallback if pushManager is not supported (like iOS Safari outside home screen)
          // We register them as a foreground/active listener only
          payload = {
            endpoint: "active-browser-fallback",
            keys: { p256dh: "", auth: "" },
            ip,
            userAgent: navigator.userAgent,
            subscribedAt: new Date().toISOString()
          };
        }

        await setDoc(doc(db, "notification_tokens", docId), payload);
      } else {
        // Mock fallback
        const savedTokens = JSON.parse(localStorage.getItem("day_mock_push_tokens") || "[]");
        const mockPayload = {
          id: clientToken,
          endpoint: "mock-endpoint",
          ip,
          userAgent: navigator.userAgent,
          subscribedAt: new Date().toISOString()
        };
        const mockList = JSON.parse(localStorage.getItem("day_mock_push_payloads") || "[]");
        if (!savedTokens.includes(clientToken)) {
          savedTokens.push(clientToken);
          mockList.push(mockPayload);
          localStorage.setItem("day_mock_push_tokens", JSON.stringify(savedTokens));
          localStorage.setItem("day_mock_push_payloads", JSON.stringify(mockList));
        }
      }
      return true;
    }
    return false;
  } catch (err) {
    console.error("Error requesting notification permission:", err);
    return false;
  }
};

/**
 * Subscribes to the list of all registered push tokens (Admin Dashboard)
 */
export const subscribeNotificationTokens = (
  callback: (tokens: (PushTokenDoc & { id: string })[]) => void
) => {
  if (isMockEnabled || !db) {
    const handler = () => {
      const data = localStorage.getItem("day_mock_push_payloads");
      callback(data ? JSON.parse(data) : []);
    };
    window.addEventListener("storage", handler);
    handler();
    return () => window.removeEventListener("storage", handler);
  }

  const colRef = collection(db, "notification_tokens");
  return onSnapshot(colRef, (snap) => {
    const tokens = snap.docs.map(d => ({
      id: d.id,
      ...d.data()
    } as PushTokenDoc & { id: string }));
    callback(tokens);
  });
};

/**
 * Revokes / deletes a device subscription from Firestore
 */
export const deleteNotificationToken = async (id: string): Promise<void> => {
  if (isMockEnabled || !db) {
    const data = localStorage.getItem("day_mock_push_payloads");
    const list = data ? JSON.parse(data) : [];
    const filtered = list.filter((t: any) => t.id !== id);
    localStorage.setItem("day_mock_push_payloads", JSON.stringify(filtered));
    
    const tokens = JSON.parse(localStorage.getItem("day_mock_push_tokens") || "[]");
    const filteredTokens = tokens.filter((t: any) => t !== id);
    localStorage.setItem("day_mock_push_tokens", JSON.stringify(filteredTokens));
    
    window.dispatchEvent(new Event("storage"));
    return;
  }

  const { deleteDoc } = await import("firebase/firestore");
  await deleteDoc(doc(db, "notification_tokens", id));
};

/**
 * Subscribes to live broadcasts in Firestore to display active browser notifications
 */
export const subscribeToLiveBroadcasts = (
  onNewBroadcast: (broadcast: BroadcastDoc) => void
) => {
  if (isMockEnabled || !db) {
    const checkMockBroadcast = () => {
      try {
        const lastBroad = localStorage.getItem("day_mock_broadcast");
        if (lastBroad) {
          const data: BroadcastDoc = JSON.parse(lastBroad);
          const timeDiff = Date.now() - new Date(data.createdAt).getTime();
          if (timeDiff < 10000) {
            onNewBroadcast(data);
          }
        }
      } catch {}
    };

    const interval = setInterval(checkMockBroadcast, 2500);
    return () => clearInterval(interval);
  }

  const broadcastsRef = collection(db, "broadcasts");
  const q = query(broadcastsRef, orderBy("createdAt", "desc"), limit(1));

  let isFirstLoad = true;
  return onSnapshot(q, (snapshot) => {
    if (isFirstLoad) {
      isFirstLoad = false;
      return;
    }

    if (!snapshot.empty) {
      const doc = snapshot.docs[0];
      const data = doc.data() as BroadcastDoc;
      const broadcast = { id: doc.id, ...data };

      const ageInMs = Date.now() - new Date(broadcast.createdAt).getTime();
      if (ageInMs < 15000) {
        if (Notification.permission === "granted") {
          new Notification(broadcast.title, {
            body: broadcast.body,
            icon: "/logo.png"
          });
        }
        onNewBroadcast(broadcast);
      }
    }
  });
};

/**
 * Sends a live push broadcast (Triggered by Admin)
 */
export const sendBroadcastNotification = async (
  title: string,
  body: string,
  adminEmail: string
): Promise<{ success: boolean; sentCount: number }> => {
  const payload: BroadcastDoc = {
    title,
    body,
    createdAt: new Date().toISOString(),
    sentBy: adminEmail
  };

  if (isMockEnabled || !db) {
    localStorage.setItem("day_mock_broadcast", JSON.stringify(payload));
    window.dispatchEvent(new Event("storage"));
    return { success: true, sentCount: 1 };
  }

  // 1. Write to Firestore 'broadcasts' (triggers active browser pop-ups instantly)
  await addDoc(collection(db, "broadcasts"), payload);

  // 2. Fetch all push subscriptions from Firestore 'notification_tokens'
  let subscriptions: any[] = [];
  try {
    const snap = await getDocs(collection(db, "notification_tokens"));
    subscriptions = snap.docs
      .map(d => d.data())
      .filter(data => data.endpoint && data.endpoint !== "active-browser-fallback");
  } catch (err) {
    console.error("Failed to fetch notification tokens from Firestore:", err);
  }

  // 3. POST them to Vercel API endpoint for backend Push dispatch
  if (subscriptions.length > 0) {
    try {
      const res = await fetch("/api/send-push", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          body,
          subscriptions
        })
      });
      const data = await res.json();
      return { success: true, sentCount: data.sentCount || 0 };
    } catch (err) {
      console.error("Failed to dispatch push notification payloads:", err);
      return { success: true, sentCount: 0 };
    }
  }

  return { success: true, sentCount: 0 };
};
