import OpenAI from "openai";

export default async function handler(req, res) {
  // ---- CORS ----
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { notes } = req.body;

    if (!notes || !Array.isArray(notes) || notes.length < 3) {
      return res.status(400).json({
        error: "Please provide at least 3 notes for analysis",
      });
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    // ---------- FIXED PROMPT ----------
    const prompt = `
You MUST respond ONLY in valid JSON. 
The final answer must match the exact JSON structure shown below.

Hey! I need your help organizing these thoughts and finding connections I might have missed.

CRITICAL REQUIREMENT: You MUST include EVERY SINGLE user note exactly as written. Do not modify the wording. Each must appear once with "aiGenerated": false.

Here are the notes:
${notes.map((note, i) => `${i + 1}. ${note}`).join("\n")}

Here is the EXACT JSON format you MUST follow:

{
  "themes": [
    {
      "name": "Specific Theme Name",
      "insight": "Quick insight about this theme (1-2 sentences)",
      "notes": [
        { "text": "EXACT TEXT from a user note", "aiGenerated": false },
        { "text": "EXACT TEXT from a different user note", "aiGenerated": false },
        {
          "text": "Your NEW AI-generated insight connecting specific notes",
          "aiGenerated": true
        }
      ]
    }
  ],
  "insights": [
    {
      "title": "Connection Title",
      "description": "Explanation of how themes relate using specific user notes",
      "connectedThemes": ["Theme Name 1", "Theme Name 2"]
    }
  ]
}

CRITICAL RULES:
- Your response MUST be valid JSON.
- EVERY user note must appear once with aiGenerated=false.
- New notes must have aiGenerated=true.
- Do not output anything outside the JSON.
`;

    // ---------- FIXED OPENAI CALL ----------
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are a helpful assistant who outputs ONLY valid JSON. Never include commentary outside of JSON.",
        },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" },
      temperature: 0.8,
      max_tokens: 3000,
    });

    const result = JSON.parse(completion.choices[0].message.content);
    return res.status(200).json(result);

  } catch (error) {
    console.error("Error in /api/analyze:", error);

    return res.status(500).json({
      error: "Failed to analyze notes.",
      details: error.message,
    });
  }
}
