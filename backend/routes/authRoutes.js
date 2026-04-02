const express = require("express");
const router = express.Router();
const { register, login, updateProfile, deleteAccount } = require("../controllers/authController");
const auth = require("../middleware/authMiddleware");

router.post("/register", register);
router.post("/login", login);
router.put("/profile", auth, updateProfile);
router.delete("/account", auth, deleteAccount);

module.exports = router;

