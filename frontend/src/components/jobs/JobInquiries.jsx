import { Typography, Paper, Divider, ListItem, ListItemText, Snackbar, Alert, Container, Grid } from '@mui/material';
import FriendshipReceivedCard from '../friendCards/FriendshipReceivedCard';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { useEffect } from 'react';
import { useState } from 'react';
import axiosInstance from '../../services/axios';
import { useNavigate } from 'react-router-dom';
import { JOBINQUIRIES_API, JOBS_API, NOTIFICATIONS_API } from '../../routes/api-routes';
import { JOBS_PATH, LOGIN_PATH } from '../../routes/app-routes';
import { clearLocalStorage } from '../../App';

const JobInquiries = ({ job, friendAcceptedMessage, setFriendAcceptedMessage, setReceived }) => {
    const user = localStorage.getItem('userEmail');
    const { t } = useTranslation();
    const navigate = useNavigate();

    const [receivedRequests, setReceivedRequests] = useState([]);
    
    useEffect(() => {
        const isAdmin = async () => {
          try {
            const response = await axiosInstance.get(JOBS_API + `/isAdmin`, {
              params: {
                jobTitle: job,
                userEmail: user
              }
            });
            
            if (response.data == false) {
                navigate(JOBS_PATH);
            } else {
                fetchReceivedRequests();
            }
          } catch (error) {
            if (error.response.status == 401) {
                clearLocalStorage();
                navigate(LOGIN_PATH);
            }
            console.error("Error get admin:", error);
          }
        };
    
        isAdmin();
    }, [job, user, navigate]);

    useEffect(() => {
        fetchReceivedRequests();
    }, []);

    const handleAcceptRequest = async (sender, receiver) => {
        try {
          await axiosInstance.post(JOBINQUIRIES_API + `/accept?requestEmail=${sender}&title=${receiver}&user=${user}`);
        } catch (error) {
          if (error.response.status == 401) {
            clearLocalStorage();
            navigate(LOGIN_PATH);
          }
          console.error('Error accepting inquiries request:', error);
        }
    
        await axiosInstance.post(NOTIFICATIONS_API + `/push`, {
            type: "INQUIRIES_ACCEPT",
            receiver: sender,
            sender: user,
            read: false,
            hidden: false,
            date: new Date(),
            titleTeam: receiver
        });
        setFriendAcceptedMessage(t('jobs.friendAcceptedMessage', { sender: sender }));
        fetchReceivedRequests();
      };
    
      const handleCancelRequest = async (sender, receiver) => {
          try {
            await axiosInstance.delete(JOBINQUIRIES_API + `/delete?requestEmail=${sender}&title=${receiver}&user=${user}`);
            fetchReceivedRequests();
          } catch (error) {
            if (error.response.status == 401) {
                clearLocalStorage();
                navigate(LOGIN_PATH);
            }
            console.error('Error canceling inquiries request:', error);
          }
      };
    

    const fetchReceivedRequests = async () => {
        try {
            const response = await axiosInstance.get(JOBINQUIRIES_API + `/received?title=${job}&user=${user}`);
            setReceivedRequests(response.data);
            setReceived(response.data);
        } catch (error) {
            if (error.response.status == 401) {
                clearLocalStorage();
                navigate(LOGIN_PATH);
            }
            console.error('Error charging received friendship requests:', error);
        }
    };

    return (
        <Container style={{ width: '60vw', marginLeft: '50px', display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
            <Grid item sx={{ width: '85vw', display: 'flex', justifyContent: 'center', overflowY: 'auto' }}>
                <Paper sx={{ padding: '1rem', minWidth: '35vw', maxHeight: '80vh', height: '50vh', overflowY: 'auto' }}>
                    <Typography variant="h5" align="center">{t('jobs.title_union')}</Typography>
                    {receivedRequests.length > 0 ? (
                        receivedRequests.map((request, index) => (
                            <div key={index}>
                                <FriendshipReceivedCard sender={request.sender} message={request.message} date={request.date} index={index} 
                                handleAcceptRequest={() => handleAcceptRequest(request.sender, request.receiver)}
                                handleCancelRequest={() => handleCancelRequest(request.sender, request.receiver)} isJob={true} job={job} />
                                {index !== receivedRequests.length - 1 && <Divider />}
                            </div>
                        ))
                    ) : receivedRequests.length === 0 ? (
                        <ListItem>
                            <ListItemText
                                primary={
                                    <Typography variant="subtitle1" paddingTop="0.5rem" color="textSecondary" align="center">
                                        {t('jobs.noRequests')}
                                    </Typography>
                                }
                            />
                        </ListItem>
                    ) : null}
                </Paper>
            </Grid>
            <Snackbar 
                open={friendAcceptedMessage !== ''}
                autoHideDuration={3000}
                onClose={() => {
                    setFriendAcceptedMessage('');
                }}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert onClose={() => {
                    setFriendAcceptedMessage('');
                }} severity="success" sx={{ width: '100%' }}>
                    {friendAcceptedMessage}
                </Alert>
            </Snackbar>
        </Container>
    );
};

JobInquiries.propTypes = {
    job: PropTypes.string.isRequired,
    friendAcceptedMessage: PropTypes.string.isRequired,
    setFriendAcceptedMessage: PropTypes.func.isRequired,
    setReceived: PropTypes.func.isRequired
};
export default JobInquiries;
