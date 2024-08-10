import React, {useEffect, useState} from 'react';
import { useNavigate } from 'react-router-dom';
import { IconButton } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import RestoreIcon from "@mui/icons-material/Restore";
import LogoutIcon from '@mui/icons-material/Logout';
import VideocamIcon from '@mui/icons-material/Videocam';

export default function NavBar() {

    let navigate = useNavigate();
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

    useEffect(() => {
        const storedUsername = localStorage.getItem("username");
        if (storedUsername) {
          setUsername(storedUsername);
        }else {
          setUsername("anonymous");
        }
      }, []);
    
      useEffect(() => {
        const storedEmail = localStorage.getItem("email");
        if (storedEmail) {
          setEmail(storedEmail);
        } else {
          setEmail("anonymous@gmail.com");
        }
      }, []);

      const handleProfileClick = (index) => {
        setIsProfileDropdownOpen(!isProfileDropdownOpen);
      };
    

    return (
        <>
            <div className="navBar">
        <div onClick={() => {
          navigate("/");
        }} className="back-to-home">
          <VideocamIcon style={{fontSize:"2rem"}}/>
          <h3> Video Meet</h3>
        </div>


        <div className="profile" onClick={handleProfileClick}>
          <div className="avatar">{username.charAt(0).toUpperCase()}</div>
          <p className="username">{username}</p>
          {isProfileDropdownOpen && (
            <div className="profile-dropdown">
              <div className="logo"><PersonIcon /></div>
              <p>{username}</p>
              <div className="user">
                <p>{email}</p>
              </div>
              <hr />
              <div style={{paddingTop:"20px"}}>
              <IconButton
                  onClick={() => {
                    navigate("/history");
                  }}   style={{color:"white"}}
                >
                  <RestoreIcon/>
                  <h5>History</h5>
                </IconButton>
                  <br />
              <IconButton 
                onClick={() => {
                  localStorage.removeItem("token");
                  localStorage.removeItem("username");
                  localStorage.removeItem("email");
                  navigate("/auth");
                }} style={{color:"white"}}
              >
                <LogoutIcon/>
                <h5>Log out</h5>
              </IconButton>
              </div>
                              
            </div>
          )}
        </div>
      </div>

        </>
    )
}