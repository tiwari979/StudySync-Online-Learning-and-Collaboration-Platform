const express = require("express");
const router = express.Router();
const authenticate = require("../middleware/auth-middleware");
const { askChatbot } = require("../controllers/chatbot-controller");

// Auth optional: allow both guests and logged-in users
router.post("/ask", askChatbot);

module.exports = router;
