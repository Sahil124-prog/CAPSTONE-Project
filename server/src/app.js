import express from "express";
import cors from "cors";
import pool from "./config/db.js";

// Import your new Phase 9 audit router
import auditRouter from "./modules/audit/audit.router.js";

const app = express();

app.use(cors());
app.use(express.json());

// --- API Routes ---
app.use("/api/audit", auditRouter);

// --- Health Checks ---
app.get("/api/health/db", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json({ db: "connected", time: result.rows[0].now });
  } catch (err) {
    res.status(500).json({ db: "error", message: err.message });
  }
});

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", service: "ayulink-server" });
});

export default app;
