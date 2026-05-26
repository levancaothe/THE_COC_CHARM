const express = require("express");

const router = express.Router();

const FIXED_REPLY = "Tính năng sẽ sớm được ra mắt.";

router.post("/chat", (req, res) => {
  const { message, question } = req.body || {};
  const userMessage = (message || question || "").trim();

  if (!userMessage) {
    return res.status(400).json({
      message: "Message is required",
    });
  }

  return res.status(200).json({
    reply: FIXED_REPLY,
  });
});

router.post("/search", (req, res) => {
  const { question } = req.body || {};

  if (!question?.trim()) {
    return res.status(400).json({
      message: "Question is required",
    });
  }

  return res.status(200).json([]);
});

module.exports = router;
