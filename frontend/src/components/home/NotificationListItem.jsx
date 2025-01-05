import { ListItem, ListItemIcon, ListItemText, IconButton, Tooltip, Avatar } from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import PropTypes from 'prop-types';
import UserProfileAvatar from './UserProfileAvatar';
import LockIcon from '@mui/icons-material/Lock';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import ChatIcon from '@mui/icons-material/Chat';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import EventIcon from '@mui/icons-material/Event';
import CallIcon from '@mui/icons-material/Call';
import { useTranslation } from 'react-i18next';
import { formatTime } from '../messages/Message';
import { Videocam } from '@mui/icons-material';

const NotificationListItem = ({ notification, handleMenuOpen }) => {
  const { t, i18n } = useTranslation();

  const getIconForNotificationType = (type) => {
    switch (type) {
      case "WELCOME":
        return <Avatar alt="Logo" src='/logo.png' />;
      case "RECOVER":
        return <AccountCircleIcon sx={{ fontSize: 'big', justifyContent: 'center', marginLeft: '8px' }} />;
      case "CHANGE":
        return <LockIcon sx={{ fontSize: 'big', justifyContent: 'center', marginLeft: '8px' }} />;
      case "FRIENDSHIP":
        return <UserProfileAvatar imageUrl={notification.sender} />;
      case "FRIEND":
        return <UserProfileAvatar imageUrl={notification.sender} />;
      case "TASK":
        return <AssignmentTurnedInIcon sx={{ fontSize: 'big', justifyContent: 'center', marginLeft: '8px' }} />;
      case "EVENT":
      case "EVENT_DELETE":
      case "EVENT_MODIFY":
      case "EVENT_EXIT":
        return <EventIcon sx={{ fontSize: 'big', justifyContent: 'center', marginLeft: '8px' }} />;
      case "CONVERSATION":
        return <ChatIcon sx={{ fontSize: 'big', justifyContent: 'center', marginLeft: '8px' }} />;
      case "CALL":
        return <CallIcon sx={{ fontSize: 'big', justifyContent: 'center', marginLeft: '8px' }} />;
      case "VIDEOCALL":
        return <Videocam sx={{ fontSize: 'big', justifyContent: 'center', marginLeft: '8px' }} />;
      default:
        return <UserProfileAvatar imageUrl={notification.titleTeam} />;
    }
  };
      
  const getTitleForSender = () => {
    switch (notification.type) {
      case "WELCOME":
        return t('notifications.welcome');
      case "RECOVER":
        return t('notifications.recover');
      case "CHANGE":
        return t('notifications.change');
      case "FRIENDSHIP":
        return t('notifications.friendship');
      case "FRIEND":
        return t('notifications.friend');
      case "TASK":
        return t('notifications.task');
      case "EVENT":
        return t('notifications.event');
      case "EVENT_DELETE":
        return t('notifications.event_delete');
      case "EVENT_EXIT":
        return t('notifications.event_exit'); 
      case "EVENT_MODIFY":
        return t('notifications.event_modify');
      case "CALL":
        return t('notifications.lost_call');
      case "VIDEOCALL":
        return t('notifications.lost_video_call');
      case "CONVERSATION":
        return t('notifications.conversation');
      case "CONVERSATION_JOB":
        return t('notifications.conversation_job');
      case "INQUIRIES":
        return t('notifications.inquirie');
      case "INQUIRIES_ACCEPT":
        return t('notifications.inquirie_accept');
      case "JOB_ADD_MEMBER":
        return t('notifications.add_member');
      case "JOB_LEAVE":
        return t('notifications.leave_member');
      case "JOB_DELETE_MEMBER":
        return t('notifications.delete');
      case "JOB_PERMISSIONS":
        return t('notifications.permissions');
      case "JOB_DELETE":
        return t('notifications.deleted_job');
      case "JOB_EXIT":
        return t('notifications.exit_job');
      case "JOB_NOTE":
        return t('notifications.add_note');
      default:
        return null;
    }
  };
  
  const getDescriptionForReceiver = () => {
    switch (notification.type) {
      case "WELCOME":
        return t('notifications.welcome_to_platform');
      case "RECOVER":
        return t('notifications.recover_account');
      case "CHANGE":
        return t('notifications.change_password');
      case "FRIENDSHIP":
        return t('notifications.friendship_request', { user: notification.sender });
      case "FRIEND":
        return t('notifications.friend_accepted', { user: notification.sender });
      case "TASK":
        return t('notifications.new_task', { user: notification.sender, job: notification.titleTeam });
      case "EVENT":
        return t('notifications.new_event', { user: notification.sender, job: notification.titleTeam });
      case "EVENT_DELETE":
        return t('notifications.new_event_delete', { user: notification.sender, job: notification.titleTeam });
      case "EVENT_EXIT":
        return t('notifications.new_event_exit', { user: notification.sender, job: notification.titleTeam });
      case "EVENT_MODIFY":
        return t('notifications.new_event_modify', { user: notification.sender, job: notification.titleTeam });
      case "CALL":
        return notification.titleTeam === "" ? t('notifications.new_call_lost', { user: notification.sender })
        : t('notifications.new_group_call_lost', { user: notification.sender, job: notification.titleTeam });
      case "VIDEOCALL":
        return notification.titleTeam === "" ? t('notifications.new_video_call_lost', { user: notification.sender })
        : t('notifications.new_group_video_call_lost', { user: notification.sender, job: notification.titleTeam });
      case "CONVERSATION":
        return t('notifications.new_conversation', { user: notification.sender });
      case "CONVERSATION_JOB":
        return t('notifications.new_conversation_job', { user: notification.sender, job: notification.titleTeam });
      case "INQUIRIES":
        return t('notifications.new_request', { user: notification.sender, job: notification.titleTeam });
      case "INQUIRIES_ACCEPT":
        return t('notifications.accept_request', { user: notification.sender, job: notification.titleTeam });
      case "JOB_ADD_MEMBER":
        return t('notifications.add_to_job', { user: notification.sender, job: notification.titleTeam });
      case "JOB_LEAVE":
        return t('notifications.leave_to_job', { user: notification.sender, job: notification.titleTeam });
      case "JOB_DELETE_MEMBER":
        return t('notifications.delete_member', { job: notification.titleTeam });
      case "JOB_PERMISSIONS":
        return t('notifications.permissions_member', { user: notification.sender, job: notification.titleTeam });
      case "JOB_DELETE":
        return t('notifications.deleted_all_members', { user: notification.sender, job: notification.titleTeam });
      case "JOB_EXIT":
        return t('notifications.exit', { user: notification.sender, job: notification.titleTeam });
      case "JOB_NOTE":
        return t('notifications.note', { user: notification.sender, job: notification.titleTeam });
      default:
        return null;
    }
  };

  return (
    <ListItem 
      disablePadding
      style={{ 
        opacity: 1, backgroundColor: notification.read ? 'inherit' : '#e3f2fd', 
        borderRadius: notification.read ? '0' : '10px',
        margin: '5px 0'
      }}
    >
      <ListItemIcon>
        {notification.read ? null : <span style={{ color: 'blue', marginRight: '3px', alignContent: 'center' }}>●</span>}
        {getIconForNotificationType(notification.type)}
      </ListItemIcon>
      <ListItemText primary={getTitleForSender()} secondary={getDescriptionForReceiver()} style={{ marginLeft: '10px' }} />
      <ListItemText secondary={formatTime(notification.date, i18n)} style={{ alignContent: 'flex-end', textAlign: 'end' }} />
      <Tooltip title={t('home_view.options')}>
        <IconButton
          aria-controls="notification-menu"
          aria-haspopup="true"
          onClick={(event) => handleMenuOpen(event, notification)}
        >
          <MoreVertIcon />
        </IconButton>
      </Tooltip>
    </ListItem>
  );
};

NotificationListItem.propTypes = {
  notification: PropTypes.object.isRequired,
  handleMenuOpen: PropTypes.func.isRequired
};

export default NotificationListItem;
