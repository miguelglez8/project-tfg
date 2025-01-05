import { useEffect, useState } from 'react';
import { Alert, DialogContentText, Container, Grid, Typography, TextField, Button, Paper, ListItem, ListItemText, Divider, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { Search } from '@mui/icons-material';
import Snackbar from '@mui/material/Snackbar';
import { useTranslation } from 'react-i18next';
import MuiAlert from '@mui/material/Alert';
import { FRIENDS_API, NOTIFICATIONS_API, USERS_API } from '../../routes/api-routes';
import ContactCard from './ContactCard';
import FriendshipSentCard from '../friendCards/FriendshipSentCard';
import FriendshipReceivedCard from '../friendCards/FriendshipReceivedCard';
import AddContactForm from './AddContactForm';
import ContactDetail from './ContactDetail';
import axiosInstance from '../../services/axios';
import { useNavigate } from 'react-router-dom';
import { LOGIN_PATH } from '../../routes/app-routes';
import { clearLocalStorage } from '../../App';

const Contacts = () => {
    const user = localStorage.getItem('userEmail');
    const { t } = useTranslation();
    const navigate = useNavigate();

    const [showConfirmation, setShowConfirmation] = useState(false);
    const [friendToDelete, setFriendToDelete] = useState(null);

    const [userName, setUsername] = useState('');
    const [openPopup, setOpenPopup] = useState(false);
    const [openPopupFriend, setOpenPopupFriend] = useState(false);

    const [sentRequests, setSentRequests] = useState([]);
    const [receivedRequests, setReceivedRequests] = useState([]);

    const [filter, setFilter] = useState('all');

    const [contacts, setContacts] = useState([]);
    const [groupedContacts, setGroupedContacts] = useState({});
    const [searchTerm, setSearchTerm] = useState('');
    const [snackbarOpen, setSnackbarOpen] = useState(false);

    const [selectedFilter, setSelectedFilter] = useState('all');

    const [friendInfo, setFriendInfo] = useState({});
    const [friendAcceptedMessage, setFriendAcceptedMessage] = useState('');

    useEffect(() => {
        fetchUserFriends();
    }, []);
    
    useEffect(() => {
        fetchSentRequests();
    }, []);
    
    useEffect(() => {
        fetchReceivedRequests();
    }, []);
    
    async function fetchUserFriends() {
        try {
            const response = await axiosInstance.get(USERS_API + `/${user}/friends`);
            const sortedContacts = response.data.sort((a, b) => {
                const nameComparison = a.firstName.localeCompare(b.firstName);
                if (nameComparison !== 0) {
                    return nameComparison;
                }
                return a.lastName.localeCompare(b.lastName);
            });

            const grouped = {};
            sortedContacts.forEach(contact => {
                const firstLetter = contact.firstName.charAt(0).toUpperCase();
                if (!grouped[firstLetter]) {
                    grouped[firstLetter] = [];
                }
                grouped[firstLetter].push(contact);
            });

            setContacts(sortedContacts);
            setGroupedContacts(grouped);
        } catch (error) {
            console.error('Error charging user information', error);
        }
    }

    async function fetchSentRequests() {
        try {
            const response = await axiosInstance.get(FRIENDS_API + `/sent?senderEmail=${user}`);
            setSentRequests(response.data);
        } catch (error) {
            if (error.response.status == 401) {
                clearLocalStorage();
                navigate(LOGIN_PATH);
            }
            console.error('Error charging sent friendship requests:', error);
        }
    }

    const fetchReceivedRequests = async () => {
        try {
            const response = await axiosInstance.get(FRIENDS_API + `/received?receiverEmail=${user}`);
            setReceivedRequests(response.data);
        } catch (error) {
            if (error.response.status == 401) {
                clearLocalStorage();
                navigate(LOGIN_PATH);
            }
            console.error('Error charging received friendship requests:', error);
        }
    };


    const handleDeleteFriendConfirmed = async () => {
        await handleDeleteFriend(friendToDelete);

        handleCloseConfirmation();
    };

    const handleOpenConfirmation = (friendEmail) => {
        setFriendToDelete(friendEmail);
        setShowConfirmation(true);
    };

    const handleCloseConfirmation = () => {
        setShowConfirmation(false);
        setFriendToDelete(null);
    };

    const handleAcceptRequest = async (userName) => {
        try {
            await axiosInstance.post(FRIENDS_API + `/accept?requestEmail=${userName}&receiverEmail=${user}`);
        } catch (error) {
            if (error.response.status == 401) {
                clearLocalStorage();
                navigate(LOGIN_PATH);
            }
            console.error('Error accepting friendship request:', error);
        }

        await axiosInstance.post(NOTIFICATIONS_API + `/push`, {
            type: "FRIEND",
            receiver: userName,
            sender: user,
            read: false,
            hidden: false,
            date: new Date()
        });
        await axiosInstance.post(NOTIFICATIONS_API + `/push`, {
            type: "FRIEND",
            receiver: user,
            sender: userName,
            read: false,
            hidden: false,
            date: new Date()
        });
        setFriendAcceptedMessage(t('contacts.friend_added') + ` ${userName}! 🎉`);
        fetchUserFriends();
        fetchReceivedRequests();
    };

    const handleCancelRequest = async (userName) => {
        try {
            await axiosInstance.delete(FRIENDS_API + `/cancel?requestEmail=${userName}&receiverEmail=${user}`);
        } catch (error) {
            if (error.response.status == 401) {
                clearLocalStorage();
                navigate(LOGIN_PATH);
            }
            console.error('Error canceling friendship request:', error);
        }
        fetchReceivedRequests();
    };

    const handleDeleteRequest = async (userName) => {
        try {
            await axiosInstance.delete(FRIENDS_API + `/cancel`, {
                params: {
                    requestEmail: user,
                    receiverEmail: userName
                }
            });
            await axiosInstance.delete(`${NOTIFICATIONS_API}/deleteNotification?sender=${user}&receiver=${userName}`);
        } catch (error) {
            if (error.response.status == 401) {
                clearLocalStorage();
                navigate(LOGIN_PATH);
            }
            console.error('Error deleting friendship request:', error);
        }
        fetchSentRequests();
    };

    const handleDeleteFriend = async (deleteEmail) => {
        try {
            await axiosInstance.delete(USERS_API + `/remove?userEmail=${user}&deleteEmail=${deleteEmail}`);
            setFriendAcceptedMessage(t('contacts.friend_deleted') + `${deleteEmail} 🎉`);
            handleCloseConfirmation();
            fetchUserFriends();
        } catch (error) {
            if (error.response.status == 401) {
                clearLocalStorage();
                navigate(LOGIN_PATH);
            }
            console.error('Error deleting friend:', error);
        }
    };

    const handleViewFriendDetail = async (email) => {
        try {
            const response = await axiosInstance.get(USERS_API + `/${email}`);
            setFriendInfo(response.data);      
            setOpenPopupFriend(true);
        } catch (error) {
            console.error('Error obtaining friend details:', error);
        }
    };

    const handleFilterChange = (value) => {
        setFilter(value);
        setSelectedFilter(value);
    };

    const handleClosePopup = () => {
        setOpenPopup(false);  
    };

    const handleOpenPopup = () => {
        setOpenPopup(true);
    };

    const handleClosePopupFriend = () => {
        setOpenPopupFriend(false);  
    };

    const handleSnackbarClose = () => {
        setSnackbarOpen(false);
    };

    const filteredContacts = searchTerm.trim() !== '' ? contacts.filter(contact => {
        const fullName = `${contact.firstName.toLowerCase()} ${contact.lastName.toLowerCase()}`;
        const searchTermLower = searchTerm.toLowerCase();
        return fullName.includes(searchTermLower);
    }) : contacts;
    
    return (
        <Container>
            <Grid container spacing={3}>
                <Grid item xs={12} md={6} sx={{ display: 'flex', justifyContent: 'center'}}>
                <Paper sx={{ padding: '1rem', width: '95%', maxHeight: '70vh', overflowY: 'auto', marginTop: '1rem' }}>
                    <Typography variant="h5" align="center">{t('contacts.title')}</Typography>
                    <Button
                        variant="contained"
                        onClick={handleOpenPopup}
                        style={{ display: 'block', margin: 'auto', marginTop: '1rem', marginBottom: '1rem' }}
                    >
                        {t('contacts.contact')}
                    </Button>
                        <TextField
                            fullWidth
                            placeholder={t('contacts.search')}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            InputProps={{
                                endAdornment: <Search />,
                            }}
                        />
                        {filteredContacts.length === 0 && searchTerm.trim() === '' && (
                            <ListItem>
                                <ListItemText
                                    primary={<Typography variant="subtitle1" color="textSecondary" align="center">{t('contacts.not_exist_contacts')}</Typography>}
                                />
                            </ListItem>
                        )}
                        {searchTerm.trim() !== '' ? (
                            filteredContacts.length > 0 ? (
                                <div>
                                    {filteredContacts.map((contact, idx) => (
                                        <div key={idx}>
                                            <ContactCard contact={contact} handleViewFriendDetail={handleViewFriendDetail} handleOpenConfirmation={handleOpenConfirmation}/>
                                            {idx !== filteredContacts.length - 1 && <Divider />}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <ListItem>
                                    <ListItemText
                                        primary={<Typography variant="subtitle1" color="textSecondary" align="center">{t('contacts.not_exist_contacts')}</Typography>}
                                    />
                                </ListItem>
                            )
                        ) : (
                            Object.keys(groupedContacts).map((letter, index) => (
                                <div key={index}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '0.5rem' }}>
                                        <Divider style={{ flexGrow: 1 }} />
                                        <Typography variant="subtitle1" color="textPrimary" style={{ margin: '0 1rem' }}>{letter}</Typography>
                                        <Divider style={{ flexGrow: 1 }} />
                                    </div>
                                    {groupedContacts[letter].map((contact, idx) => (
                                        <div key={idx}>
                                            <ContactCard contact={contact} handleViewFriendDetail={handleViewFriendDetail} handleOpenConfirmation={handleOpenConfirmation}/>
                                            {idx !== groupedContacts[letter].length - 1 && <Divider />}
                                        </div>
                                    ))}
                                </div>
                            ))
                        )}
                    </Paper>
                </Grid>

                <Grid item xs={12} md={6} sx={{ display: 'flex', justifyContent: 'center', overflowY: 'auto'}}>
                    <Paper sx={{ padding: '1rem', width: '95%', maxHeight: '80vh', overflowY: 'auto', marginTop: '1rem' }}>
                        <Typography variant="h5" align="center">{t('contacts.friendships')}
                        {( receivedRequests.length > 0) && <span style={{ color: 'red' }}>&nbsp;&#8226;</span>}</Typography>
                        <div style={{ display: 'flex', justifyContent: 'space-evenly', marginBottom: '0.8rem', marginTop: '0.8rem' }}>
                            <Button onClick={() => handleFilterChange('all')} style={{ fontWeight: selectedFilter === 'all' ? 'bold' : 'normal' }}>{t('contacts.all')}</Button>
                            <Button onClick={() => handleFilterChange('sent')} style={{ fontWeight: selectedFilter === 'sent' ? 'bold' : 'normal' }}>{t('contacts.send')}</Button>
                            <Button onClick={() => handleFilterChange('received')} style={{ fontWeight: selectedFilter === 'received' ? 'bold' : 'normal' }}>{t('contacts.received')}</Button>
                        </div>
                        <Divider />
                        {filter === 'all' && (sentRequests.length > 0 || receivedRequests.length > 0) ? (
                            <>
                            {filter === 'all' && sentRequests.length > 0 && (receivedRequests.length > 0 || receivedRequests.length === 0) && (
                                <Typography variant="subtitle1" align="center" sx={{ marginTop: '1rem', fontWeight: 'bold' }}>{t('contacts.friendships_s')}</Typography>
                            )}                                
                            {sentRequests.map((request, index) => (
                                <div key={index}>
                                    <FriendshipSentCard receiver={request.receiverEmail} message={request.message} date={request.date}
                                    index={index} handleDeleteRequest={() => handleDeleteRequest(request.receiverEmail)} />
                                    {index !== sentRequests.length - 1 && <Divider />}
                                </div>
                            ))}
                            {filter === 'all' && receivedRequests.length > 0 && (receivedRequests.length === 0 || receivedRequests.length > 0) && (
                                <Typography variant="subtitle1" align="center" sx={{ marginTop: '1rem', fontWeight: 'bold' }}>{t('contacts.friendships_r')}</Typography>
                            )}                                
                            {receivedRequests.map((request, index) => (
                                <div key={index}>
                                    <FriendshipReceivedCard sender={request.senderEmail} message={request.message} date={request.date} index={index} 
                                    handleAcceptRequest={() => handleAcceptRequest(request.senderEmail)}
                                    handleCancelRequest={() => handleCancelRequest(request.senderEmail)} />
                                    {index !== receivedRequests.length - 1 && <Divider />}
                                </div>
                            ))}
                            </>
                        ) : filter === 'all' && sentRequests.length === 0 && receivedRequests.length === 0 ? (
                            <ListItem>
                                <ListItemText
                                    primary={
                                        <Typography variant="subtitle1" paddingTop="0.5rem" color="textSecondary" align="center">
                                            {t('contacts.no_friendships')}
                                        </Typography>
                                    }
                                />
                            </ListItem>
                        ) : null}
                        {filter === 'sent' && sentRequests.length > 0 ? (
                            sentRequests.map((request, index) => (
                                <div key={index}>
                                    <FriendshipSentCard receiver={request.receiverEmail} message={request.message} date={request.date}
                                    index={index} handleDeleteRequest={() => handleDeleteRequest(request.receiverEmail)} />
                                    {index !== sentRequests.length - 1 && <Divider />}
                                </div>
                            ))
                        ) : filter === 'sent' && sentRequests.length === 0 ? (
                            <ListItem>
                                <ListItemText
                                    primary={<Typography variant="subtitle1" paddingTop="0.5rem" color="textSecondary" align="center">{t('contacts.no_friendships_s')}</Typography>}
                                />
                            </ListItem>
                        ) : null}
                        {filter === 'received' && receivedRequests.length > 0 ? (
                            receivedRequests.map((request, index) => (
                                <div key={index}>
                                    <FriendshipReceivedCard sender={request.senderEmail} message={request.message} date={request.date} index={index} 
                                    handleAcceptRequest={() => handleAcceptRequest(request.senderEmail)}
                                    handleCancelRequest={() => handleCancelRequest(request.senderEmail)} />
                                    {index !== receivedRequests.length - 1 && <Divider />}
                                </div>
                            ))
                        ) : filter === 'received' && receivedRequests.length === 0 ? (
                            <ListItem>
                                <ListItemText
                                    primary={
                                        <Typography variant="subtitle1" paddingTop="0.5rem" color="textSecondary" align="center">
                                            {t('contacts.no_friendships_r')}
                                        </Typography>
                                    }
                                />
                            </ListItem>
                        ) : null}
                    </Paper>
                </Grid>
            </Grid>
            <Snackbar 
                open={snackbarOpen}
                autoHideDuration={3000}
                onClose={handleSnackbarClose}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <MuiAlert onClose={handleSnackbarClose} severity="success" sx={{ width: '100%' }}>
                {t('contacts.to_sent')}{userName}! 🎉
                </MuiAlert>
            </Snackbar>

            <Snackbar 
                open={friendAcceptedMessage !== ''}
                autoHideDuration={3000}
                onClose={() => {
                    handleSnackbarClose();
                    setFriendAcceptedMessage('');
                }}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert onClose={() => {
                    handleSnackbarClose();
                    setFriendAcceptedMessage('');
                }} severity="success" sx={{ width: '100%' }}>
                    {friendAcceptedMessage}
                </Alert>
            </Snackbar>

            <AddContactForm setUsername={setUsername} openPopup={openPopup} handleClosePopup={handleClosePopup} 
                setSnackbarOpen={setSnackbarOpen} setOpenPopup={setOpenPopup} fetchSentRequests={fetchSentRequests} />

            <ContactDetail openPopupFriend={openPopupFriend} handleClosePopupFriend={handleClosePopupFriend} friendInfo={friendInfo} />

            <Dialog open={showConfirmation} onClose={handleCloseConfirmation}>
                <DialogTitle style={{ color: 'black', textAlign: 'center' }}>{t('home_view.confirm_delete')}</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        {t('home_view.delete_friend')} <strong>{"("}{friendToDelete}{")"}</strong>
                    </DialogContentText>
                </DialogContent>
                <DialogActions style={{ paddingRight: '1.7rem', paddingBottom: '1.5rem', justifyContent: 'flex-end' }}>
                    <Button variant="outlined" color="primary" onClick={handleCloseConfirmation}>
                        {t('home_view.cancel')}
                    </Button>
                    <Button variant="contained" color="primary" onClick={handleDeleteFriendConfirmed}>
                        {t('home_view.confirm')}
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default Contacts;
