// server.js
// Instructions:
// 1. Create a folder named 'backend'
// 2. Run 'npm init -y' inside it
// 3. Run 'npm install express cors dotenv'
// 4. Create a file named '.env' and add: GEMINI_API_KEY=your_actual_key_here

const express = require('express');
const cors = require('cors');
require('dotenv').config(); 

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
// This allows your frontend (running on a different port) to talk to this backend
app.use(cors()); 
app.use(express.json());

// Route: Handle Chat Requests
app.post('/api/chat', async (req, res) => {
  try {
    const { message, context } = req.body;

    // 1. Validation
    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    // 2. Security: Get Key from Server Environment (NOT from the user/browser)
    const apiKey = process.env.GEMINI_API_KEY; 
    
    if (!apiKey) {
      console.error("API Key missing on server side");
      return res.status(500).json({ error: "Server configuration error: Missing API Key" });
    }

    // 3. Call Google Gemini API
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: context + "\n\nUser Query: " + message }]
          }
        ]
      })
    });

    const data = await response.json();

    if (data.error) {
      throw new Error(data.error.message);
    }

    // 4. Return only the text answer to the frontend
    const aiResponseText = data.candidates[0].content.parts[0].text;
    res.json({ reply: aiResponseText });

  } catch (error) {
    console.error("Backend Error:", error);
    res.status(500).json({ error: "Failed to process insurance request" });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`✅ Insurance AI Server running on http://localhost:${PORT}`);
});