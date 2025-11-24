import OpenAI from "openai";

export default async function handler(req, res) {
  // ---- FIX CORS ----
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization"
  );
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");

  if (req.method === "OPTIONS") {
    return res.status(200).end(); // Preflight success
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

    const prompt = `Hey! I need your help organizing these thoughts... (KEPT EXACTLY THE SAME)`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are a helpful assistant who excels at finding connections between ideas...",
        },
        { role: "user", content: prompt }
      ],
      temperature: 0.8,
      max_tokens: 3000,
      response_format: { type: "json_object" },
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
