import React, { useContext, useState } from "react";
import withAuth from "../utils/WithAuth";
import { useNavigate } from "react-router-dom";
import "../App.css";
import { Button, TextField, Snackbar, Alert } from "@mui/material";
import { AuthContext } from "../contexts/AuthContext";
import NavBar from "./NavBar";

function HomeComponent() {
  const navigate = useNavigate();
  const [meetingCode, setMeetingCode] = useState("");
  const { addToUserHistory } = useContext(AuthContext);

  const [flashOpen, setFlashOpen] = useState(false);

  const handleJoinVideoCall = async () => {
    if (!meetingCode.trim()) return;
    setFlashOpen(true); // show flash
    await addToUserHistory(meetingCode);
    setTimeout(() => {
      navigate(`/meet/${meetingCode}`);
    }, 1000); // small delay for better feel
  };

  return (
    <>
      <NavBar />

      <div className="meetContainer">
        <div className="leftPanel">
          <h2>
            Seamless video calls,
            <br /> reimagined for everyone
          </h2>
          <div className="joinSection">
            <TextField
              onChange={(e) => setMeetingCode(e.target.value)}
              id="outlined-basic"
              label="Enter Meeting Code"
              variant="outlined"
              size="medium"
            />
            <Button
              onClick={handleJoinVideoCall}
              variant="contained"
              size="large"
              className="pulse-button"
              sx={{ bgcolor: "#2C6C73", "&:hover": { bgcolor: "#245058" } }}
            >
              Join
            </Button>
          </div>
        </div>

        <div className="rightPanel">
          <img
            src="undraw_calling.svg"
            alt="Video call illustration"
            className="meetImage"
          />
        </div>
      </div>

      {/* Flash Message Snackbar */}
      <Snackbar
        open={flashOpen}
        autoHideDuration={2000}
        onClose={() => setFlashOpen(false)}
      >
        <Alert
          onClose={() => setFlashOpen(false)}
          severity="success"
          sx={{ width: "100%" }}
        >
          Joining meeting...
        </Alert>
      </Snackbar>
    </>
  );
}

export default withAuth(HomeComponent);
