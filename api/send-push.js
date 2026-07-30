/* api/send-push.js */
import webpush from "web-push";
import dotenv from "dotenv";

dotenv.config();

const publicKey = process.env.VITE_VAPID_PUBLIC_KEY || "";
const privateKey = process.env.VAPID_PRIVATE_KEY || "";
const subject = process.env.VAPID_SUBJECT || "mailto:info@dayfoundation.in";

if (publicKey && privateKey) {
  webpush.setVapidDetails(subject, publicKey, privateKey);
} else {
  console.warn("⚠️ VAPID keys are missing from environment. Background pushes will fail.");
}

export default async function handler(req, res) {
  // CORS Headers
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,PATCH,DELETE,POST,PUT");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
  );

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { title, body, subscriptions } = req.body;

  if (!title || !body) {
    return res.status(400).json({ error: "Missing title or body" });
  }

  if (!publicKey || !privateKey) {
    return res.status(500).json({ error: "VAPID keys not configured on server." });
  }

  if (!subscriptions || !Array.isArray(subscriptions) || subscriptions.length === 0) {
    return res.status(200).json({ success: true, message: "No active push subscriptions provided." });
  }

  console.log(`Sending push to ${subscriptions.length} subscribers...`);

  const results = {
    successCount: 0,
    failureCount: 0,
    errors: []
  };

  const notificationPayload = JSON.stringify({ title, body });

  const promises = subscriptions.map(async (sub) => {
    try {
      // Validate subscription format
      if (!sub.endpoint || !sub.keys || !sub.keys.auth || !sub.keys.p256dh) {
        throw new Error("Invalid subscription object structure");
      }

      await webpush.sendNotification(sub, notificationPayload);
      results.successCount++;
    } catch (err) {
      results.failureCount++;
      results.errors.push({
        endpoint: sub.endpoint,
        error: err.message
      });
      console.error(`Failed to send push to ${sub.endpoint}:`, err.message);
    }
  });

  await Promise.all(promises);

  return res.status(200).json({
    success: true,
    sentCount: results.successCount,
    failedCount: results.failureCount,
    errors: results.errors
  });
}
