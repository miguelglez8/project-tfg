import { ListItem, ListItemAvatar, ListItemText, IconButton, Typography, Tooltip } from '@mui/material';
import { MoreVert } from '@mui/icons-material';
import PropTypes from 'prop-types';
import UserProfileAvatar from '../home/UserProfileAvatar';
import { useTranslation } from 'react-i18next';
import { useEffect, Fragment, useState } from 'react';
import axiosInstance from '../../services/axios';
import { JOBINQUIRIES_API, JOBS_API } from '../../routes/api-routes';
import { useNavigate } from 'react-router-dom';
import { LOGIN_PATH } from '../../routes/app-routes';
import { getDocsSender, getLastMessageJob } from '../../services/firebase';
import { clearLocalStorage } from '../../App';

const TeamItem = ({ team, handleMenuClick }) => {
  const user = localStorage.getItem('userEmail');
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [receivedRequests, setReceivedRequests] = useState([]);
  const [admin, setAdmin] = useState(false);
  const [messages, setMessages] = useState(false);

  useEffect(() => {
    const isAdmin = async () => {
      try {
        const response = await axiosInstance.get(JOBS_API + `/isAdmin`, {
          params: {
            jobTitle: team.name,
            userEmail: user
          }
        });
        setAdmin(response.data);
      } catch (error) {
        if (error.response.status == 401) {
          clearLocalStorage();
          navigate(LOGIN_PATH);
        }
        console.error("Error get admin:", error);
      }
    };

    isAdmin();
  }, [team, user, navigate]);

  useEffect(() => {
    const fetchReceivedRequests = async () => {
      try {
        const response = await axiosInstance.get(JOBINQUIRIES_API + `/received?title=${team.name}&user=${user}`);
        setReceivedRequests(response.data);
      } catch (error) {
        if (error.response.status == 401) {
          clearLocalStorage();
          navigate(LOGIN_PATH);
        }
        console.error('Error charging received friendship requests:', error);
      }
    };
    
    if (admin) {
      fetchReceivedRequests();
    }
  }, [admin, navigate, user, team]);

  useEffect(() => {
    async function fetchData() {
      const lastMessage = await getLastMessages();

      if (lastMessage.text === t('chat.startConversation') || lastMessage == []) {
        setMessages(false);
      } else if (!lastMessage.seenAt || !lastMessage.seenAt[user.split("@")[0]]) {
        setMessages(true);
      }
    }

    fetchData();
  }, [user, t]);

  const getLastMessages = async () => {
    const query = getLastMessageJob(user, team.name);

    const [querySnapshot] = await Promise.all([
      getDocsSender(query)
    ]);

    const senderMessage = querySnapshot.empty ? null : querySnapshot.docs[0].data();

    const lastMessage = senderMessage == null ? { text: t('chat.startConversation') } : senderMessage;

    return lastMessage;
  };

  return (
    <ListItem style={{ width: '50vh', maxWidth: '345px' }}>
      {(receivedRequests.length > 0 || messages) && <span style={{ color: 'red', margin: '10px' }}>&#8226;</span>}
      <ListItemAvatar>
        <UserProfileAvatar imageUrl={team.name} />
      </ListItemAvatar>
      <ListItemText
        primary={team.name + " (" + (team.role === "MEMBER" ? t('jobs.member').toUpperCase() : team.role) + ")"}
        secondary={
        <Fragment>
          <Typography component="span" variant="body2" color="textSecondary">
            {t('jobs.type_job')}: {team.workType == "THESIS" ? t('jobs.thesis') : (team.workType == "OTHER" ? t('jobs.other') : team.workType)}
          </Typography>
          <br />
          <Typography component="span" variant="body2" color="textSecondary">
          {t('jobs.level')}: {team.priority == "NONE" ? t('jobs.none') : (team.priority == "HIGH" ? t('jobs.high') : (team.priority == "LOW" ? t('jobs.low') : t('jobs.medium')))}
          </Typography>
        </Fragment>
        }
      />
      <Tooltip title={t('home_view.options')}>
        <IconButton onClick={(event) => handleMenuClick(event, team)}>
          <MoreVert />
        </IconButton>
      </Tooltip>
    </ListItem>
  );
};

TeamItem.propTypes = {
    team: PropTypes.shape({
      id: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired,
      workType: PropTypes.string.isRequired,
      priority: PropTypes.string.isRequired,
      role: PropTypes.string.isRequired,
    }).isRequired,
    handleMenuClick: PropTypes.func.isRequired,
};

export default TeamItem;
