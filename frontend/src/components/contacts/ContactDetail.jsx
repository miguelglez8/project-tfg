import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';
import { TextField, Button, Dialog, DialogTitle, DialogContent, DialogActions, Avatar, Grid, Typography } from '@mui/material';
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import AccessTimeFilledIcon from "@mui/icons-material/AccessTimeFilled";
import WifiOffIcon from "@mui/icons-material/WifiOff";
import CancelIcon from '@mui/icons-material/Cancel';
import PropTypes from 'prop-types';
import { checkImageExists } from '../../services/firebase';

const ContactDetail = ({ openPopupFriend, handleClosePopupFriend, friendInfo }) => {
    const { t } = useTranslation();
    const [image, setImage] = useState("");

    useEffect(() => {
        async function fetchImage() {
            setImage(await checkImageExists(friendInfo.email));
        }
        
        fetchImage();
    }, [friendInfo.email]);
  
    const formatBirthdate = (birthdate) => {
        if (birthdate != undefined) {
            const parts = birthdate.split('-');
            if (parts.length === 3) {
                const [year, month, day] = parts;
                return `${day}/${month}/${year}`;
            }
            return birthdate;
        }
    };

    return (
        <Dialog open={openPopupFriend} onClose={handleClosePopupFriend}>
            <DialogTitle style={{ color: 'black', textAlign: 'center' }}>  
                {t('contacts.friend_info')} ({friendInfo.email})
            </DialogTitle>
            <DialogContent>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '1rem' }}>
                <Avatar src={image} sx={{ width: 100, height: 100, border: `1px solid black`, marginBottom: '0.5rem' }} />
                {friendInfo.currentConnectivity === 'AVAILABLE' && (
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <CheckCircleIcon sx={{ color: '#00FF00', width: '16px', height: '16px' }} />
                    <Typography variant="body2" style={{ marginLeft: '5px' }}>{t('home_view.available')}</Typography>
                </div>
                )}
                {friendInfo.currentConnectivity === 'BUSY' && (
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <CancelIcon sx={{ color: '#FF0000', width: '16px', height: '16px' }} />
                        <Typography variant="body2" style={{ marginLeft: '5px' }}>{t('home_view.busy')}</Typography>
                    </div>
                )}
                {friendInfo.currentConnectivity === 'AWAY' && (
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <AccessTimeFilledIcon sx={{ color: '#FFD700', width: '16px', height: '16px' }} />
                        <Typography variant="body2" style={{ marginLeft: '5px' }}>{t('home_view.away')}</Typography>
                    </div>
                )}
                {friendInfo.currentConnectivity === 'OFFLINE' && (
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <WifiOffIcon sx={{ color: '#808080', width: '16px', height: '16px' }} />
                        <Typography variant="body2" style={{ marginLeft: '5px' }}>{t('home_view.offline')}</Typography>
                    </div>
                )}
            </div>                   
            <Grid container spacing={2}>
                <Grid item xs={6}>
                    <TextField
                        fullWidth
                        label={t('signup_view.firstname')}
                        value={friendInfo.firstName || ''}
                        contentEditable={false}
                        style={{ marginBottom: '1rem', marginTop: '0.7rem' }}
                        InputProps={{
                            readOnly: true
                        }}
                    />
                </Grid>
                <Grid item xs={6}>
                    <TextField
                        fullWidth
                        label={t('signup_view.lastname')}
                        value={friendInfo.lastName || ''}
                        contentEditable={false}
                        style={{ marginBottom: '1rem', marginTop: '0.7rem' }}
                        InputProps={{
                            readOnly: true
                        }}
                    />
                </Grid>
                <Grid item xs={6}>
                    <TextField
                        fullWidth
                        label={t('signup_view.role')}
                        value={friendInfo.role == 'STUDENT' ? t('recover_view.student') : t('recover_view.teacher') || ''}
                        contentEditable={false}
                        style={{ marginBottom: '1rem' }}
                        InputProps={{
                            readOnly: true
                        }}
                    />
                </Grid>
                <Grid item xs={6}>
                    <TextField
                        fullWidth
                        label={t('signup_view.birthdate')}
                        value={formatBirthdate(friendInfo.birthdate) || ''}
                        contentEditable={false}
                        style={{ marginBottom: '1rem' }}
                        InputProps={{
                            readOnly: true
                        }}
                    />
                </Grid>
                <Grid item xs={6}>
                    <TextField
                        fullWidth
                        label={t('signup_view.residence')}
                        value={friendInfo.place || ''}
                        contentEditable={false}
                        style={{ marginBottom: '1rem' }}
                        InputProps={{
                            readOnly: true
                        }}
                    />
                </Grid>
                <Grid item xs={6}>
                    <TextField
                        fullWidth
                        label={t('phone_field.personal_phone')}
                        value={friendInfo.phoneNumber || ''}
                        contentEditable={false}
                        style={{ marginBottom: '1rem' }}
                        InputProps={{
                            readOnly: true
                        }}
                    />
                </Grid>
            </Grid>
            </DialogContent>
            <DialogActions style={{ paddingRight: '1.5rem', paddingBottom: '1.5rem', paddingTop: '0rem', justifyContent: 'flex-end' }}>
                <Button onClick={handleClosePopupFriend} variant="outlined" color="primary">{t('contacts.close')}</Button>
            </DialogActions>
        </Dialog>
    );
};

ContactDetail.propTypes = {
    openPopupFriend: PropTypes.bool.isRequired,
    handleClosePopupFriend: PropTypes.func.isRequired,
    friendInfo: PropTypes.object.isRequired
};

export default ContactDetail;
