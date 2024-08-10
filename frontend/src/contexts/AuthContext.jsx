import axios from "axios";
import httpStatus from "http-status";
import { useNavigate } from "react-router-dom";
import { createContext, useContext, useState } from "react";
import server from "../enviroment";

export const AuthContext = createContext({});

const client = axios.create({
  baseURL: `${server}`,
});

export const AuthProvider = ({ children }) => {
  const authContext = useContext(AuthContext);
  const router = useNavigate();
  const [userData, setUserData] = useState(authContext);

  const handleRegister = async (email, username, password) => {
    try {
      let request = await client.post("/register", {
        email: email,
        username: username,
        password: password,
      });

      if (request.status === httpStatus.CREATED) {
        localStorage.setItem("email", email);
        return await handleLogin(username, password, email);
      }
    } catch (err) {
      throw err;
    }
  };

  const handleLogin = async (username, password, email) => {
    try {
      let request = await client.post("/login", {
        username: username,
        password: password,
      });

      if (request.status === httpStatus.OK) {

        const token = request.data.token;
        const recivedUsername = request.data.username;
        const email = request.data.email;

        if(token && recivedUsername && email) {
          localStorage.setItem("email", request.data.email);
          localStorage.setItem("token", request.data.token);
          localStorage.setItem("username", request.data.username);
          console.log("log in successful");
          router("/home");
        } else {
          console.log("Token or username is undefined in the server response");
        }
        
      }
    } catch (err) {
      console.log("Login error");
      throw err;
    }
  };

  const getHistoryOfUser = async () => {
    try {
      let token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No token found");
      }

      let request = await client.get("/get-all-activity", {
        params: { token },
      });
      return request.data;
    } catch (err) {
      throw err;
    }
  };

  const addToUserHistory = async (meetingCode) => {
    try {
      let token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No token found");
      }

      let request = await client.post("/add-to-activity", {
        token,
        meeting_code: meetingCode,
      });
      return request.status;
    } catch (e) {
      throw e;
    }
  };

  const data = {
    userData,
    setUserData,
    getHistoryOfUser,
    addToUserHistory,
    handleRegister,
    handleLogin,
  };

  return <AuthContext.Provider value={data}>{children}</AuthContext.Provider>;
};
