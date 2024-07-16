import crypto from "crypto";
import jwt from "jsonwebtoken";

export const generateSecretKey = () => {
  return crypto.randomBytes(64).toString("hex");
};

export const createSecretToken = (id, secretKey) => {
  return jwt.sign({ id }, secretKey, {
    expiresIn: 3 * 24 * 60 * 60,
  });
};
