import pool from "../../config/db.js";

export async function saveRelease(system, version, concepts) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const { rows } = await client.query(
      `INSERT INTO terminology_releases (system, version)
       VALUES ($1, $2)
       RETURNING id`,
      [system, version],
    );
    const releaseId = rows[0].id;

    for (const c of concepts) {
      await client.query(
        `INSERT INTO terminology_concepts (release_id, code, term, description, tradition)
         VALUES ($1, $2, $3, $4, $5)`,
        [releaseId, c.code, c.term, c.description, c.tradition ?? null],
      );
    }

    await client.query("COMMIT");
    return releaseId;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}
