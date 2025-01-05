import { useState, useEffect } from 'react';
import { Snackbar, Container, Typography, Button, Box, IconButton, Menu, MenuItem, Divider, Badge, Hidden } from '@mui/material';
import { GroupAdd, PersonAdd, Email } from '@mui/icons-material';
import TeamComponent from './TeamComponent';
import JoinTeamForm from './JoinTeamForm';
import TeamForm from './TeamForm';
import MuiAlert from '@mui/material/Alert';
import { JOBINQUIRIES_API, JOBS_API, USERS_API } from '../../routes/api-routes';
import SentInquiries from './SentInquiries';
import { useTranslation } from 'react-i18next';
import axiosInstance from '../../services/axios';
import { useNavigate } from 'react-router-dom';
import { LOGIN_PATH } from '../../routes/app-routes';
import { clearLocalStorage } from '../../App';

const JoinOrCreateTeamSection = () => {
  const user = localStorage.getItem('userEmail');
  const { t } = useTranslation();
  const navigate = useNavigate();

  const email = localStorage.getItem('userEmail');
  const [anchorEl, setAnchorEl] = useState(null);
  const [joinTeamDialogOpen, setJoinTeamDialogOpen] = useState(false);
  const [teamFormOpen, setTeamFormOpen] = useState(false);
  const [created, setCreated] = useState(false);
  const [popup, setPopup] = useState(false);
  const [role, setRole] = useState("");
  const [sentRequests, setSentRequests] = useState([]);
  const [showSentInquiries, setShowSentInquiries] = useState(false);
  const [userName, setUsername] = useState("");
  const [teamsVisible, setTeamsVisible] = useState([]);
  const [teamsHidden, setTeamsHidden] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axiosInstance.get(USERS_API + `/${email}`);
        const userDataFromApi = response.data;
        setRole(userDataFromApi.role);
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };
    fetchData();
  }, [email]);

  useEffect(() => {
    async function fetchSentRequests() {
      try {
        const response = await axiosInstance.get(JOBINQUIRIES_API + `/sent?senderEmail=${email}`);
        setSentRequests(response.data);
      } catch (error) {
        if (error.response.status == 401) {
          clearLocalStorage();
          navigate(LOGIN_PATH);
        }
        console.error('Error charging sent friendship requests:', error);
      }
    }

    fetchSentRequests();
  }, [email, navigate]);

  const fetchData = async () => {
    try {
      const response = await axiosInstance.get(JOBS_API + `/${user}/job-relations`);

      const visibleTeams = response.data.filter(team => team.visible);
      const hiddenTeams = response.data.filter(team => !team.visible);

      setTeamsVisible(visibleTeams);
      setTeamsHidden(hiddenTeams);
    } catch (error) {
      if (error.response.status == 401) {
        clearLocalStorage();
        navigate(LOGIN_PATH);
      }
      console.error('Error fetching teams:', error);
    }
  };

  const handleVisibleSentInquiries = () => {
    setShowSentInquiries(true);
  }

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleJoinTeamClick = () => {
    setJoinTeamDialogOpen(true);
    handleClose();
  };

  const handleCloseJoinTeamDialog = () => {
    setJoinTeamDialogOpen(false);
  };

  const handleOpenTeamForm = () => {
    setTeamFormOpen(true);
    handleClose();
  };

  const handleCloseTeamForm = () => {
    setTeamFormOpen(false);
  };

  return (
    <Container style={{ marginTop: '15px', textAlign: 'center' }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" marginBottom="15px">
        <Typography variant="h5" gutterBottom style={{ textAlign: 'center' }}>
          {t('jobs.title_jobs')}
        </Typography>
        <Box display="flex" alignItems="center">
          <Button variant="contained" color="primary" onClick={handleVisibleSentInquiries} style={{ marginRight: '15px' }}>
            <IconButton color="inherit" size="small" style={{ marginRight: '5px' }}>
              <Badge badgeContent={sentRequests.length} color="secondary">
                <Email />
              </Badge>
            </IconButton>
            <Hidden smDown>
              {t('jobs.sentRequestsButton')}
            </Hidden>
          </Button>
          <Button variant="contained" color="primary" onClick={role === "TEACHER" ? handleMenuClick : handleJoinTeamClick}>
            <IconButton color="inherit" size="small" style={{ marginRight: '5px' }}>
              <GroupAdd />
            </IconButton>
            <Hidden smDown>
              {role === "TEACHER" ? t('jobs.joinOrCreateTeamButton.teacherLabel') : t('jobs.joinOrCreateTeamButton.studentLabel')}
            </Hidden>
          </Button>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleClose}
            transformOrigin={{
              horizontal: 'left',
            }}
          >
            <MenuItem onClick={handleJoinTeamClick} >
              <IconButton color="inherit" size="small" style={{ marginLeft: '5px' }}>
                <PersonAdd />
              </IconButton>
              {t('jobs.joinTeamMenuItem')}
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleOpenTeamForm}>
              <IconButton color="inherit" size="small" style={{ marginLeft: '5px' }}>
                <GroupAdd />
              </IconButton>
              {t('jobs.createTeamMenuItem')}
            </MenuItem>
          </Menu>
        </Box>
      </Box>
      <TeamComponent fetchData={fetchData} teamsHidden={teamsHidden} teamsVisible={teamsVisible} />
      <Snackbar
        open={created}
        autoHideDuration={3000}
        onClose={() => setCreated(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <MuiAlert onClose={() => setCreated(false)} severity="success" sx={{ width: '100%' }}>
          {t('jobs.teamCreatedMessage')}
        </MuiAlert>
      </Snackbar>
      <Snackbar
        open={popup}
        autoHideDuration={3000}
        onClose={() => setPopup(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <MuiAlert onClose={() => setPopup(false)} severity="success" sx={{ width: '100%' }}>
          {t('jobs.popupMessage', { userName: userName })}
        </MuiAlert>
      </Snackbar>
      <JoinTeamForm
        setUsername={setUsername}
        openPopup={joinTeamDialogOpen}
        handleClosePopup={handleCloseJoinTeamDialog}
        setPopup={setPopup}
        setSent={setSentRequests}
      />
      {showSentInquiries &&
        <SentInquiries
          setOpenDialog={setShowSentInquiries}
          setSent={setSentRequests}
        />}
      <TeamForm fetchData={fetchData} open={teamFormOpen} onClose={handleCloseTeamForm} setCreated={setCreated} />
    </Container>
  );
};

export default JoinOrCreateTeamSection;
