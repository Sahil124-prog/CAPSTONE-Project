import "dotenv/config";
import pool from "../src/config/db.js";
import { normalizeTerm } from "../src/utils/normalize.js";

async function renormalizeAll() {
  const client = await pool.connect();
  try {
    console.log("Fetching concepts for re-normalization...");
    const { rows } = await client.query(
      "SELECT id, term FROM terminology_concepts",
    );

    await client.query("BEGIN");
    for (let i = 0; i < rows.length; i++) {
      await client.query(
        "UPDATE terminology_concepts SET normalized_term = $1 WHERE id = $2",
        [normalizeTerm(rows[i].term), rows[i].id],
      );
      if ((i + 1) % 1000 === 0)
        console.log(`Updated ${i + 1} / ${rows.length}`);
    }
    await client.query("COMMIT");
    console.log("Re-normalization complete.");
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Migration failed:", err);
  } finally {
    client.release();
    await pool.end();
  }
}

renormalizeAll();
