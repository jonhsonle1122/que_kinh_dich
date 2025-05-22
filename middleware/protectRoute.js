import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protectRoute = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.error("No token provided", 401, 401);
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      return res.error("User not found in token", 404, 404);
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.error("Token expired", 401, 401);
    }

    if (err.name === "JsonWebTokenError") {
      return res.error("Invalid token", 401, 401);
    }

    console.error("JWT Error:", err);
    return res.error("Server error JWT", 500, 500);
  }
};
