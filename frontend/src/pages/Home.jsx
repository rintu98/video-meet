import React, { useContext, useState } from "react";
import withAuth from "../utils/WithAuth";
import { useNavigate } from "react-router-dom";
import "../App.css";
import { Button, TextField } from "@mui/material";
import { AuthContext } from "../contexts/AuthContext";
import NavBar from "./NavBar";

function HomeComponent() {
  let navigate = useNavigate();
  const [meetingCode, setMeetingCode] = useState("");

  const { addToUserHistory } = useContext(AuthContext);

  

  let handleJoinVideoCall = async () => {
    await addToUserHistory(meetingCode);
    navigate(`/${meetingCode}`);
  };

  return (
    <>
      <NavBar />

      <div className="meetContainer">
        <div className="leftPanel">
          <div>
            <h2>Providing video call just like quality education</h2>
            <div style={{ display: "flex", gap: "10px" }}>
              <TextField
                onChange={(e) => setMeetingCode(e.target.value)}
                id="outlined-basic"
                label="Meeting Code"
                variant="outlined"
                className="meet-code"
                
              />
              <Button onClick={handleJoinVideoCall} variant="contained">
                Join
              </Button>
            </div>
          </div>
        </div>
        <div className="rightPanel">
          <img srcSet="/phone.svg" alt="" />
        </div>
      </div>
    </>
  );
}

export default withAuth(HomeComponent);
