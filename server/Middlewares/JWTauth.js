import jwt from "jsonwebtoken";

// ================= VERIFY TOKEN =================
export function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
      req.user = decoded;
      next();
    } catch (error) {
      return res.status(401).json({ message: "invalid token" });
    }
  } else {
    return res.status(401).json({ message: "no token provided" });
  }
}

// ================= AUTHORIZATION =================
export function verifyTokenAndAuthorization(req, res, next) {
  verifyToken(req, res, () => {
    if (req.user.id === req.params.id || req.user.isadmin) {
      next();
    } else {
      return res.status(403).json({
        message: "you are not allowed to update this profile",
      });
    }
  });
}

// ================= ADMIN =================
export function verifyTokenAndAdmin(req, res, next) {
  verifyToken(req, res, () => {
    if (req.user.isadmin) {
      next();
    } else {
      return res.status(403).json({
        message: "you are not allowed to update this profile",
      });
    }
  });
}