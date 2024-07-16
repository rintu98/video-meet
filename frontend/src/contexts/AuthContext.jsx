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
        return request.data.messsage;
      }
    } catch (err) {
      throw err;
    }
  };

  const handleLogin = async (username, password) => {
    try {
      let request = await client.post("/login", {
        username: username,
        password: password,
      });

      if (request.status === httpStatus.OK) {
        localStorage.setItem("token", request.data.token);
        console.log("log in successful");
        router("/home");
      }
    } catch (err) {
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
