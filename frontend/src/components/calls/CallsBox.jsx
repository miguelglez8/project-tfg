import { useEffect, useState } from "react";
import { Grid } from "@mui/material";
import FriendsToCall from "./FriendsToCall.jsx";
import CallHistory from "./CallHistory.jsx";
import { CALLS_API } from "../../routes/api-routes.js";
import axiosInstance from "../../services/axios.js";
import { useNavigate } from "react-router-dom";
import { LOGIN_PATH } from "../../routes/app-routes.js";
import { clearLocalStorage } from "../../App.jsx";

const CallsBox = () => {
  const user = localStorage.getItem("userEmail");
  const navigate = useNavigate();
  const [callHistory, setCallHistory] = useState([]);

  useEffect(() => {
    const fetchCallHistory = async () => {
      try {
        const response = await axiosInstance.get(CALLS_API + `/${user}`);
        setCallHistory(response.data);
      } catch (error) {
        if (error.response.status == 401) {
          clearLocalStorage();
          navigate(LOGIN_PATH);
        }
        console.error("Error charging calls history:", error);
      }
    };

    fetchCallHistory();
  }, [user, navigate]);

  return (
    <Grid
      container
      spacing={3}
      style={{ marginTop: "-10px", marginLeft: "10px" }}
      alignItems="flex-start"
    >
      <Grid item xs={12} md={5}>
        <FriendsToCall />
      </Grid>
      <Grid item xs={12} md={7}>
        <CallHistory callHistory={callHistory} />
      </Grid>
    </Grid>
  );
};

export default CallsBox;
