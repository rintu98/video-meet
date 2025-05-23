import { useState, useEffect } from "react";
import axios from "axios";
import server from "../enviroment";
import { useNavigate } from "react-router-dom";
import "../styles/ForgotPassword.css";


const client = axios.create({
  baseURL: `${server}`,
});

const ForgotPassword = () => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);
  const navigate = useNavigate();

  // Countdown timer for resend OTP
  useEffect(() => {
    if (step === 2 && resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer, step]);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    try {
      const res = await client.post("/forgot-password", { email });
      setMessage(res.data.message);
      setStep(2);
      setResendTimer(60);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send OTP");
    }
  };

  const handleResendOtp = async () => {
    setMessage("");
    setError("");
    try {
      const res = await client.post("/forgot-password", { email });
      setMessage("OTP resent successfully!");
      setResendTimer(60);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to resend OTP");
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    try {
      const res = await client.post("/verify-otp", {
        email,
        otp,
        newPassword,
      });
      setMessage(res.data.message);
      setStep(3);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to reset password");
    }
  };

  useEffect(() => {
    if (step === 3) {
      setTimeout(() => navigate("/auth"), 3000);
    }
  }, [step, navigate]);

  return (
    <div className="forgot-container">
      <div className="forgot-box">
        <h2>Forgot Password</h2>

        {message && <div className="message success">{message}</div>}
        {error && <div className="message error">{error}</div>}

        {step === 1 && (
          <form onSubmit={handleSendOtp}>
            <label>Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
            />
            <button type="submit">Send OTP</button>
          </form>
        )}

        {step === 2 && (
          <>
            <form onSubmit={handleVerifyOtp}>
              <label>Enter OTP</label>
              <input
                type="text"
                required
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="6-digit OTP"
              />

              <label>New Password</label>
              <div className="password-input-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                />
                <span
                  className="toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? "🙈" : "👁️"}
                </span>
              </div>

              <button type="submit">Reset Password</button>
            </form>

            <div className="resend-section">
              {resendTimer > 0 ? (
                <p className="resend-timer">Resend OTP in {resendTimer}s</p>
              ) : (
                <button className="resend-btn" onClick={handleResendOtp}>
                  Resend OTP
                </button>
              )}
            </div>
          </>
        )}

        {step === 3 && (
          <div className="success-final">
            ✅ Your password has been reset. Redirecting to login...
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
