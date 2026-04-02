const db = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user exists
    const [existingUser] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
    if (existingUser.length > 0) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hash = await bcrypt.hash(password, 10);

    const [result] = await db.query(
      "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
      [name, email, hash]
    );

    const token = jwt.sign({ id: result.insertId, email }, process.env.JWT_SECRET || "secret", {
      expiresIn: "1d",
    });

    res.status(201).json({
      message: "User registered successfully", 
      token,
      user: { id: result.insertId, name, email, currency: 'INR' }
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const [result] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
    if (result.length === 0) {
      return res.status(400).json({ message: "User not found" });
    }

    const user = result[0];
    const valid = await bcrypt.compare(password, user.password);

    if (!valid) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET || "secret", {
      expiresIn: "1d",
    });

    res.json({ token, user: { id: user.id, name: user.name, email: user.email, currency: user.currency } });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, email, currency, currentPassword, newPassword } = req.body;

    const [userRows] = await db.query('SELECT * FROM users WHERE id = ?', [userId]);
    const user = userRows[0];

    if (newPassword) {
      if (!currentPassword) return res.status(400).json({ message: 'Current password is required for changing password' });
      const valid = await bcrypt.compare(currentPassword, user.password);
      if (!valid) return res.status(400).json({ message: 'Current password is incorrect' });
      const hash = await bcrypt.hash(newPassword, 10);
      await db.query('UPDATE users SET name=?, email=?, currency=?, password=? WHERE id=?',
        [name, email, currency, hash, userId]);
    } else {
      await db.query('UPDATE users SET name=?, email=?, currency=? WHERE id=?',
        [name, email, currency, userId]);
    }

    res.json({ message: 'Profile updated', user: { name, email, currency } });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.deleteAccount = async (req, res) => {
  try {
    const { password } = req.body;
    const [userRows] = await db.query('SELECT * FROM users WHERE id = ?', [req.user.id]);
    const user = userRows[0];
    
    if (!user) return res.status(404).json({ message: 'User not found' });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(400).json({ message: 'Incorrect password' });
    
    await db.query('DELETE FROM users WHERE id = ?', [req.user.id]);
    res.json({ message: 'Account deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
