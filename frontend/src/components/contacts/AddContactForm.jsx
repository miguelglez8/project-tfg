import { useForm } from 'react-hook-form';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { TextField, Button, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { FRIENDS_API, USERS_API, NOTIFICATIONS_API } from '../../routes/api-routes';
import PropTypes from 'prop-types';
import axiosInstance from '../../services/axios';
import { useNavigate } from 'react-router-dom';
import { LOGIN_PATH } from '../../routes/app-routes';
import { clearLocalStorage } from '../../App';

const AddContactForm = ({ setUsername, openPopup, handleClosePopup, setSnackbarOpen, setOpenPopup, fetchSentRequests }) => {
    const user = localStorage.getItem('userEmail');
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { register, formState: { errors }, setError, handleSubmit, reset } = useForm();

    useEffect(() => {
        if (openPopup) {
            reset({
                userName: '',
                message: '',
            });
        }
    }, [openPopup, reset]);

    const getUserByEmail = async (email) => {
        const response = await axiosInstance.get(USERS_API + `/${email}`);
        return response.data;
    };

    const sendRequest = async (data) => {
        const friendshipRequest = {
            senderEmail: user,
            receiverEmail: data.userName,
            message: data.message
        };

        try {
            await axiosInstance.post(FRIENDS_API + `/send`, friendshipRequest);
        } catch (error) {
            if (error.response && error.response.status === 400) {
                const errorMessage = error.response.data;
                if (errorMessage === "You have already sent him a request") {
                    setError('userName', {
                        type: 'required',
                        message: t('contacts.sent'),
                    });
                } else {
                    setError('userName', {
                        type: 'required',
                        message: t('contacts.friends'),
                    });
                }
                setOpenPopup(true);
            } else {
                if (error.response.status == 401) {
                    clearLocalStorage();
                    navigate(LOGIN_PATH);
                }
            }
            return;
        }

        await axiosInstance.post(NOTIFICATIONS_API + `/push`, {
            type: "FRIENDSHIP",
            receiver: data.userName,
            sender: user,
            read: false,
            hidden: false,
            date: new Date()
        });
        setUsername(data.userName);

        setSnackbarOpen(true);
        setOpenPopup(false);
        fetchSentRequests();
    }

    return (
        <Dialog open={openPopup} onClose={handleClosePopup}>
            <DialogTitle style={{ textAlign: 'center' }}>
                {t('contacts.friendship_send')}
            </DialogTitle>
            <DialogContent>
                <TextField
                    fullWidth
                    required
                    autoFocus
                    label={t('signup_view.email')}
                    style={{ marginBottom: '1rem', marginTop: '0.7rem' }}
                    variant='outlined'
                    {...register('userName', {
                        required: t('contacts.email_valid'),
                        pattern: {
                            value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                            message: t('contacts.email_valid')
                        },
                        validate: async (value) => {
                            if (value == user) {
                                return t('contacts.not_valid');
                            }
                            try {
                                await getUserByEmail(value);
                            } catch (error) {
                                return t('contacts.not_register');
                            }
                        }
                    })}
                    error={errors.userName}
                    helperText={errors.userName ? errors.userName.message : ""}
                />
                <TextField
                    fullWidth
                    label={t('signup_view.message')}
                    multiline
                    rows={4}
                    {...register('message', { maxLength: { value: 255, message: t('contacts.error_length') } })}
                    error={errors.message}
                    helperText={errors.message ? errors.message.message : ""}
                />
            </DialogContent>
            <DialogActions style={{ paddingRight: '1.5rem', paddingBottom: '1.5rem', justifyContent: 'flex-end' }}>
                <Button onClick={handleClosePopup} variant="outlined" color="primary">{t('contacts.cancel_title')}</Button>
                <Button onClick={handleSubmit(sendRequest)} variant="contained" color="primary">{t('contacts.send_title')}</Button>
            </DialogActions>
        </Dialog>
    );
};

AddContactForm.propTypes = {
    setUsername: PropTypes.func.isRequired,
    openPopup: PropTypes.bool.isRequired,
    handleClosePopup: PropTypes.func.isRequired,
    setSnackbarOpen: PropTypes.func.isRequired,
    setOpenPopup: PropTypes.func.isRequired,
    fetchSentRequests: PropTypes.func.isRequired
};

export default AddContactForm;
