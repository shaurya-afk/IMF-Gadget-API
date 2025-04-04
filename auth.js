require("dotenv").config();
const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { Pool } = require("pg");

const router = express.Router();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

const generateToken = (user) => {
  const payload = { id: user.id, username: user.username };
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1h" });
};

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; 
  if (!token) return res.status(401).json({ error: "Access token is missing" });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: "Invalid or expired token" });
    req.user = user;
    next();
  });
};

router.post("/signup", async (req, res) => {
  try {
    const { username, password } = req.body;
    
    const existingUser = await pool.query(
      "SELECT * FROM agents WHERE username = $1",
      [username]
    );
    
    if (existingUser.rows.length > 0) {
      return res.status(409).json({ error: "User already exists" });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const insertResult = await pool.query(
      "INSERT INTO agents (username, password) VALUES ($1, $2) RETURNING *",
      [username, hashedPassword]
    );
    
    const newUser = insertResult.rows[0];
    const token = generateToken(newUser);
    
    res.status(201).json({ token, message: "User registered successfully" });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ error: "Internal server error during signup" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    
    const result = await pool.query(
      "SELECT * FROM agents WHERE username = $1",
      [username]
    );
    
    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    
    const user = result.rows[0];
    
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    
    const token = generateToken(user);
    res.json({ token });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Internal server error during login" });
  }
});

module.exports = { authRouter: router, authenticateToken };
