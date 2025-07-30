// Middlewares/auth.js
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "yoursecretkey";

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Authorization header missing or invalid" });
  }

  const token = authHeader.split(" ")[1];
console.log("Incoming token:", token);

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // Add user ID to request 
    console.log("Auth.js role",req.user);
    next();
  } catch (err) {
    console.error("JWT verification failed:", err);
    res.status(401).json({ error: "Invalid or expired token" });
  }
};

export default authMiddleware;
