export default function handler(req, res) {
  return res.status(200).json({
    status: "healthy",
    message: "Noema API is running",
    timestamp: new Date().toISOString(),
  });
}
