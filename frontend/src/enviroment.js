let IS_PROD = true;
const server =  IS_PROD ? 
    "https://video-meet-backend-0wi9.onrender.com" 
    :
    "http://localhost:8000"
    

export default server;