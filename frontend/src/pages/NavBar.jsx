import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { IconButton } from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import RestoreIcon from "@mui/icons-material/Restore";
import LogoutIcon from "@mui/icons-material/Logout";
import VideocamIcon from "@mui/icons-material/Videocam";
import useClickOutside from "../hooks/useClickOutside"; // ✅ IMPORT OUR HOOK

export default function NavBar() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

  const profileRef = useRef(); // ✅ Create a ref

  useEffect(() => {
    const storedUsername = localStorage.getItem("username") || "Anonymous";
    const storedEmail = localStorage.getItem("email") || "anonymous@gmail.com";
    setUsername(storedUsername);
    setEmail(storedEmail);
  }, []);

  const toggleProfileDropdown = () => {
    setIsProfileDropdownOpen((prev) => !prev);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("email");
    navigate("/auth");
  };

  useClickOutside(profileRef, () => setIsProfileDropdownOpen(false)); // ✅ USE OUR HOOK

  return (
    <>
      <div className="navBar">
        <div className="brand" onClick={() => navigate("/home")}>
          <VideocamIcon sx={{ fontSize: "2rem", mr: 1 }} />
          <h3>Video Meet</h3>
        </div>

        <div className="profile" onClick={toggleProfileDropdown} ref={profileRef}>
          <div className="avatar">{username.charAt(0).toUpperCase()}</div>
          <p className="username">{username}</p>
          {isProfileDropdownOpen && (
            <div className="profile-dropdown">
              <div className="logo"><PersonIcon /></div>
              <p className="profile-name">{username}</p>
              <div className="user-email">{email}</div>
              <hr />
              <div className="profile-actions">
                <IconButton onClick={() => navigate("/history")} color="primary">
                  <RestoreIcon />
                  <span>History</span>
                </IconButton>
                <IconButton onClick={handleLogout} color="error">
                  <LogoutIcon />
                  <span>Logout</span>
                </IconButton>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
