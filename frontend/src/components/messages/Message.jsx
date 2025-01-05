import { useState, useEffect } from "react";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import { useTheme } from "@mui/material/styles";
import DeleteIcon from "@mui/icons-material/Delete";
import { IconButton, Menu, MenuItem, Button, Tooltip, Avatar } from "@mui/material";
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';
import FileIcon from './FileIcon';
import { USERS_API } from "../../routes/api-routes";
import PropTypes from 'prop-types';
import { useTranslation } from "react-i18next";
import { deleteAudio, deleteFile, deleteForMe, deleteMessage, getQuerySnapShot, checkImageExists } from "../../services/firebase";
import axiosInstance from "../../services/axios";

export const formatTime = (date, i18n) => {
  if (!date) return "";

  const messageDate = date instanceof Date ? date : new Date(date);
  const now = new Date();
  const timeDifference = now.getTime() - messageDate.getTime();
  const secondsDifference = Math.floor(timeDifference / 1000);
  const minutesDifference = Math.floor(secondsDifference / 60);

  if (secondsDifference < 60) {
    return i18n.t("time.just_now");
  } else if (minutesDifference === 1) {
    return i18n.t("time.one_minute_ago");
  } else if (minutesDifference < 60) {
    return i18n.t("time.minutes_ago", { count: minutesDifference });
  } else if (minutesDifference < 120) {
    return i18n.t("time.one_hour_ago");
  }

  const hoursDifference = Math.floor(minutesDifference / 60);

  if (hoursDifference < 24) {
    return i18n.t("time.hours_ago", { count: hoursDifference });
  }

  const isSameDay =
    now.getDate() === messageDate.getDate() &&
    now.getMonth() === messageDate.getMonth() &&
    now.getFullYear() === messageDate.getFullYear();

  const isYesterday =
    now.getDate() - messageDate.getDate() === 1 &&
    now.getMonth() === messageDate.getMonth() &&
    now.getFullYear() === messageDate.getFullYear();
  
  const lang = i18n.language || 'es';
  const dayOfWeek = lang === 'es' ? 'es-ES' : 'en-US';
  const dayName = messageDate.toLocaleDateString(dayOfWeek, { weekday: "long" });

  const getWeekStart = (date) => {
    const day = date.getDay();
    const diff = (day === 0 ? -6 : 1) - day;
    const weekStart = new Date(date);
    weekStart.setDate(date.getDate() + diff);
    weekStart.setHours(0, 0, 0, 0);
    return weekStart;
  };

  const startOfCurrentWeek = getWeekStart(now);
  const startOfMessageWeek = getWeekStart(messageDate);

  const isSameWeek = startOfCurrentWeek.getTime() === startOfMessageWeek.getTime();

  if (isSameDay) {
    return messageDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } else if (isYesterday) {
    return i18n.t("time.yesterday") + " " + messageDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } else if (isSameWeek) {
    return (
      i18n.t("time.day_of_week", { day: dayName }) +
      " " +
      messageDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    );
  } else {
    const day = String(messageDate.getDate()).padStart(2, "0");
    const month = String(messageDate.getMonth() + 1).padStart(2, "0");
    return `${day}/${month} ` + messageDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }
};

const Message = ({ message, sender, saveScrollPosition, restoreScrollPosition, isJob, job }) => {
  const user = localStorage.getItem("userEmail");
  const { i18n, t } = useTranslation();

  const [image, setImage] = useState("");

  const { text, createdAt, audioURL, uid, fileURL, fileName } = message;

  const [senderName, setSenderName] = useState("");

  const messageTime = formatTime(createdAt?.toDate(), i18n);

  const isCurrentUser = user === sender;

  const theme = useTheme();
  
  const [messageDeleted, setMessageDeleted] = useState();
  const [deletedContent, setDeletedContent] = useState({ type: "", content: "" });

  useEffect(() => {
    async function fetchImage() {
      setImage(await checkImageExists(sender));
    }
    
    fetchImage();
  }, [sender]);

  const handleDownloadFile = () => {
    try {
      const link = document.createElement('a');
      link.href = fileURL;
      link.target = '_blank';
      link.download = fileName;
      link.click();
    } catch (error) {
      console.error("Error downloading file:", error);
    }
  };
  
  useEffect(() => {
    const fetchSenderName = async () => {
      try {
        if (user === sender) {
          return;
        }
        const response = await axiosInstance.get(USERS_API + `/${sender}`); 
        setSenderName(`${response.data.firstName} ${response.data.lastName}`); 
      } catch (error) {
        console.error("Error getting sender name:", error);
      }
    };

    fetchSenderName();
  }, [sender, user]);

  const [menuAnchorEl, setMenuAnchorEl] = useState(null); 

  const handleMouseDown = (event) => {
    if (event.type === 'touchstart') { 
      event.preventDefault(); 
      setMenuAnchorEl(event.currentTarget); 
    }
  };
  
  const handleContextMenu = (event) => {
    event.preventDefault(); 
    setMenuAnchorEl(event.currentTarget); 
  };
  
  const handleCloseMenu = () => {
    setMenuAnchorEl(null); 
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setMenuAnchorEl(false);
  };

  const handleDeleteMessage = async () => {
    try {
      setMessageDeleted(true);
      handleCloseMenu();
      restoreScrollPosition();
      await new Promise(resolve => setTimeout(resolve, 500));
      setMessageDeleted(false);

      saveScrollPosition();
  
      const querySnapshot = await getQuerySnapShot(uid, isJob);
  
      if (!querySnapshot.empty) {
        await deleteMessage(uid, isJob);
  
        if (fileURL) {
          await deleteFile(user, fileName, isJob, job);
  
          setDeletedContent({ type: "file", content: fileName });
        } else if (audioURL) {
          await deleteAudio(user, uid, isJob, job);
          
          setDeletedContent({ type: "audio", content: audioURL });
        } else {
          setDeletedContent({ type: "text", content: text });
        }
      }
    } catch (error) {
      console.error("Error deleting message:", error);
    }
  };
  
  const handleDeleteForCurrentUser = async () => {
    try {
      setMessageDeleted(true);
      handleCloseMenu();
      restoreScrollPosition();
      await new Promise(resolve => setTimeout(resolve, 500));
      setMessageDeleted(false);

      saveScrollPosition();

      const querySnapshot = await getQuerySnapShot(uid, isJob);

      if (!querySnapshot.empty) {
        await deleteForMe(querySnapshot, user);

        if (fileURL) {
          await deleteFile(user, fileName, isJob, job);

          setDeletedContent({ type: "file", content: fileName });
        } else if (audioURL) {
          await deleteAudio(user, uid), isJob, job;
          
          setDeletedContent({ type: "audio", content: audioURL });
        } else {
          setDeletedContent({ type: "text", content: text });
        }
      }

    } catch (error) {
      console.error("Error deleting message for current user:", error);
    } 
  };  
  
  return (
    <Paper
      elevation={3}
      onContextMenu={handleContextMenu}
      onTouchStart={handleMouseDown}
      style={{
        padding: "10px",
        margin: "10px",
        alignSelf: isCurrentUser ? "flex-end" : "flex-start",
        backgroundColor: !isCurrentUser ? theme.palette.primary.main : "#E0E0E0",
        borderRadius: "10px",
        textAlign: isCurrentUser ? "right" : "left",
    }}
  >
    {isCurrentUser && <Typography variant="body2">{messageTime}</Typography>}
    {!isCurrentUser && (
      <div style={{ display: "flex" }}>
        <Tooltip title={sender}>
          <Avatar alt="Friend" src={image} style={{ marginRight: "5px" }} />
        </Tooltip>
        <div style={{ flexDirection: "column", marginLeft: "5px" }}>
          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>{senderName}</Typography>
          <Typography variant="body2">{messageTime}</Typography>
        </div>
      </div>
    )}
    {fileURL ? (
    <div style={{ textAlign: isCurrentUser ? 'right' : 'left' }}>
      <Typography variant="body1">{t('chat.file')}{fileName}</Typography>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: isCurrentUser ? 'flex-end' : 'flex-start' }}>
        <FileIcon fileName={fileName} />
        <Tooltip title={t('chat.download_file')}>
        <Button onClick={handleDownloadFile} variant="contained" color={!isCurrentUser ? "inherit" : "primary"}>
          {t('chat.download')}
        </Button>
        </Tooltip>
      </div>
    </div>
  ) : (
    <div style={{ textAlign: isCurrentUser ? 'right' : 'left' }}>
      {audioURL ? (
        <div style={{ display: "flex", alignItems: "center", marginTop: '10px', justifyContent: isCurrentUser ? 'flex-end' : 'flex-start' }}>
          <Tooltip title={t('chat.audio')}>
            <audio controls>
              <source src={audioURL} type="audio/mp3" />
                {t('chat.suport_audio')}
            </audio>
          </Tooltip>
        </div>
      ) : (
        <Typography variant="body1" style={{ 
          wordWrap: 'break-word',
          wordBreak: 'break-all'
         }}>{text}</Typography>
      )}
    </div>
  )}
    {isCurrentUser && (
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleCloseMenu}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <MenuItem onClick={() => handleDeleteForCurrentUser()}>
          <IconButton size="small" color="primary">
            <DeleteIcon fontSize="small" />
          </IconButton>
          {t('chat.delete_me')}
        </MenuItem>
        <MenuItem onClick={() => handleDeleteMessage()}>
          <IconButton size="small" color="error">
            <DeleteIcon fontSize="small" />
          </IconButton>
          {t('chat.delete_all')}
        </MenuItem>
      </Menu>
    )}

    <Snackbar open={messageDeleted} autoHideDuration={500} onClose={handleSnackbarClose} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
      <MuiAlert onClose={handleSnackbarClose} severity="success" sx={{ width: '100%' }}>
        {deletedContent.type === "audio" ? t('chat.delete_audio') : deletedContent.type === "file" ? `${t('chat.delete_file1')}${deletedContent.content}${t('chat.delete_file2')}` : t('chat.delete_msg')}
      </MuiAlert>
    </Snackbar>
  </Paper>
  );
};

Message.propTypes = {
  message: PropTypes.object.isRequired,
  sender: PropTypes.string.isRequired,
  saveScrollPosition: PropTypes.func.isRequired,
  restoreScrollPosition: PropTypes.func.isRequired,
  isJob: PropTypes.bool,
  job: PropTypes.string
};

export default Message;

