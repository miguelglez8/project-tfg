import PropTypes from 'prop-types';
import { ListItemText, Tooltip, IconButton, Grid } from '@mui/material';
import { useTranslation } from 'react-i18next';
import CallIcon from "@mui/icons-material/Call";
import { handleSend } from '../../services/zegocloud';
import { Videocam } from '@mui/icons-material';

const FriendToCall = ({ contact }) => {
    const { t } = useTranslation();

    const handleCall = () => {
        handleSend('call', [contact]);
    };

    const handleVideoCall = () => {
        handleSend('videoCall', [contact]);
    };

    return (
        <Grid container spacing={2} alignItems="center" justifyContent="center">
            <Grid item xs={6}>
                <ListItemText primary={<b>{`${contact.firstName} ${contact.lastName}`}</b>} />
            </Grid>
            <Grid item xs={6} container justifyContent="flex-end" alignItems="center">
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

FriendToCall.propTypes = {
    contact: PropTypes.object.isRequired
};

export default FriendToCall;
