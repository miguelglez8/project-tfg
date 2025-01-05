import { Avatar, IconButton, Typography, Grid, Tooltip } from "@mui/material";
import CallIcon from "@mui/icons-material/Call";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import AccessTimeFilledIcon from "@mui/icons-material/AccessTimeFilled";
import WifiOffIcon from "@mui/icons-material/WifiOff";
import { useTranslation } from "react-i18next";
import PropTypes from 'prop-types';
import { checkImageExists } from '../../services/firebase';
import { useEffect, useState } from 'react';
import { handleSend } from '../../services/zegocloud';
import { Videocam } from "@mui/icons-material";

const TopBar = ( { selectedFriend } ) => {
    const { t } = useTranslation();

    const [image, setImage] = useState("");
    const [connectivityStatus, setConnectivityStatus] = useState(selectedFriend.currentConnectivity);

    useEffect(() => {
        async function fetchImage() {
            setImage(await checkImageExists(selectedFriend.email));
        }
        
        fetchImage();
    }, [selectedFriend.email]);

    useEffect(() => {
        setConnectivityStatus(selectedFriend.currentConnectivity);
    }, [selectedFriend.currentConnectivity]);

    const handleCall = () => {
        handleSend('call', [selectedFriend]);
    };

    const handleVideoCall = () => {
        handleSend('videoCall', [selectedFriend]);
    };

    return (
        <Grid container spacing={2} alignItems="center">
            <Grid item>
                <Avatar alt="Friend" src={image} />
            </Grid>
            <Grid item xs>
                <Typography variant="h6">{selectedFriend.firstName} {selectedFriend.lastName}</Typography>
                {connectivityStatus  === 'AVAILABLE' && (
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <CheckCircleIcon sx={{ color: '#00FF00', width: '16px', height: '16px' }} />
                    <Typography variant="body2" style={{ marginLeft: '5px' }}>{t('home_view.available')}</Typography>
                </div>
                )}
                {connectivityStatus  === 'BUSY' && (
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <CancelIcon sx={{ color: '#FF0000', width: '16px', height: '16px' }} />
                    <Typography variant="body2" style={{ marginLeft: '5px' }}>{t('home_view.busy')}</Typography>
                </div>
                )}
                {connectivityStatus  === 'AWAY' && (
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <AccessTimeFilledIcon sx={{ color: '#FFD700', width: '16px', height: '16px' }} />
                    <Typography variant="body2" style={{ marginLeft: '5px' }}>{t('home_view.away')}</Typography>
                </div>
                )}
                {connectivityStatus  === 'OFFLINE' && (
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <WifiOffIcon sx={{ color: '#808080', width: '16px', height: '16px' }} />
                    <Typography variant="body2" style={{ marginLeft: '5px' }}>{t('home_view.offline')}</Typography>
                </div>
                )}
            </Grid>
            <Grid item>
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

TopBar.propTypes = {
    selectedFriend: PropTypes.object.isRequired
};

export default TopBar;