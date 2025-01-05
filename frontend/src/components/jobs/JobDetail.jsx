import { useEffect } from "react";
import { JOBS_API } from "../../routes/api-routes";
import { useNavigate, useParams } from "react-router-dom";
import { JOBS_PATH, LOGIN_PATH } from "../../routes/app-routes";
import JobHome from "./JobHome";
import axiosInstance from "../../services/axios";
import { clearLocalStorage } from "../../App";

const JobDetail = () => {
  const user = localStorage.getItem("userEmail");
  const { title } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const getJobByTitle = async () => {
      try {
        await axiosInstance.get(JOBS_API + `/${title}/job`);
      } catch (error) {
        if (error.response.status == 401) {
          clearLocalStorage();
          navigate(LOGIN_PATH);
        }
        console.error("Job not exist: " + error);
      }
    };

    const checkMembership = async () => {
      try {
        await axiosInstance.get(JOBS_API + `/isMember?jobTitle=${title}&userEmail=${user}`);
      } catch (error) {
        if (error.response.status === 400) {
          navigate(JOBS_PATH);
          console.error("User is not member: " + error);
        } else {
          if (error.response.status == 401) {
            clearLocalStorage();
            navigate(LOGIN_PATH);
          }
          console.error("Error checking member: ", error);
          navigate(JOBS_PATH);
          return;
        }
      }
    };

    getJobByTitle();
    checkMembership();
  }, [title, user, navigate]);

  return (
    <div>
      <JobHome job={title} />
    </div>
  );
};

export default JobDetail;
