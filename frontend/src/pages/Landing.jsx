import React from 'react';
import "../App.css";
import { Link, useNavigate } from 'react-router-dom';


export default function LandingPage() {

    const router = useNavigate();

    return ( 
        <div className='landingPageContainer'>
            <nav>
                <div className='navHeader'>
                    <h2>Apan Video Call</h2>
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
                    <h1><span style={{color: "#FF9839"}}>Connect</span> with your loved Ones</h1>
                    <p>Cover a distance by Apan Video Call</p>
                    <div role='button'>
                        <Link to={"/home"}>Get Started</Link>
                    </div>
                </div>
                <div>
                    <img src='/mobile.png' alt='mobile' />
                </div>
            </div>
        </div>
     );
}

