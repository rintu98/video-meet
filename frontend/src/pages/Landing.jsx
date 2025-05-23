import React from "react";
import "../App.css";
import { Link, useNavigate } from "react-router-dom";
import VideocamIcon from "@mui/icons-material/Videocam";

export default function LandingPage() {
  const navigate = useNavigate();

   const handleGoogleLogin = () => {
    window.open("http://localhost:5000/api/auth/google", "_self");
  };

  return (
    <div className="betterLandingPage">
      <Link to="/">
        <img src="/logo.svg" alt="Video Meet Logo" style={{ height: "60px" }} />
      </Link>

      <div className="leftPane">
        <h1>
          Connect Instantly.
          <br />
          Meet Securely.
        </h1>
        <p>One-click to join or host a conference</p>
        <div className="buttonGroup">
          <button onClick={() => navigate("/meet/q23asc")}>
            Join Conference
          </button>
          <button>Download App</button>
        </div>
      </div>

      <div className="rightPane">
        <div className="loginCard">
          <div className="logoHeader">
            <VideocamIcon style={{ fontSize: "2rem", color: "#1c5695" }} />
            <h2>Video Meet</h2>
          </div>
          <h3>Sign In</h3>
          <p>Access your meetings securely</p>
          <button className="emailLogin">
            <Link to="/auth" style={{ textDecoration: "none", color: "white" }}>
              Sign in with Email
            </Link>
          </button>
          <button onClick={handleGoogleLogin} className="parichayLogin">
            <Link to="/auth" style={{ textDecoration: "none", color: "white" }}>
              Sign In With Google
            </Link>
          </button>
        </div>
      </div>
    </div>
  );
}
