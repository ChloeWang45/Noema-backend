export default function handler(req, res) {
  // CORS for GitHub Pages frontend
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Handle preflight request
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  return res.status(200).json({
    status: "healthy",
    message: "Noema API is running",
    timestamp: new Date().toISOString(),
  });
}
