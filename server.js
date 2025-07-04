const express = require("express");
const cors = require("cors");
const axios = require("axios");
const bodyParser = require("body-parser");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 10000;

// Enable CORS for all requests (so any frontend can access the API)
app.use(cors());

// Parse JSON bodies
app.use(bodyParser.json());

// Health check route (optional)
app.get("/", (req, res) => {
  res.send("FCM Notification Server is up!");
});

// Main endpoint to send FCM notification
app.post("/send", async (req, res) => {
  const { token, payload } = req.body;
  const FCM_SERVER_KEY = process.env.FCM_SERVER_KEY;

  if (!FCM_SERVER_KEY) {
    return res.status(500).json({ message: "FCM server key not configured." });
  }
  if (!token || !payload) {
    return res.status(400).json({ message: "Missing token or payload" });
  }

  const message = {
    to: token,
    notification: {
      title: (payload.en && payload.en.title) || "Notification",
      body: (payload.en && payload.en.description) || "You have a new message."
    },
    data: {
      payload: JSON.stringify(payload)
    }
  };

  try {
    const response = await axios.post(
      "https://fcm.googleapis.com/fcm/send",
      message,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: "key=" + FCM_SERVER_KEY
        }
      }
    );
    res.json({ message: "Notification sent!", response: response.data });
  } catch (error) {
    res.status(500).json({
      message: "Failed to send",
      error: error.response ? error.response.data : error.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
