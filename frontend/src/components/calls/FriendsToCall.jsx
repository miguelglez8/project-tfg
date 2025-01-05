import { useEffect, useState } from 'react';
import { Search } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import UserProfileAvatar from '../home/UserProfileAvatar';
import { USERS_API } from '../../routes/api-routes';
import { Divider, Container, Grid, Typography, TextField, List, ListItem, ListItemAvatar, ListItemText, Paper } from '@mui/material';
import FriendToCall from './FriendToCall';
import axiosInstance from '../../services/axios';

const FriendsToCall = () => {
    const user = localStorage.getItem('userEmail');
    const { t } = useTranslation();

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
            } catch (error) {
                console.error('Error charging user information:', error);
            }
        }

        fetchUserFriends();
    }, [user]);

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
                        {t('calls.title')}
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
                <Grid item xs={12} sx={{ padding: '0.1rem', width: '100%', maxHeight: '70vh', overflowY: 'auto' }}>
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
                                                    <FriendToCall 
                                                        contact={contact} 
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
                                                <FriendToCall 
                                                    contact={contact} 
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
        </Container>
    );
};

export default FriendsToCall;
