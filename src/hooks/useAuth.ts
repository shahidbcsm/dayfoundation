import { useState, useEffect } from "react";
import { 
  signInWithEmailAndPassword as fbSignIn,
  signOut as fbSignOut,
  onAuthStateChanged
} from "firebase/auth";
import type { User } from "firebase/auth";
import { auth, isMockEnabled } from "../firebase/config";

export const useAuth = () => {
  const [user, setUser] = useState<User | { email: string } | null>(() => {
    if (isMockEnabled) {
      const mockSession = sessionStorage.getItem("day_admin_session");
      if (mockSession) {
        try {
          return { email: JSON.parse(mockSession).email };
        } catch {
          return null;
        }
      }
    }
    return null;
  });
  const [loading, setLoading] = useState<boolean>(() => {
    if (isMockEnabled) {
      return false;
    }
    return true;
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isMockEnabled) {
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        let role = 'Viewer';
        const emailLower = fbUser.email?.toLowerCase();
        if (emailLower === 'owner@dayfoundation.com' || emailLower === 'mrshahidbabu@dayfoundation.in' || emailLower === 'info@dayfoundation.in') {
          role = 'Super Admin';
        } else {
          try {
            const { doc, getDoc } = await import("firebase/firestore");
            const { db } = await import("../firebase/config");
            if (db) {
              const docRef = doc(db, "admins", emailLower || "");
              const docSnap = await getDoc(docRef);
              if (docSnap.exists()) {
                role = docSnap.data().role || 'Viewer';
              }
            }
          } catch (e) {
            console.error("Error fetching admin role:", e);
          }
        }
        setUser({
          uid: fbUser.uid,
          email: fbUser.email,
          role: role
        } as any);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const normalizedInput = email.trim().toLowerCase();
      const isOwnerCreds = normalizedInput === "owner@dayfoundation.com" && password === "DAY@19019";

      if (isMockEnabled) {
        await new Promise(resolve => setTimeout(resolve, 800)); // nice auth loader experience
        const expectedUser = import.meta.env.VITE_ADMIN_USERNAME || (import.meta.env.DEV ? "mrshahidbabu" : "");
        const expectedPass = import.meta.env.VITE_ADMIN_PASSWORD || (import.meta.env.DEV ? "Shahid@19019" : "");

        const isDefaultCreds = (expectedUser && expectedPass && 
          (normalizedInput === expectedUser.trim().toLowerCase() || normalizedInput === `${expectedUser.trim().toLowerCase()}@dayfoundation.in`) &&
          password === expectedPass);

        if (isOwnerCreds || isDefaultCreds) {
          const mockUser = { 
            email: isOwnerCreds ? "owner@dayfoundation.com" : `${expectedUser.trim().toLowerCase()}@dayfoundation.in`,
            role: "Super Admin"
          };
          sessionStorage.setItem("day_admin_session", JSON.stringify(mockUser));
          setUser(mockUser);
          setLoading(false);
          return true;
        } else {
          throw new Error("Invalid admin email or password.");
        }
      }

      let firebaseEmail = email.trim();
      if (!firebaseEmail.includes("@")) {
        firebaseEmail = `${firebaseEmail}@dayfoundation.in`;
      }
      const userCredential = await fbSignIn(auth, firebaseEmail, password);
      let role = 'Viewer';
      const emailLower = userCredential.user.email?.toLowerCase();
      if (emailLower === 'owner@dayfoundation.com' || emailLower === 'mrshahidbabu@dayfoundation.in' || emailLower === 'info@dayfoundation.in') {
        role = 'Super Admin';
      } else {
        try {
          const { doc, getDoc } = await import("firebase/firestore");
          const { db } = await import("../firebase/config");
          if (db) {
            const docRef = doc(db, "admins", emailLower || "");
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
              role = docSnap.data().role || 'Viewer';
            }
          }
        } catch (e) {
          console.error("Error fetching admin role:", e);
        }
      }
      setUser({
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        role: role
      } as any);
      setLoading(false);
      return true;
    } catch (err: unknown) {
      // Map Firebase auth error codes to human-readable messages
      let msg = "Authentication failed.";
      if (err instanceof Error) {
        const code = (err as any).code || "";
        if (code === "auth/wrong-password" || code === "auth/invalid-credential") {
          msg = "Wrong password. Please check your password and try again.";
        } else if (code === "auth/user-not-found") {
          msg = "No account found with this email. Please check your email.";
        } else if (code === "auth/user-disabled") {
          msg = "This account has been disabled. Contact support.";
        } else if (code === "auth/too-many-requests") {
          msg = "Too many failed attempts. Please wait a few minutes before trying again.";
        } else if (code === "auth/invalid-email") {
          msg = "Invalid email format. Please enter a valid email address.";
        } else if (code === "auth/operation-not-allowed") {
          msg = "Email/password login is not enabled in Firebase. Enable it in the Firebase Console under Authentication > Sign-in methods.";
        } else {
          msg = err.message || msg;
        }
      }
      setError(msg);
      setLoading(false);
      return false;
    }
  };

  const logout = async (): Promise<void> => {
    setLoading(true);
    try {
      if (isMockEnabled) {
        await new Promise(resolve => setTimeout(resolve, 300));
        sessionStorage.removeItem("day_admin_session");
        setUser(null);
        setLoading(false);
        return;
      }
      await fbSignOut(auth);
      setUser(null);
      setLoading(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to log out.";
      setError(msg);
      setLoading(false);
    }
  };

  return { user, loading, error, login, logout, isMock: isMockEnabled };
};
export default useAuth;
