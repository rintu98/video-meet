import {User} from "../model/UserModel.js";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";

dotenv.config();

export const userVerification = async (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    return res.json({ status: false });
  }

  try {
    const decoded = jwt.decode(token);
    if (!decoded || !decoded.id) {
      return res.json({ status: false });
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.json({ status: false });
    }

    jwt.verify(token, user.secretKey, (err, data) => {
      if (err) {
        return res.json({ status: false });
      } else {
        req.user = user;
        next();
      }
    });
  } catch (err) {
    console.log(err);
    return res.json({ status: false });
  }
};
