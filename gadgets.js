require("dotenv").config();
const express = require("express");
const { Pool } = require("pg");

const router = express.Router();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

const getMissionSuccessProbability = () => `${Math.floor(Math.random() * 100)}%`;

const codenames = ["The Nightingale", "The Kraken", "Shadow Fang", "Ghost Viper", "Iron Phoenix"];

const getRandomCodename = () => codenames[Math.floor(Math.random() * codenames.length)];

router.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM gadgets");
    const gadgets = result.rows.map(gadget => ({
      ...gadget,
      mission_success_probability: getMissionSuccessProbability(),
    }));
    res.json(gadgets);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/", async (req, res) => {
  try {
    const { status } = req.body; 
    if (!["Available", "Deployed", "Destroyed", "Decommissioned"].includes(status)) {
      return res.status(400).json({ error: "Invalid status value" });
    }

    const codename = getRandomCodename();
    const result = await pool.query(
      "INSERT INTO gadgets (id, name, status) VALUES (gen_random_uuid(), $1, $2) RETURNING *",
      [codename, status]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to add gadget" });
  }
});

router.patch("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, status } = req.body;

    if (status && !["Available", "Deployed", "Destroyed", "Decommissioned"].includes(status)) {
      return res.status(400).json({ error: "Invalid status value" });
    }

    const result = await pool.query(
      "UPDATE gadgets SET name = COALESCE($1, name), status = COALESCE($2, status) WHERE id = $3 RETURNING *",
      [name, status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Gadget not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update gadget" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const decommissionedAt = new Date();

    const result = await pool.query(
      "UPDATE gadgets SET status = 'Decommissioned', decommissioned_at = $1 WHERE id = $2 RETURNING *",
      [decommissionedAt, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Gadget not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to decommission gadget" });
  }
});

router.post("/:id/self-destruct", async (req, res) => {
  try {
    const { id } = req.params;
    
    const confirmationCode = Math.random().toString(36).substring(2, 10).toUpperCase();

    console.log(`Self-destruct initiated for gadget ${id} with confirmation code: ${confirmationCode}`);

    const result = await pool.query(
      "UPDATE gadgets SET status = 'Destroyed' WHERE id = $1 RETURNING *",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Gadget not found" });
    }

    res.json({
      message: "Self-destruct sequence triggered.",
      confirmationCode,
      gadget: result.rows[0]
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to trigger self-destruct sequence" });
  }
});


module.exports = router;
