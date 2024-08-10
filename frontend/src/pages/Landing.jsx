import React from 'react';
import "../App.css";
import { Link, useNavigate } from 'react-router-dom';
import VideocamIcon from '@mui/icons-material/Videocam';


export default function LandingPage() {

    const router = useNavigate();

    return ( 
        <div className='landingPageContainer'>
            <nav>
                <div className='navHeader'>
                    <VideocamIcon style={{fontSize:"2rem"}}/>
                    <h1>Video Meet</h1>
                </div>
                <div className='navlist'>
                    <p onClick={() => {
                        router("/q23asc")
                    }}>Join as Guest</p>
                    <div role='button'>
                        <Link to={"/auth"}>Register/Login</Link>
                    </div>
                </div>
            </nav>

            <div className="landingMainContainer">
                <div>
                    <h1><span style={{color: "#FF9839"}}>Connect</span> with people</h1>
                    <p>Cover a distance by Video Meet</p>
                    <div role='button'>
                        <Link to={"/home"}>Get Started</Link>
                    </div>
                </div>
                <div>
                    <img src='/Conference.jpg' alt='mobile' />
                </div>
            </div>
        </div>
     );
}

