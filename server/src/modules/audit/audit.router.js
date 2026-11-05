import express from "express";
import pool from "../../config/db.js";

const router = express.Router();

// GET /api/audit/stats
router.get("/stats", async (req, res) => {
  try {
    const [concepts, confirmed, queries] = await Promise.all([
      pool.query(`SELECT COUNT(*) FROM terminology_concepts WHERE release_id IN
                  (SELECT id FROM terminology_releases WHERE system LIKE 'NAMASTE%')`),
      pool.query(
        `SELECT COUNT(*) FROM confirmed_mappings WHERE status = 'confirmed'`,
      ),
      pool.query(`SELECT COUNT(*) FROM query_log`),
    ]);

    const totalNamaste = parseInt(concepts.rows[0].count) || 1; // Prevent division by zero
    const totalConfirmed = parseInt(confirmed.rows[0].count) || 0;

    res.json({
      total_namaste_terms: totalNamaste,
      confirmed_mappings: totalConfirmed,
      coverage_pct: ((totalConfirmed / totalNamaste) * 100).toFixed(1),
      total_queries: parseInt(queries.rows[0].count) || 0,
    });
  } catch (error) {
    console.error("Failed to fetch audit stats:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
