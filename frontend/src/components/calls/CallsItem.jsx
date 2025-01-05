import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import {
  Tooltip,
  Grid,
  ListItem,
  ListItemText,
  Typography,
  IconButton,
} from "@mui/material";
import CallIcon from "@mui/icons-material/Call";
import { useTranslation } from "react-i18next";
import UserProfileAvatar from "../home/UserProfileAvatar";
import { handleSend } from '../../services/zegocloud';
import { CallEnd, CallMade, CallMissed, CallReceived, Phone, Videocam } from "@mui/icons-material";
import { formatTime } from "../messages/Message";

const CallsItem = ({ call }) => {
  const { t, i18n } = useTranslation();

  const { userCall, firstName, lastName, type, date, callType, duration } = call;
  const [ typeIcon, setTypeIcon ] = useState(null);
  const [ callTypeIcon, setCallTypeIcon ] = useState(null);

  useEffect(() => {
    determineTypeIcon();
    determineCallTypeIcon();
  }, []);

  const determineTypeIcon = () => {
    if (type === "INCOMING") {
      setTypeIcon(<CallReceived />);
    } else if (type === "OUTGOING") {
      setTypeIcon(<CallMade />);
    } else if (type === "MISS") {
      setTypeIcon(<CallMissed />);
    } else {
      setTypeIcon(<CallEnd />);
    }
  };

  const determineCallTypeIcon = () => {
    if (callType === "CALL") {
      setCallTypeIcon(<Phone />);
    } else {
      setCallTypeIcon(<Videocam />);
    }
  };

  const handleCall = () => {
    handleSend('call', [{email: userCall}]);
  };

  const handleVideoCall = () => {
    handleSend('videoCall', [{email: userCall}]);
  };

  const formatDate = () => {
    return formatTime(date, i18n);
  };

  function parseTime(stringTime) {
    const parts = stringTime?.split(':');

    const hours = parseInt(parts[0], 10);
    const minutes = parseInt(parts[1], 10);
    const seconds = parseInt(parts[2], 10);

    let description = '';
    
    if (hours > 0) {
      description += `${hours}h`;
    }

    if (minutes > 0) {
      if (description) {
        description += ' ';
      }
      description += `${minutes}m`;
    }

    if (seconds > 0) {
      if (description) {
        description += ' ';
      }
      description += `${seconds}s`;
    }

    return description || '0s';
  }

  return (
    <ListItem alignItems="flex-start">
      <UserProfileAvatar imageUrl={userCall} />
      <Grid container justifyContent="space-between" alignItems="center">
        <Grid item xs={8}>
          <ListItemText
            primary={
              <Typography variant="subtitle1" component="div">
                <Tooltip title={callType === "VIDEOCALL" ? t("calls.videocall") : t("calls.call")}>
                  <IconButton size="small">{callTypeIcon}</IconButton>
                </Tooltip>
                {firstName} {lastName}
              </Typography>
            }
            secondary={
              <div style={{ display: 'flex' }}>
                
                <IconButton size="small">{typeIcon}</IconButton>
                <Typography variant="body2" color="text.secondary">
                  {type === "INCOMING"
                    ? t("calls.incoming")
                    : (type === "OUTGOING" 
                    ? t("calls.outgoing")
                    : (type === "CANCEL" 
                    ? t("calls.cancell")
                    : t("calls.miss")))}{" "}
                    - {formatDate()} {(type === "OUTGOING" || type === "INCOMING" ? "(" + parseTime(duration) + ")" : "")}
                </Typography>
              </div>   
            }
          />
        </Grid>
        <Grid item xs={4}>
          <Grid
            container
            justifyContent="flex-end"
            alignItems="center"
            spacing={1}
          >
            <Grid item>
              <Tooltip title={t("chat.call")}>
                <IconButton style={{ color: 'green' }} onClick={handleCall}>
                  <CallIcon />
                </IconButton>
              </Tooltip>
            </Grid>
            <Grid item>
              <Tooltip title={t("chat.videocall")}>
                <IconButton style={{ color: 'blue' }} onClick={handleVideoCall}>
                  <Videocam />
                </IconButton>
              </Tooltip>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </ListItem>
  );
};

CallsItem.propTypes = {
  call: PropTypes.shape({
    id: PropTypes.number.isRequired,
    firstName: PropTypes.string.isRequired,
    lastName: PropTypes.string.isRequired,
    userCall: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    duration: PropTypes.string.isRequired,
    callType: PropTypes.string.isRequired,
    date: PropTypes.string.isRequired,
  }).isRequired,
};

export default CallsItem;
