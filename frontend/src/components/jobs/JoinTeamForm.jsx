import { useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button } from '@mui/material';
import PropTypes from 'prop-types';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { JOBINQUIRIES_API, JOBS_API, NOTIFICATIONS_API } from '../../routes/api-routes';
import axiosInstance from '../../services/axios';
import { useNavigate } from 'react-router-dom';
import { LOGIN_PATH } from '../../routes/app-routes';
import { clearLocalStorage } from '../../App';

const JoinTeamForm = ({ setUsername, openPopup, handleClosePopup, setPopup, setSent }) => {
    const user = localStorage.getItem('userEmail');
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { register, formState: { errors }, setError, handleSubmit, reset } = useForm();

    useEffect(() => {
        if (openPopup) {
            reset({
                title: '',
                message: '',
            });
        }
    }, [openPopup, reset]);

    async function fetchSentRequests() {
        try {
            const response = await axiosInstance.get(JOBINQUIRIES_API + `/sent?senderEmail=${user}`);
            setSent(response.data);
        } catch (error) {
            if (error.response.status == 401) {
                clearLocalStorage();
                navigate(LOGIN_PATH);
            }
            console.error('Error charging sent friendship requests:', error);
        }
    }
    
    const getWorkByTitle = async (title) => {
        const response = await axiosInstance.get(JOBS_API + `/${title}/job`);
        return response.data;
    };

    const sendRequest = async (data) => {
        const jobRequest = {
            sender: user,
            receiver: data.title,
            message: data.message
        };

        try {
            await axiosInstance.post(JOBINQUIRIES_API + `/job-inquiries`, jobRequest);  
        } catch (error) {
            if (error.response && error.response.status === 400) {
                const errorMessage = error.response.data;
                if (errorMessage === "You are already in the team") {
                    setError('title', {
                        type: 'required',
                        message: t('jobs.error_already_in_team'),
                    });
                } else {
                    setError('title', {
                        type: 'required',
                        message: t('jobs.error_already_sent_request'),
                    });
                }
            } else if (error.response.status == 401) {
                clearLocalStorage();
                navigate(LOGIN_PATH);
            }
            return;
        }

        await axiosInstance.post(NOTIFICATIONS_API + `/push`, {
            type: "INQUIRIES",
            receiver: data.title,
            sender: user,
            read: false,
            hidden: false,
            date: new Date(),
        });

        setUsername(data.title);
        handleClosePopup();
        setPopup(true);
        fetchSentRequests();
    };

    return (
        <Dialog open={openPopup} onClose={handleClosePopup}>
            <DialogTitle style={{ textAlign: 'center' }}>{t('jobs.dialog_title')}</DialogTitle>
            <DialogContent>
                <TextField
                    fullWidth
                    required
                    autoFocus
                    label={t('jobs.title')}
                    variant='outlined'
                    style={{ marginBottom: '1rem', marginTop: '0.7rem' }}
                    {...register('title', {
                        required: t('jobs.error_valid_title'),
                        validate: async (value) => {
                            try {
                                await getWorkByTitle(value);
                            } catch (error) {
                                if (error.response.status == 401) {
                                    clearLocalStorage();
                                    navigate(LOGIN_PATH);
                                } else {
                                    return t('jobs.error_work_not_exist');
                                }
                            }                 
                        }
                    })}
                    error={errors.title}
                    helperText={errors.title ? errors.title.message : ""}
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

JoinTeamForm.propTypes = {    
    setUsername: PropTypes.func.isRequired,
    openPopup: PropTypes.bool.isRequired,
    handleClosePopup: PropTypes.func.isRequired,
    setPopup: PropTypes.func.isRequired,
    setSent: PropTypes.func.isRequired
};

export default JoinTeamForm;
