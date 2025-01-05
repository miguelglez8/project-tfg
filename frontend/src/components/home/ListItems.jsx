import * as React from 'react';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import PeopleIcon from '@mui/icons-material/People';
import ChatIcon from '@mui/icons-material/Chat';
import WorkIcon from '@mui/icons-material/Work';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import EventIcon from '@mui/icons-material/Event';
import CallIcon from '@mui/icons-material/Call';
import BarChartIcon from '@mui/icons-material/BarChart';
import HomeIcon from '@mui/icons-material/Home';
import DescriptionIcon from '@mui/icons-material/Description';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import { useNavigate } from "react-router-dom";
import { CALENDAR_PATH, CALLS_PATH, CHAT_PATH, CONTACTS_PATH, HOME_PATH, INFORMS_PATH, JOBS_PATH, KANBAN_PATH, LOGIN_PATH, STATS_PATH } from '../../routes/app-routes';
import Tooltip from '@mui/material/Tooltip';
import { useEffect, useState } from 'react';
import { FRIENDS_API, USERS_API } from '../../routes/api-routes';
import { getDocsReceiver, getDocsSender, getReceiver, getSender } from '../../services/firebase';
import axiosInstance from '../../services/axios';
import { clearLocalStorage } from '../../App';

export const MainListItems = ({ closeDrawer, open }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleListItemClick = (route) => {
    navigate(route);
    closeDrawer();
  };

  return (
    <React.Fragment>
      <ListItemButton onClick={() => handleListItemClick(HOME_PATH)}>
        <Tooltip title={t('home_view.init')}>
          <ListItemIcon>
            <HomeIcon />
          </ListItemIcon>
        </Tooltip>
        <ListItemText primary={t('home_view.init')} />
      </ListItemButton>
      <ListItemButton onClick={() => handleListItemClick(JOBS_PATH)}>
        {!open ? (
          <Tooltip title={t('home_view.jobs')}>
            <ListItemIcon>
              <WorkIcon />
            </ListItemIcon>
          </Tooltip>
        ) : (
          <ListItemIcon>
            <WorkIcon />
          </ListItemIcon>
        )}
        <ListItemText primary={t('home_view.jobs')} />
      </ListItemButton>
      <ListItemButton onClick={() => handleListItemClick(KANBAN_PATH)}>
        {!open ? (
          <Tooltip title={t('home_view.tasks')}>
            <ListItemIcon>
              <AssignmentTurnedInIcon />
            </ListItemIcon>
          </Tooltip>
        ) : (
          <ListItemIcon>
            <AssignmentTurnedInIcon />
          </ListItemIcon>
        )}
        <ListItemText primary={t('home_view.tasks')} />
      </ListItemButton>
      <ListItemButton onClick={() => handleListItemClick(CALENDAR_PATH)}>
        {!open ? (
          <Tooltip title={t('home_view.calendar')}>
            <ListItemIcon>
              <EventIcon />
            </ListItemIcon>
          </Tooltip>
        ) : (
          <ListItemIcon>
            <EventIcon />
          </ListItemIcon>
        )}
        <ListItemText primary={t('home_view.calendar')} />
      </ListItemButton>
      <ListItemButton onClick={() => handleListItemClick(INFORMS_PATH)}>
        {!open ? (
          <Tooltip title={t('home_view.reports')}>
            <ListItemIcon>
              <BarChartIcon />
            </ListItemIcon>
          </Tooltip>
        ) : (
          <ListItemIcon>
            <BarChartIcon />
          </ListItemIcon>
        )}
        <ListItemText primary={t('home_view.reports')} />
      </ListItemButton>
      <ListItemButton onClick={() => handleListItemClick(STATS_PATH)}>
        {!open ? (
          <Tooltip title={t('home_view.stats')}>
            <ListItemIcon>
              <DescriptionIcon />
            </ListItemIcon>
          </Tooltip>
        ) : (
          <ListItemIcon>
            <DescriptionIcon />
          </ListItemIcon>
        )}
        <ListItemText primary={t('home_view.stats')} />
      </ListItemButton>
    </React.Fragment>
  );
};

export const SecondaryListItems = ({ closeDrawer, open }) => {
  const user = localStorage.getItem('userEmail');
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [receivedRequests, setReceivedRequests] = useState([]);
  const [messages, setMessages] = useState(null);
  const [contacts, setContacts] = useState([]);

  const handleListItemClick = (route) => {
    navigate(route);
    closeDrawer();
  };

  useEffect(() => {
    async function fetchUserFriends() {
        try {
            const response = await axiosInstance.get(USERS_API + `/${user}/friends`);
            const sortedContacts = response.data.sort((a, b) => {
                const nameComparison = a.firstName.localeCompare(b.firstName);
                if (nameComparison !== 0) {
                  return nameComparison;
                }
                return a.lastName.localeCompare(b.lastName);
            });
            setContacts(sortedContacts);
        } catch (error) {
            console.error('Error charging user information', error);
        }
    }

    fetchUserFriends();
  }, [user]);

  useEffect(() => {
    const fetchReceivedRequests = async () => {
        try {
          const response = await axiosInstance.get(FRIENDS_API + `/received?receiverEmail=${user}`);
          setReceivedRequests(response.data);
        } catch (error) {
          if (error.response.status == 401) {
            clearLocalStorage();
            navigate(LOGIN_PATH);
          }
          console.error('Error charging received friendship requests:', error);
        }
    };

    fetchReceivedRequests();
  }, [user, navigate]);

  useEffect(() => {
    async function fetchData() {
      const lastMessages = await getLastMessages(contacts);
      const hasUnseenMessage = lastMessages.some(message => {
        return message.sender !== user && !message.seenByRecipient && message.text !== t('chat.startConversation');
      });
      setMessages(hasUnseenMessage);
    }

    fetchData();
  }, [contacts, user, t]);

  const getLastMessages = async (contacts) => {
    const messagesPromises = contacts.map(async contact => {
      const senderQuery = getSender(user, contact);
      const receiverQuery = getReceiver(contact, user);

      const [senderSnapshot, receiverSnapshot] = await Promise.all([
        getDocsSender(senderQuery),
        getDocsReceiver(receiverQuery)
      ]);

      const senderMessage = senderSnapshot.empty ? null : senderSnapshot.docs[0].data();
      const receiverMessage = receiverSnapshot.empty ? null : receiverSnapshot.docs[0].data();

      const lastMessage =
        (!senderMessage && !receiverMessage) ? { text: t('chat.startConversation') } :
        (!senderMessage) ? receiverMessage :
        (!receiverMessage) ? senderMessage :
        (senderMessage.createdAt > receiverMessage.createdAt) ? senderMessage : receiverMessage;

      return lastMessage;
    });

    return Promise.all(messagesPromises);
  };

  return (
    <React.Fragment>
      <ListItemButton onClick={() => handleListItemClick(CONTACTS_PATH)}>
        {!open ? (
          <Tooltip title={t('home_view.contacts')}>
            <ListItemIcon>
              <PeopleIcon />
                {receivedRequests.length > 0 && <span style={{ color: 'red', marginLeft: '5px' }}>&#8226;</span>}
            </ListItemIcon>
          </Tooltip>
        ) : (
          <ListItemIcon>
            <PeopleIcon />
          </ListItemIcon>
        )}
        <ListItemText primary={t('home_view.contacts')} />
      </ListItemButton>
      <ListItemButton onClick={() => handleListItemClick(CHAT_PATH)}>
        {!open ? (
          <Tooltip title={t('home_view.chat')}>
            <ListItemIcon>
              <ChatIcon />
                {messages && <span style={{ color: 'red', marginLeft: '5px' }}>&#8226;</span>}
            </ListItemIcon>
          </Tooltip>
        ) : (
          <ListItemIcon>
            <ChatIcon />
          </ListItemIcon>
        )}
        <ListItemText primary={t('home_view.chat')} />
      </ListItemButton>
      <ListItemButton onClick={() => handleListItemClick(CALLS_PATH)}>
        {!open ? (
          <Tooltip title={t('home_view.calls')}>
            <ListItemIcon>
              <CallIcon />
            </ListItemIcon>
          </Tooltip>
        ) : (
          <ListItemIcon>
            <CallIcon />
          </ListItemIcon>
        )}
        <ListItemText primary={t('home_view.calls')} />
      </ListItemButton>
    </React.Fragment>
  );
};

MainListItems.propTypes = {
  closeDrawer: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired
};

SecondaryListItems.propTypes = {
  closeDrawer: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired
};
