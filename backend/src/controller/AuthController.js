import httpStatus from "http-status";
import { User } from "../model/UserModel.js";
import bcrypt, { hash } from "bcrypt"
import nodemailer from "nodemailer"

import crypto from "crypto"
import { Meeting } from "../model/meetingModel.js";
const login = async (req, res) => {

    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "Enter the username and password" })
    }
    try {
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(httpStatus.NOT_FOUND).json({ message: "User Not Found" })
        }


        let isPasswordCorrect = await bcrypt.compare(password, user.password)

        if (isPasswordCorrect) {
            let token = crypto.randomBytes(20).toString("hex");

            user.token = token;
            
            await user.save();

            return res.status(httpStatus.OK).json({ token: token , username: user.username, email: user.email})
        } else {
            return res.status(httpStatus.UNAUTHORIZED).json({ message: "Invalid Username or password" })
        }

    } catch (e) {
        console.error(`Something went wrong: ${e}`);
        return res.status(500).json({ message: `Something went wrong ${e}` })
    }
}


const register = async (req, res) => {
    const { email, username, password } = req.body;


    try {
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(httpStatus.FOUND).json({ message: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            email: email,
            username: username,
            password: hashedPassword
        });

        await newUser.save();

        res.status(httpStatus.CREATED).json({ message: "User Registered" })

    } catch (e) {
        res.json({ message: `Something went wrong ${e}` })
    }

}


const getUserHistory = async (req, res) => {
    const { token } = req.query;

    try {
        const user = await User.findOne({ token: token });
        const meetings = await Meeting.find({ user_id: user.username })
        res.json(meetings)
    } catch (e) {
        res.json({ message: `Something went wrong ${e}` })
    }
}

const addToHistory = async (req, res) => {
    const { token, meeting_code } = req.body;

    try {
        const user = await User.findOne({ token: token });

        const newMeeting = new Meeting({
            user_id: user.username,
            meetingCode: meeting_code
        })

        await newMeeting.save();

        res.status(httpStatus.CREATED).json({ message: "Added code to history" })
    } catch (e) {
        res.json({ message: `Something went wrong ${e}` })
    }
}

const forgotPassword = async (req, res) => {
    const { email } = req.body;
  
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });
  
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // valid for 10 mins
  
    user.otp = otp;
    user.otpExpiry = otpExpiry;
    await user.save();
  
    // Send OTP to email
    let transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASS,
      },
    });
  
    const mailOptions = {
      from: `"No Reply" <${process.env.SMTP_EMAIL}>`,
      to: email,
      subject: "Password Reset OTP",
      text: `Your OTP is ${otp}. It is valid for 10 minutes.`,
    };
  
    transporter.sendMail(mailOptions, (err, info) => {
        if (err) {
          return res.status(500).json({ message: "Failed to send OTP", error: err });
        }
        res.status(200).json({ message: "OTP sent successfully" });
      });
      
  };
  
  // Step 2: Verify OTP and Reset Password
  const verifyOtp = async (req, res) => {
    const { email, otp, newPassword } = req.body;
    const user = await User.findOne({ email });
  
    if (!user) return res.status(404).json({ message: "User not found" });
  
    if (user.otp !== otp || user.otpExpiry < Date.now()) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }
  
    user.password = await bcrypt.hash(newPassword, 10);
    user.otp = null;
    user.otpExpiry = null;
  
    await user.save();
  
    res.status(200).json({ message: "Password reset successful" });
  };


export { login, register, getUserHistory, addToHistory, forgotPassword, verifyOtp }