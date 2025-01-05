import { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, FormControl, Select, Button, Tooltip, IconButton, MenuItem, Box, Typography, InputLabel, Snackbar } from '@mui/material';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { JOBS_API, USERS_API, NOTIFICATIONS_API } from '../../routes/api-routes';
import UserProfileAvatar from '../home/UserProfileAvatar';
import DeleteIcon from '@mui/icons-material/Delete';
import MuiAlert from '@mui/material/Alert';
import axiosInstance from '../../services/axios';
import { useNavigate } from 'react-router-dom';
import { LOGIN_PATH } from '../../routes/app-routes';
import { clearLocalStorage } from '../../App';

const AddMemberDialog = ({ openDialog, handleCloseDialog, team, fetchMembers }) => {
    const user = localStorage.getItem('userEmail');
    const { t } = useTranslation();
    const navigate = useNavigate();

    const [friends, setFriends] = useState([]);
    const [friend, setFriend] = useState(null);
    const [, setSearchTerm] = useState('');
    const [selectedFriend, setSelectedFriend] = useState(null);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchFriends = async () => {
          try {
            const response = await axiosInstance.get(`${USERS_API}/${user}/friends`);
            setFriends(response.data);
          } catch (error) {
            console.error('Error fetching friends:', error);
          }
        };
    
        fetchFriends();
    }, [user]);

    
    useEffect(() => {
        if (openDialog) {
            setError("");
            setSelectedFriend(null);
        }
    }, [openDialog]);


    const handleFriendSelect = (friend) => {
        setSelectedFriend(friend);
        setError("");
        setSearchTerm('');
    };

    const handleSearchInputChange = (event) => {
        setError("");
        setSearchTerm(event.target.value);
    };

    const handleDeleteFriend = () => {
        setSelectedFriend(null);
        setError("");
    }

    const handleAddMember =  async () => {
        try {
            await axiosInstance.post(JOBS_API + '/members?jobTitle=' + team + "&userEmail=" + selectedFriend.email + "&user=" + user);
        } catch (error) {
            if (error.response && error.response.status === 400) {
                const errorMessage = error.response.data;
                if (errorMessage === "User is already in the team") {
                    setError(t('jobs.already_job'));
                } else {
                    setError(t('jobs.not_more'));
                }
            } else if (error.response.status == 401) {
                clearLocalStorage();
                navigate(LOGIN_PATH);
            }
            return;
        }

        await axiosInstance.post(NOTIFICATIONS_API + `/push`, {
            type: "JOB_ADD_MEMBER",
            receiver: selectedFriend.email,
            sender: user,
            read: false,
            hidden: false,
            date: new Date(),
            titleTeam: team
        });
        
        setFriend(selectedFriend.email);
        setSelectedFriend(null);
        fetchMembers(team);
    };

    return (
        <Dialog open={openDialog} onClose={handleCloseDialog}>
            <DialogTitle align="center">{t('jobs.add_member')}</DialogTitle>
            <DialogContent>
            <FormControl fullWidth style={{ marginTop: '5px'}}>
                {friends.length > 0 ? (
                    <div>
                        <InputLabel id="demo-simple-select-label">{t('jobs.select_friend')}</InputLabel>
                        <Select
                            labelId="demo-simple-select-label"
                            id="demo-simple-select"
                            label={t('jobs.select_friend')}
                            value={selectedFriend ? selectedFriend.email : ''}
                            onChange={(event) => {
                                const friendEmail = event.target.value;
                                const friend = friends.find((f) => f.email === friendEmail);
                                handleFriendSelect(friend);
                            }}
                            onInputChange={handleSearchInputChange}
                            endAdornment={selectedFriend && (
                                <Tooltip title={t('contacts.delete_friend')} arrow>
                                    <IconButton 
                                        edge="start"
                                        aria-label="delete"
                                        onClick={handleDeleteFriend}
                                    >
                                        <DeleteIcon />
                                    </IconButton>
                                </Tooltip>
                            )} 
                            sx={{ minWidth: 325 }}
                            error={!!error}
                        >
                            {friends.map((friend) => (
                                <MenuItem key={friend.id} value={friend.email}>
                                    <Box display="flex" alignItems="center">
                                        <UserProfileAvatar imageUrl={friend.email} />
                                        <Typography sx={{ marginLeft: 1 }}>
                                            {friend.firstName} {friend.lastName} ({friend.email})
                                        </Typography>
                                    </Box>
                                </MenuItem>
                            ))}
                        </Select>
                        {error !== "" && (
                            <Box mt={0}>
                                <Typography variant="caption" color="error">{error}</Typography>
                            </Box>
                        )}
                    </div>
                ) : (
                    <Typography>{t('jobs.no_friends')}</Typography>
                )}
            </FormControl>
            </DialogContent>
            <Snackbar
                open={friend != null}
                autoHideDuration={3000}
                onClose={() => setFriend(null)}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                >
                <MuiAlert onClose={() => setFriend(null)} severity="success" sx={{ width: '100%' }}>
                {t('jobs.addedToTeam', { friend: friend })}
                </MuiAlert>
            </Snackbar>

            <DialogActions style={{ paddingRight: '1.5rem', paddingBottom: '1.5rem', justifyContent: 'flex-end' }}>
                <Button onClick={handleCloseDialog} variant="outlined" color="primary">{t('contacts.close')}</Button>
                {friends.length > 0 && <Button onClick={handleAddMember} variant="contained" color="primary">{t('contacts.add')}</Button>}
            </DialogActions>
        </Dialog>
    );
};

AddMemberDialog.propTypes = {
    openDialog: PropTypes.bool.isRequired,
    handleCloseDialog: PropTypes.func.isRequired,
    team: PropTypes.string,
    fetchMembers: PropTypes.func
};

export default AddMemberDialog;
