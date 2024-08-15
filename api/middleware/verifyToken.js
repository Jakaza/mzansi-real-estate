import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) return res.status(401).json({ message: "Not Authenticated!" });

  console.log("Token found, verifying...");

  jwt.verify(token, process.env.JWT_SECRET_KEY, async (err, payload) => {
    if (err) {

      console.log("Token verification failed, sending 403 response.");
      return res.status(403).json({ message: "Token is not Valid!" });

      
    }

    console.log('Token verified successfully.');
    req.userId = payload.id;

    next();
  });
};
