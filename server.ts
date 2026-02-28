import express from "express";
import cors from "cors";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";
import { fileURLToPath } from 'url';
import "dotenv/config";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Supabase (optional — server works without it using SQLite only)
const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || "";
const supabase = supabaseUrl ? createClient(supabaseUrl, supabaseAnonKey) : null;

const db = new Database("gigos.db");

// Initialize Local Database
db.exec(`
  CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_email TEXT NOT NULL,
    platform TEXT,
    amount REAL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    type TEXT DEFAULT 'EARNING'
  );

  CREATE TABLE IF NOT EXISTS user_profile (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT,
    name TEXT,
    phone TEXT,
    email TEXT UNIQUE,
    password TEXT,
    persona TEXT,
    language TEXT,
    wallet_balance REAL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS user_insurance (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_email TEXT NOT NULL,
    type TEXT NOT NULL,
    status TEXT DEFAULT 'active',
    provider TEXT,
    premium REAL,
    next_due TEXT,
    start_date TEXT,
    coverage TEXT,
    link TEXT
  );
`);

// Migration: add user_id column if it doesn't exist (for existing DBs)
try {
  db.exec(`ALTER TABLE user_profile ADD COLUMN user_id TEXT`);
  console.log('[DB] Added user_id column to user_profile');
} catch (e) {
  // Column already exists, ignore
}

// Track active simulation intervals per user
const activeSimulations = new Map<string, NodeJS.Timeout>();
const platforms = ["Zomato", "Swiggy", "Ola", "Uber", "Blinkit", "Rapido"];

function startSimulation(email: string) {
  // Don't start duplicate simulations
  if (activeSimulations.has(email)) return;

  const interval = setInterval(() => {
    const platform = platforms[Math.floor(Math.random() * platforms.length)];
    const amount = Math.floor(Math.random() * 100) + 20;
    db.prepare("INSERT INTO transactions (user_email, platform, amount) VALUES (?, ?, ?)").run(email, platform, amount);
    console.log(`[Sim:${email}] +₹${amount} from ${platform}`);
  }, 30000);

  activeSimulations.set(email, interval);
  console.log(`[Sim] Started simulation for ${email}`);
}

function stopSimulation(email: string) {
  const interval = activeSimulations.get(email);
  if (interval) {
    clearInterval(interval);
    activeSimulations.delete(email);
    console.log(`[Sim] Stopped simulation for ${email}`);
  }
}

// Seed default insurance for a new user
function seedInsurance(email: string, persona?: string) {
  const existing = db.prepare("SELECT COUNT(*) as count FROM user_insurance WHERE user_email = ?").get(email) as { count: number };
  if (existing.count > 0) return; // already seeded

  const today = new Date();
  const nextMonth = (offset: number) => {
    const d = new Date(today);
    d.setMonth(d.getMonth() + 1);
    d.setDate(offset);
    return d.toISOString().split('T')[0];
  };
  const startDate = (monthsAgo: number) => {
    const d = new Date(today);
    d.setMonth(d.getMonth() - monthsAgo);
    return d.toISOString().split('T')[0];
  };

  // Persona-aware defaults
  const isDelivery = persona === 'delivery' || persona === 'mobility';
  const defaults = [
    { type: isDelivery ? 'Bike Insurance' : 'Car Insurance', status: 'active', provider: 'Acko', premium: isDelivery ? 299 : 1200, nextDue: nextMonth(5), startDate: startDate(6), coverage: isDelivery ? '₹2,00,000' : '₹8,00,000', link: isDelivery ? 'https://www.acko.com/two-wheeler-insurance/' : 'https://www.acko.com/car-insurance/' },
    { type: 'Health Insurance', status: 'active', provider: 'Star Health', premium: 450, nextDue: nextMonth(12), startDate: startDate(9), coverage: '₹5,00,000', link: 'https://www.policybazaar.com/health-insurance/' },
    { type: 'Life Insurance', status: 'pending', provider: 'LIC', premium: 800, nextDue: nextMonth(1), startDate: startDate(12), coverage: '₹10,00,000', link: 'https://www.policybazaar.com/life-insurance/' },
    { type: isDelivery ? 'Car Insurance' : 'Bike Insurance', status: 'pending', provider: isDelivery ? 'HDFC Ergo' : 'Acko', premium: isDelivery ? 1200 : 299, nextDue: nextMonth(15), startDate: startDate(3), coverage: isDelivery ? '₹8,00,000' : '₹2,00,000', link: isDelivery ? 'https://www.acko.com/car-insurance/' : 'https://www.acko.com/two-wheeler-insurance/' },
  ];

  const insert = db.prepare("INSERT INTO user_insurance (user_email, type, status, provider, premium, next_due, start_date, coverage, link) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
  for (const ins of defaults) {
    insert.run(email, ins.type, ins.status, ins.provider, ins.premium, ins.nextDue, ins.startDate, ins.coverage, ins.link);
  }
  console.log(`[Insurance] Seeded ${defaults.length} policies for ${email} (persona: ${persona})`);
}

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;

  // CORS — allow Vercel frontend
  app.use(cors({
    origin: process.env.FRONTEND_URL || '*',
    credentials: true
  }));
  app.use(express.json());

  // API Routes — all user-scoped
  app.get("/api/wallet", (req, res) => {
    const email = req.query.email as string;
    if (!email) return res.status(400).json({ error: "email required" });

    const row = db.prepare("SELECT SUM(amount) as total FROM transactions WHERE user_email = ?").get(email) as { total: number };
    const breakdown = db.prepare("SELECT platform, SUM(amount) as amount FROM transactions WHERE user_email = ? GROUP BY platform").all(email);
    res.json({ balance: row?.total || 0, breakdown });
  });

  app.get("/api/transactions", (req, res) => {
    const email = req.query.email as string;
    if (!email) return res.status(400).json({ error: "email required" });

    const transactions = db.prepare("SELECT * FROM transactions WHERE user_email = ? ORDER BY timestamp DESC LIMIT 50").all(email);
    res.json(transactions);
  });

  // Start simulation for a user (called on login/dashboard load)
  app.post("/api/start-sim", (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "email required" });
    // Seed insurance if not exists
    const user = db.prepare("SELECT persona FROM user_profile WHERE email = ?").get(email) as { persona?: string } | undefined;
    seedInsurance(email, user?.persona);
    startSimulation(email);
    res.json({ success: true });
  });

  // Stop simulation for a user (called on logout)
  app.post("/api/stop-sim", (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "email required" });
    stopSimulation(email);
    res.json({ success: true });
  });

  // Get user insurance data
  app.get("/api/insurance", (req, res) => {
    const email = req.query.email as string;
    if (!email) return res.status(400).json({ error: "email required" });
    const insurance = db.prepare("SELECT * FROM user_insurance WHERE user_email = ? ORDER BY id").all(email);
    res.json(insurance);
  });

  // Update insurance status
  app.post("/api/insurance/update", (req, res) => {
    const { id, status, nextDue } = req.body;
    if (!id) return res.status(400).json({ error: "id required" });
    if (status) db.prepare("UPDATE user_insurance SET status = ? WHERE id = ?").run(status, id);
    if (nextDue) db.prepare("UPDATE user_insurance SET next_due = ? WHERE id = ?").run(nextDue, id);
    res.json({ success: true });
  });

  app.post("/api/login", async (req, res) => {
    const { email, password } = req.body;

    // Check local DB first
    const user = db.prepare("SELECT * FROM user_profile WHERE email = ? AND password = ?").get(email, password) as any;
    if (user) {
      // If user doesn't have a user_id yet, generate one
      if (!user.user_id) {
        const uid = crypto.randomUUID();
        db.prepare("UPDATE user_profile SET user_id = ? WHERE email = ?").run(uid, email);
        user.user_id = uid;
        // Sync to Supabase
        if (supabase) {
          try {
            await supabase.from('profiles').update({ user_id: uid }).eq('email', email);
            console.log(`[Supabase] Backfilled user_id for ${email}: ${uid}`);
          } catch (e) { console.error('[Supabase] Backfill error:', e); }
        }
      }
      return res.json({ success: true, user: { user_id: user.user_id, name: user.name, phone: user.phone, email: user.email, persona: user.persona, lang: user.language } });
    }

    // Fallback to Supabase
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('email', email)
          .eq('password', password)
          .single();

        if (data) {
          const uid = (data as any).user_id || crypto.randomUUID();
          db.prepare("INSERT OR IGNORE INTO user_profile (user_id, name, phone, email, password, persona, language) VALUES (?, ?, ?, ?, ?, ?, ?)").run(uid, data.full_name, data.phone, data.email, data.password, data.persona, data.language || 'en');
          return res.json({
            success: true,
            user: { user_id: uid, name: data.full_name, phone: data.phone, email: data.email, persona: data.persona, lang: data.language || 'en' }
          });
        }
      } catch (err) {
        console.error("[Supabase Login Error]", err);
      }
    }

    return res.status(401).json({ success: false, message: "Invalid email or password." });
  });

  app.post("/api/onboard", async (req, res) => {
    const { phone, persona, language, name, email, password } = req.body;
    const userId = crypto.randomUUID();

    // Save to local SQLite
    try {
      db.prepare("INSERT INTO user_profile (user_id, name, phone, email, password, persona, language) VALUES (?, ?, ?, ?, ?, ?, ?)").run(userId, name, phone, email, password, persona, language);
    } catch (e: any) {
      if (e.message?.includes('UNIQUE constraint failed')) {
        return res.status(409).json({ success: false, message: 'An account with this email already exists.' });
      }
      throw e;
    }

    // Sync with Supabase
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .upsert({
            user_id: userId,
            phone,
            full_name: name,
            email,
            password,
            persona,
            language
          }, { onConflict: 'phone' });

        if (error) throw error;
        console.log(`[Supabase] Profile synced for ${name} (${email})`);
      } catch (err) {
        console.error("[Supabase Error]", err);
      }
    }

    res.json({ success: true, userId });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(Number(PORT), "0.0.0.0", () => {
    console.log(`\n  ➜  Local:   \x1b[36mhttp://localhost:${PORT}/\x1b[0m`);
    console.log(`  ➜  Network: \x1b[2mhttp://0.0.0.0:${PORT}/\x1b[0m\n`);
  });
}

startServer();
