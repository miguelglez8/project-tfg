import { IconButton, Typography, Grid, Tooltip } from "@mui/material";
import CallIcon from "@mui/icons-material/Call";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import AccessTimeFilledIcon from "@mui/icons-material/AccessTimeFilled";
import WifiOffIcon from "@mui/icons-material/WifiOff";
import { useTranslation } from "react-i18next";
import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';
import UserProfileAvatar from "../home/UserProfileAvatar";
import { JOBS_API } from "../../routes/api-routes";
import axiosInstance from "../../services/axios";
import { JOBS_PATH, LOGIN_PATH } from "../../routes/app-routes";
import { useNavigate } from 'react-router-dom';
import { handleSend } from '../../services/zegocloud';
import { Videocam } from "@mui/icons-material";
import { clearLocalStorage } from "../../App";

const JobTopBar = ( { job } ) => {
    const user = localStorage.getItem('userEmail');
    const { t } = useTranslation();
    const navigate = useNavigate();
    
    const [users, setUsers] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axiosInstance.get(JOBS_API + '/members?jobTitle=' + job + "&user=" + user);
                const filteredUsers = response.data.filter(member => member.email !== user);
                setUsers(filteredUsers);
            } catch (error) {
                if (error.response.status == 401) {
                    clearLocalStorage();
                    navigate(LOGIN_PATH);
                }
                console.error('Error fetching data:', error);
                navigate(JOBS_PATH);
                return;
            }
        };

        fetchData();
    }, [job, user, navigate]);

    const handleCall = () => {
        handleSend('call', users, true, job);
    };

    const handleVideoCall = () => {
        handleSend('videoCall', users, true, job);
    };
    
    return (
        <Grid container spacing={2} alignItems="center" style={{ width: '70vh' }}>
            <Grid item>
                <UserProfileAvatar imageUrl={job} />
            </Grid>
            <Grid item xs={12} md>
                <Typography variant="h6">{job}</Typography>
                {users.map((user, index) => (
                    <div key={index}>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            {user.currentConnectivity === 'AVAILABLE' && (
                                <CheckCircleIcon sx={{ color: '#00FF00', width: '16px', height: '16px' }} />
                            )}
                            {user.currentConnectivity === 'BUSY' && (
                                <CancelIcon sx={{ color: '#FF0000', width: '16px', height: '16px' }} />
                            )}
                            {user.currentConnectivity === 'AWAY' && (
                                <AccessTimeFilledIcon sx={{ color: '#FFD700', width: '16px', height: '16px' }} />
                            )}
                            {user.currentConnectivity === 'OFFLINE' && (
                                <WifiOffIcon sx={{ color: '#808080', width: '16px', height: '16px' }} />
                            )}
                            <Typography variant="body2" style={{ marginLeft: '5px' }}>
                                {`${user.firstName} ${user.lastName}`}
                            </Typography>
                        </div>
                    </div>
                ))}
            </Grid>
            <Grid item>
                <Tooltip title={t('chat.call')}>
                    <IconButton style={{ color: 'green' }} onClick={handleCall}>
                        <CallIcon />
                    </IconButton>
                </Tooltip>
                <Tooltip title={t('chat.videocall')}>
                    <IconButton style={{ color: 'blue' }} onClick={handleVideoCall}>
                        <Videocam />
                    </IconButton>
                </Tooltip>
            </Grid>
        </Grid>
    );
};

JobTopBar.propTypes = {
    job: PropTypes.string.isRequired
};

export default JobTopBar;
