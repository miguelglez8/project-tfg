import { useState, useEffect } from 'react';
import { List, ListItemIcon, Menu, MenuItem, Paper, Typography, Button, Divider, DialogActions } from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import ArchiveIcon from '@mui/icons-material/Archive';
import NotificationsOffIcon from '@mui/icons-material/NotificationsOff';
import { NOTIFICATIONS_API } from '../../routes/api-routes';
import NotificationListItem from './NotificationListItem';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import axiosInstance from '../../services/axios';
import { useNavigate } from 'react-router-dom';
import { LOGIN_PATH } from '../../routes/app-routes';
import { clearLocalStorage } from '../../App';

const NotificationComponent = ( { onClose } ) => {
  const user = localStorage.getItem('userEmail');
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);
  const [hiddenNotifications, setHiddenNotifications] = useState([]);

  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [markAsSeenOption, setMarkAsSeenOption] = useState(false);
  const [filterOption, setFilterOption] = useState('Visibles');

  useEffect(() => {
    fetchNotifications();
    fetchHiddenNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await axiosInstance.get(NOTIFICATIONS_API + `/${user}/notHidden`);
      setNotifications(response.data);
    } catch (error) {
      if (error.response.status == 401) {
        clearLocalStorage();
        navigate(LOGIN_PATH);
      }
      console.error('Error charging not hidden notifications:', error);
    }
  };

  const fetchHiddenNotifications = async () => {
    try {
      const response = await axiosInstance.get(NOTIFICATIONS_API + `/${user}/hidden`);
      setHiddenNotifications(response.data);
    } catch (error) {
      if (error.response.status == 401) {
        clearLocalStorage();
        navigate(LOGIN_PATH);
      }
      console.error('Error charging hidden notifications:', error);
    }
  };

  const handleMenuOpen = (event, notification) => {
    setAnchorEl(event.currentTarget);
    setSelectedNotification(notification);
    setMarkAsSeenOption(!notification.read);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleMarkAsSeen = async (id) => {
    try {
      await axiosInstance.put(NOTIFICATIONS_API + `/${id}/markRead`);
      fetchNotifications();
      handleMenuClose();
    } catch (error) {
      if (error.response.status == 401) {
        clearLocalStorage();
        navigate(LOGIN_PATH);
      }
      console.error("Error mark seen: " + error);
    }
  };

  const handleMarkAsUnseen = async (id) => {
    try {
      await axiosInstance.put(NOTIFICATIONS_API + `/${id}/markRead`);
      fetchNotifications();
      handleMenuClose();
    } catch (error) {
      if (error.response.status == 401) {
        clearLocalStorage();
        navigate(LOGIN_PATH);
      }
      console.error("Error mark unseen: " + error);
    }
  };

  const handleHideNotification = async (id) => {
    try {
      await axiosInstance.put(NOTIFICATIONS_API + `/${id}/markHidden`);
      fetchNotifications();
      handleMenuClose();
    } catch (error) {
      if (error.response.status == 401) {
        clearLocalStorage();
        navigate(LOGIN_PATH);
      }
      console.error("Error hide notifications: " + error);
    }
  };
  
  const handleBackNotification =  async (id) => {
    try {
      await axiosInstance.put(NOTIFICATIONS_API + `/${id}/markHidden`);
      fetchHiddenNotifications();
      handleMenuClose();
    } catch (error) {
      if (error.response.status == 401) {
        clearLocalStorage();
        navigate(LOGIN_PATH);
      }
      console.error("Error back notifications: " + error);
    }
  };
  
  const handleShowAllNotifications = () => {
    setFilterOption('Visibles');
    fetchNotifications();
  };

  const handleShowHiddenNotification = () => {
    setFilterOption('Ocultas');
    fetchHiddenNotifications();
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', position: 'relative' }}>
      <Paper elevation={3} style={{ padding: '20px', width: '35vw', minWidth: '340px', height: '60vh', minHeight: '400px', margin: 'auto', overflowY: 'auto', alignItems: 'center' }}>
        <Typography variant="h6" style={{ textAlign: 'center', marginBottom: '10px' }}>
          <NotificationsIcon style={{ marginRight: '10px', color: 'blue' }} /> {t('notifications.title')}
        </Typography>
        <div style={{ display: 'flex', justifyContent: 'space-evenly', marginBottom: '5px' }}>
          <Button
            onClick={handleShowAllNotifications}
            style={{
              fontWeight: filterOption === 'Visibles' ? 'bold' : 'normal',
              position: 'relative',
            }}
          >
            {t('notifications.visible')}
            {notifications.length > 0 && notifications.some(notification => !notification.read) && (
              <span style={{ color: 'red', fontSize: 12, position: 'absolute', right: -10, top: '50%', transform: 'translateY(-50%)' }}>● </span>
            )}
          </Button>
          <Button
            onClick={handleShowHiddenNotification}
            style={{
              fontWeight: filterOption === 'Ocultas' ? 'bold' : 'normal',
              position: 'relative',
            }}
          >
            {t('notifications.hiddee')}
          </Button>
        </div>
        {<Divider style={{ marginBottom: '-5px'}}/>}
        {(filterOption === 'Visibles' && notifications.length === 0) || (filterOption === 'Ocultas' && hiddenNotifications.length === 0) ? (
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '35vh' }}>
            <NotificationsOffIcon style={{ fontSize: 90, color: 'gray' }} />
            <Typography variant="body1">{filterOption === 'Visibles' ? t('notifications.pending') : t('notifications.hidden')}</Typography>
          </div>
        ) : (
          <List style={{ maxHeight: 'calc(65vh - 220px)', overflowY: 'auto' }}>
            {filterOption === 'Visibles' ? (
              notifications?.map((notification, index) => (
                <div key={notification.id}>
                  {index !== 0 && <Divider />}
                  <NotificationListItem notification={notification} handleMenuOpen={handleMenuOpen} />
                </div>
              ))
            ) : (
              hiddenNotifications?.map((notification, index) => (
                <div key={notification.id}>
                  {index !== 0 && <Divider />}
                  <NotificationListItem notification={notification} handleMenuOpen={handleMenuOpen} />
                </div>
              ))
            )}
          </List>
        )}
        <Menu
          id="notification-menu"
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          style={{ marginRight: '10px', marginTop: '8px' }}
        >
          {markAsSeenOption && filterOption == 'Visibles' ? (
              <MenuItem onClick={() => handleMarkAsSeen(selectedNotification.id)}>
                <ListItemIcon>
                  <VisibilityIcon fontSize="small" style={{ color: 'blue' }} />
                </ListItemIcon>
                {t('notifications.markRead')}
              </MenuItem>
            ) : (filterOption == 'Visibles' &&
              <MenuItem onClick={() => handleMarkAsUnseen(selectedNotification.id)}>
                <ListItemIcon>
                  <VisibilityOffIcon fontSize="small" style={{ color: 'blue' }} />
                </ListItemIcon>
                {t('notifications.markUnread')}
              </MenuItem>
            )}
            {filterOption === 'Visibles' && (
              <MenuItem onClick={() => handleHideNotification(selectedNotification.id)}>
                <ListItemIcon>
                  <DeleteIcon fontSize="small" style={{ color: 'red' }} />
                </ListItemIcon>
                {t('notifications.hide')}
              </MenuItem>
            )}
            {filterOption === 'Ocultas' && (
              <MenuItem onClick={() => handleBackNotification(selectedNotification.id)}>
                <ListItemIcon>
                  <ArchiveIcon fontSize="small" style={{ color: 'blue' }} />
                </ListItemIcon>
                {t('notifications.archive')}
              </MenuItem>
            )}
        </Menu>
        <DialogActions style={{ paddingBottom: '1.5rem', alignContent: 'flex-end', marginTop: '10px' }}>
          <Button onClick={onClose} variant="outlined" color="primary">{t('contacts.close')}</Button>
        </DialogActions>
      </Paper>
    </div>
  );
};  

NotificationComponent.propTypes = {
  onClose: PropTypes.func.isRequired,
  setCount: PropTypes.func
};

export default NotificationComponent;
