import { Dialog, DialogContent, DialogActions, Button, Grid, Typography, ListItem, ListItemText, Divider, List } from '@mui/material';
import { useTranslation } from 'react-i18next';
import FriendshipSentCard from '../friendCards/FriendshipSentCard';
import { JOBINQUIRIES_API, NOTIFICATIONS_API } from '../../routes/api-routes';
import PropTypes from 'prop-types';
import { Email } from '@mui/icons-material';
import { useEffect, useState } from 'react';
import axiosInstance from '../../services/axios';
import { useNavigate } from 'react-router-dom';
import { LOGIN_PATH } from '../../routes/app-routes';
import { clearLocalStorage } from '../../App';

const SentInquiries = ({ setOpenDialog, setSent }) => {
    const user = localStorage.getItem('userEmail');
    const { t } = useTranslation();
    const navigate = useNavigate();

    const [requests, setSentRequests] = useState([]);

    useEffect(() => {
        fetchSentRequests();
    }, []);

    async function fetchSentRequests() {
        try {
            const response = await axiosInstance.get(JOBINQUIRIES_API + `/sent?senderEmail=${user}`);
            setSentRequests(response.data);
        } catch (error) {
            if (error.response.status == 401) {
                clearLocalStorage();
                navigate(LOGIN_PATH);
            }
            console.error('Error charging sent friendship requests:', error);
        }
    }

    const handleCancelRequest = async (title) => {
        await axiosInstance.delete(`${NOTIFICATIONS_API}/${title}/deleteNotification?sender=${user}`);
        try {
            await axiosInstance.delete(JOBINQUIRIES_API + `/cancel?requestEmail=${user}&title=${title}`);
        } catch (error) {
            if (error.response.status == 401) {
                clearLocalStorage();
                navigate(LOGIN_PATH);
            }
            console.error('Error canceling jobinquiries request:', error);
        }
        fetchSentRequests();
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setSent(requests);
    };

    return (
        <Dialog
            open={true}
            onClose={handleCloseDialog}
            sx={{
                maxWidth: '450px',
                width: '60vh',
                margin: 'auto',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
            }}
        >
            <Typography variant="h5" align="center" style={{ marginTop: '15px' }}>
                <Email style={{ marginRight: '10px', color: 'blue' }} />
                    {t('jobs.title_union')}
                {(requests.length > 0) && <span style={{ color: 'red' }}>&nbsp;&#8226;</span>}
            </Typography>            
            <DialogContent>
                <Grid container spacing={3}>
                    <Grid item>
                        <List style={{ minHeight: '200px', overflowY: 'auto' }}>
                            {requests.length > 0 ? (
                                requests.map((request, index) => (
                                    <div key={index}>
                                        <FriendshipSentCard receiver={request.receiver} message={request.message} date={request.date}
                                        index={index} handleDeleteRequest={() => handleCancelRequest(request.receiver)} />
                                        {index !== requests.length - 1 && <Divider />}
                                    </div>
                                ))
                            ) : requests.length === 0 ? (
                                <ListItem>
                                    <ListItemText
                                        primary={<Typography variant="subtitle1" paddingTop="0.5rem" color="textSecondary" align="center">{t('contacts.no_friendships_s')}</Typography>}
                                    />
                                </ListItem>
                            ) : null}
                        </List>
                    </Grid>
                </Grid>
            </DialogContent>
            <DialogActions style={{ paddingRight: '1.5rem', paddingBottom: '1.5rem', justifyContent: 'flex-end' }}>
                <Button onClick={handleCloseDialog} variant="outlined" color="primary">{t('contacts.close')}</Button>
            </DialogActions>
        </Dialog>
    );
};

SentInquiries.propTypes = {
    setOpenDialog: PropTypes.func.isRequired,
    setSent: PropTypes.func.isRequired
};

export default SentInquiries;
