import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import MenuItem from '@mui/material/MenuItem';
import Drawer from '@mui/material/Drawer';
import MenuIcon from '@mui/icons-material/Menu';
import UserProfileAvatar from '../home/UserProfileAvatar';
import { Tooltip } from '@mui/material';
import { useEffect, useState } from 'react';
import { JOBINQUIRIES_API, JOBS_API } from '../../routes/api-routes';
import WelcomeTeamComponent from './WelcomeTeamComponent';
import ListMembers from './ListMembers';
import JobInquiries from './JobInquiries';
import JobChatBox from './JobChatBox';
import FilesJob from './FilesJob'
import { getDocsSender, getLastMessageJob } from '../../services/firebase';
import JobInfo from './JobInfo';
import JobDetails from './JobDetails';
import { useTranslation } from 'react-i18next';
import axiosInstance from '../../services/axios';
import { useNavigate } from 'react-router-dom';
import { LOGIN_PATH } from '../../routes/app-routes';
import StudentJob from './StudentJob';
import { clearLocalStorage } from '../../App';

function JobHome( { job } ) {
  const user = localStorage.getItem('userEmail');
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState('init');
  const [admin, setAdmin] = useState(false);
  const [completeJob, setCompleteJob] = useState(null);
  const [messages, setMessages] = useState(false);
  const [receivedRequests, setReceivedRequests] = useState([]);
  const [friendAcceptedMessage, setFriendAcceptedMessage] = useState('');

  useEffect(() => {
    const isAdmin = async () => {
      try {
        const response = await axiosInstance.get(JOBS_API + `/isAdmin`, {
          params: {
            jobTitle: job,
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
  }, [job, user, navigate]);
  
  useEffect(() => {
    const getJobByTitle = async (title) => {
      try {
        const response = await axiosInstance.get(`${JOBS_API}/${title}/job`);
        setCompleteJob(response.data);
      } catch (error) {
        if (error.response.status == 401) {
          clearLocalStorage();
          navigate(LOGIN_PATH);
        }
        console.error('Error obtain job:', error);
      }
    };

    getJobByTitle(job);
  }, [job, navigate]);

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

  useEffect(() => {
    const fetchReceivedRequests = async () => {
      try {
        if (admin) {
          const response = await axiosInstance.get(JOBINQUIRIES_API + `/received?title=${job}&user=${user}`);
          setReceivedRequests(response.data);
        }
      } catch (error) {
        if (error.response.status == 401) {
          clearLocalStorage();
          navigate(LOGIN_PATH);
        }
        console.error('Error charging received friendship requests:', error);
      }
    };
    
    fetchReceivedRequests();
  }, [admin, job, navigate, user]);

  const getLastMessages = async () => {
    const query = getLastMessageJob(user, job);

    const [querySnapshot] = await Promise.all([
      getDocsSender(query)
    ]);

    const senderMessage = querySnapshot.empty ? null : querySnapshot.docs[0].data();

    const lastMessage = senderMessage == null ? { text: t('chat.startConversation') } : senderMessage;

    return lastMessage;
  };

  const toggleDrawer = (newOpen) => () => {
    setOpen(newOpen);
  };

  const handleMenuClick = (menu) => {
    setSelectedMenu(menu);
    setOpen(false);
  };

  return (
    <div>
      <AppBar
        position="fixed"
        sx={{
          boxShadow: 0,
          bgcolor: 'transparent',
          backgroundImage: 'none',
          mt: 2,
        }}
      >
        <Container maxWidth="lg" style={{ justifyContent: 'center', alignContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
          <Toolbar
            variant="regular"
            sx={(theme) => ({
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginTop: '70px',
              marginLeft: '70px',
              marginRight: '20px',
              flexShrink: 0,
              borderRadius: '999px',
              bgcolor:
                theme.palette.mode === 'light'
                  ? 'rgba(255, 255, 255, 0.4)'
                  : 'rgba(0, 0, 0, 0.4)',
              backdropFilter: 'blur(24px)',
              maxHeight: 40,
              border: '1px solid',
              borderColor: 'divider',
              boxShadow:
                theme.palette.mode === 'light'
                  ? `0 0 1px rgba(85, 166, 246, 0.1), 1px 1.5px 2px -1px rgba(85, 166, 246, 0.15), 4px 4px 12px -2.5px rgba(85, 166, 246, 0.15)`
                  : '0 0 1px rgba(2, 31, 59, 0.7), 1px 1.5px 2px -1px rgba(2, 31, 59, 0.65), 4px 4px 12px -2.5px rgba(2, 31, 59, 0.65)',
            })}
          >
            <UserProfileAvatar imageUrl={job} />
            <Box
              sx={{
                flexGrow: 1,
                display: 'flex',
                alignItems: 'center',
                ml: '-18px',
                px: 0,
              }}
            >
              <Typography variant="body1" color="text.primary" style={{ marginLeft: '30px', marginRight: '20px', fontWeight: 'bold', fontSize: 'larger' }}>
                {job}
              </Typography>
              <Box sx={{ display: { xs: 'none', md: 'flex' } }}>
                <MenuItem
                  onClick={() => handleMenuClick('init')}
                  sx={{ py: '6px', px: '12px' }}
                >
                  <Typography variant="body2" color="text.primary">
                    {t('home_view.init')}
                  </Typography>
                </MenuItem>
                <MenuItem
                  onClick={() => handleMenuClick('information')}
                  sx={{ py: '6px', px: '12px' }}
                >
                  <Typography variant="body2" color="text.primary">
                    {t('jobs.information')}
                  </Typography>
                </MenuItem>
                <MenuItem
                  onClick={() => handleMenuClick('members')}
                  sx={{ py: '6px', px: '12px' }}
                >
                  <Typography variant="body2" color="text.primary">
                    {t('jobs.members')}
                  </Typography>
                </MenuItem>
                <MenuItem
                  onClick={() => handleMenuClick('files')}
                  sx={{ py: '6px', px: '12px' }}
                >
                  <Typography variant="body2" color="text.primary">
                    {t('jobs.files')}
                  </Typography>
                </MenuItem>
                {admin && 
                  <MenuItem
                    onClick={() => handleMenuClick('student')}
                    sx={{ py: '6px', px: '12px' }}
                  >
                    <Typography variant="body2" color="text.primary">
                      {t('jobs.student')}
                    </Typography>
                  </MenuItem>
                } 
                {admin && 
                  <MenuItem
                  onClick={() => handleMenuClick('requests')}
                  sx={{ py: '6px', px: '12px' }}
                  >
                    <Typography variant="body2" color="text.primary">
                      {t('jobs.requests')}
                      {receivedRequests.length > 0 && <span style={{ color: 'red', marginLeft: '5px' }}>&#8226;</span>}
                    </Typography>
                  </MenuItem>
                }
                <MenuItem
                  onClick={() => handleMenuClick('comunication')}
                  sx={{ py: '6px', px: '12px' }}
                >
                  <Typography variant="body2" color="text.primary">
                    {t('jobs.comunication')}
                    {messages && <span style={{ color: 'red', marginLeft: '5px' }}>&#8226;</span>}
                  </Typography>
                </MenuItem>
              </Box>
            </Box>
            <Box sx={{ display: { sm: '', md: 'none' } }}>
              <Tooltip title={t('home_view.options')}>
                <Button
                  variant="text"
                  color="primary"
                  aria-label="menu"
                  onClick={toggleDrawer(true)}
                  sx={{ minWidth: '30px', p: '4px' }}
                >
                  <MenuIcon />
                </Button>
              </Tooltip>
              <Drawer anchor="right" open={open} onClose={toggleDrawer(false)}>
                <Box
                  sx={{
                    minWidth: '60dvw',
                    p: 2,
                    backgroundColor: 'background.paper',
                    flexGrow: 1,
                  }}
                >
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'end',
                    flexGrow: 1,
                    marginTop: '55px'
                  }}
                >
                </Box>
                  <MenuItem onClick={() => handleMenuClick('init')}>
                    {t('home_view.init')}
                  </MenuItem>
                  <MenuItem onClick={() => handleMenuClick('information')}>
                    {t('jobs.information')}
                  </MenuItem>
                  <MenuItem onClick={() => handleMenuClick('members')}>
                    {t('jobs.members')}
                  </MenuItem>
                  <MenuItem onClick={() => handleMenuClick('files')}>
                    {t('jobs.files')}
                  </MenuItem>
                  {admin && 
                    <MenuItem onClick={() => handleMenuClick('student')}>
                      {t('jobs.student')}
                    </MenuItem>
                  } 
                  {admin && 
                    <MenuItem onClick={() => handleMenuClick("requests")}>
                      {t('jobs.requests')}
                      {receivedRequests.length > 0 && <span style={{ color: 'red', marginLeft: '5px' }}>&#8226;</span>}
                    </MenuItem>
                  } 
                  <MenuItem onClick={() => handleMenuClick('comunication')}>
                    {t('jobs.comunication')}
                    {messages && <span style={{ color: 'red', marginLeft: '5px' }}>&#8226;</span>}
                  </MenuItem>             
                </Box>
              </Drawer>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>
      <Container
        maxWidth="lg"
        sx={{
          mt: 4,
          mb: 4,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          marginTop: '90px'
        }}
      >
        {selectedMenu === 'init' && <WelcomeTeamComponent job={job} isAdmin={admin}/>}
        {selectedMenu === 'information' && !admin && <JobInfo job={completeJob}/>}
        {selectedMenu === 'information' && admin && <JobDetails job={completeJob} />}
        {selectedMenu === 'members' && <ListMembers job={job} isAdmin={admin}/>}
        {selectedMenu === 'files' && <FilesJob job={job}/>}
        {selectedMenu === 'student' && <StudentJob job={job}/>}
        {selectedMenu === 'requests' && <JobInquiries job={job} setReceived={setReceivedRequests} friendAcceptedMessage={friendAcceptedMessage} setFriendAcceptedMessage={setFriendAcceptedMessage}/>}
        {selectedMenu === 'comunication' && <JobChatBox job={job} />}
      </Container>
    </div>
  );
}

JobHome.propTypes = {
  job: PropTypes.string.isRequired
};

export default JobHome;