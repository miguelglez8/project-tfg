import { useEffect, useState } from 'react';
import { Search } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import UserProfileAvatar from '../home/UserProfileAvatar';
import { USERS_API } from '../../routes/api-routes';
import PropTypes from 'prop-types';
import { Snackbar, Divider, Button, Dialog, DialogTitle, DialogContent, DialogActions, DialogContentText,Container, Grid, Typography, TextField, List, ListItem, ListItemAvatar, ListItemText, Paper  } from '@mui/material';
import MuiAlert from '@mui/material/Alert';
import FriendDetail from './FriendDetail';
import { getQuerySnapShotByEmail, updateDocs } from '../../services/firebase';
import axiosInstance from '../../services/axios';

const FriendsList = ({ handleSendMessage }) => {
    const user = localStorage.getItem('userEmail');
    const { t } = useTranslation();

    const [snackbarOpen, setSnackbarOpen] = useState(false); 
    const [noMessages, setSnackbarNoMessages] = useState(false);
    
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [chatToDelete, setChatToDelete] = useState(null);

    const [contacts, setContacts] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
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

                setContacts(sortedContacts);

                if (sortedContacts.length > 0) {
                    handleSendMessage(sortedContacts[0]);
                }
            } catch (error) {
                console.error('Error charging user information:', error);
            }
        }

        fetchUserFriends();
    }, [user]);

    const handleSnackbarClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }

        setSnackbarOpen(false);
        setSnackbarNoMessages(false);
    };


    const handleOpenConfirmation = (contactEmail) => {
        setChatToDelete(contactEmail);
        setShowConfirmation(true);
    };

    const handleCloseConfirmation = () => {
        setShowConfirmation(false);
        setChatToDelete(null);
    };

    const handleDeleteChatConfirmed = async () => {
        await handleDeleteChat(chatToDelete);

        handleCloseConfirmation();
    };

    const handleDeleteChat = async (contactEmail) => {
        try {
            const senderQuerySnapshot = await getQuerySnapShotByEmail(user, contactEmail);
    
            if (senderQuerySnapshot.empty) {
                setSnackbarOpen(false);
                setSnackbarNoMessages(true); 
                return;
            }

            await updateDocs(senderQuerySnapshot, user);
               
            setSnackbarNoMessages(false);
            setSnackbarOpen(true);
        } catch (error) {
            console.error('Error deleting chat:', error);
        }
    };
    
    const filteredContacts = searchTerm.trim() !== '' ? contacts.filter(contact => {
        const fullName = `${contact.firstName.toLowerCase()} ${contact.lastName.toLowerCase()}`;
        const searchTermLower = searchTerm.toLowerCase();
        return fullName.includes(searchTermLower);
    }) : contacts;

    return (
        <Container>
            <Grid container spacing={2} alignItems="center">
                <Grid item xs={12}>
                    <Typography variant="h4" gutterBottom style={{ textAlign: 'center' }}>
                        {t('chat.chat')}
                    </Typography>
                </Grid>
                <Grid item xs={12}>
                    <TextField
                        fullWidth
                        placeholder={t('chat.search')}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        InputProps={{
                            endAdornment: <Search />,
                        }}
                    />
                </Grid>
                <Grid item xs={12} sx={{ overflowY: 'auto', maxHeight: '70vh' }}>
                    <List>
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
                                        <div key={idx} style={{ marginBottom: '16px' }}>
                                            <Paper elevation={3} >
                                                <ListItem>
                                                    <ListItemAvatar>
                                                        <UserProfileAvatar imageUrl={contact.email} />                                                            
                                                    </ListItemAvatar>
                                                    <FriendDetail 
                                                        contact={contact} 
                                                        handleSendMessage={handleSendMessage}
                                                        handleOpenConfirmation={handleOpenConfirmation}
                                                    />
                                                </ListItem>
                                            </Paper>
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
                            <div>
                                {filteredContacts.map((contact, idx) => (
                                    <div key={idx} style={{ marginBottom: '16px' }}>
                                        <Paper elevation={3} >
                                            <ListItem>
                                                <ListItemAvatar>
                                                    <UserProfileAvatar imageUrl={contact.email} selectedStatus={contact.currentConnectivity} />                                                        
                                                </ListItemAvatar>
                                                <FriendDetail 
                                                    contact={contact} 
                                                    handleSendMessage={handleSendMessage}
                                                    handleOpenConfirmation={handleOpenConfirmation}
                                                />
                                            </ListItem>
                                        </Paper>
                                        {idx !== filteredContacts.length - 1 && <Divider />}
                                    </div>
                                ))}
                            </div>
                        )}
                    </List>
                </Grid>
            </Grid>
            <Snackbar
                open={snackbarOpen}
                autoHideDuration={3000}
                onClose={handleSnackbarClose}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <MuiAlert onClose={handleSnackbarClose} severity="success" sx={{ width: '100%' }}>
                   {t('chat.delete_chatt')}
                </MuiAlert>
            </Snackbar>
            <Snackbar
                open={noMessages}
                autoHideDuration={3000}
                onClose={handleSnackbarClose}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <MuiAlert onClose={handleSnackbarClose} severity="info" sx={{ width: '100%' }}>
                {t('chat.no_msgs')}
                </MuiAlert>
            </Snackbar>
            <Dialog open={showConfirmation} onClose={handleCloseConfirmation}>
                <DialogTitle style={{ color: 'black', textAlign: 'center' }}>{t('chat.confirm_delete')}</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        {t('chat.sure')}
                    </DialogContentText>
                </DialogContent>
                <DialogActions style={{ paddingRight: '1.7rem', paddingBottom: '1.5rem', justifyContent: 'flex-end' }}>
                    <Button variant="outlined" color="primary" onClick={handleCloseConfirmation}>
                        {t('home_view.cancel')}
                    </Button>
                    <Button variant="contained" color="primary" onClick={handleDeleteChatConfirmed}>
                        {t('home_view.confirm')}
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

FriendsList.propTypes = {
    handleSendMessage: PropTypes.func.isRequired,
    unreadMessages: PropTypes.object,
};

export default FriendsList;
