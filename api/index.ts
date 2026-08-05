import express from 'express';
import cors from 'cors';
import { adminDb } from './firebase-admin';

const app = express();
app.use(cors({ origin: true }));
app.use(express.json());

// --- ROUTES ---

// GET /api/events
app.get('/api/events', async (req, res) => {
  try {
    if (!adminDb) return res.status(500).json({ error: "Firebase Admin not initialized" });
    const snapshot = await adminDb.collection('events').get();
    const events = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    // Cache for 10 minutes at CDN level, revalidate in background
    res.setHeader('Cache-Control', 's-maxage=600, stale-while-revalidate');
    res.status(200).json(events);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/blogs
app.get('/api/blogs', async (req, res) => {
  try {
    if (!adminDb) return res.status(500).json({ error: "Firebase Admin not initialized" });
    const snapshot = await adminDb.collection('blogs').get();
    const blogs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.setHeader('Cache-Control', 's-maxage=600, stale-while-revalidate');
    res.status(200).json(blogs);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/gallery
app.get('/api/gallery', async (req, res) => {
  try {
    if (!adminDb) return res.status(500).json({ error: "Firebase Admin not initialized" });
    const snapshot = await adminDb.collection('gallery').get();
    const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.setHeader('Cache-Control', 's-maxage=600, stale-while-revalidate');
    res.status(200).json(items);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/team
app.get('/api/team', async (req, res) => {
  try {
    if (!adminDb) return res.status(500).json({ error: "Firebase Admin not initialized" });
    const snapshot = await adminDb.collection('team').get();
    const members = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate');
    res.status(200).json(members);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Export Express App for Vercel Serverless
export default app;
