import { useState, useEffect } from 'react';
import { Paper, Typography, IconButton, Collapse, List, ListItem, Menu, MenuItem, Divider, Snackbar, Tooltip, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button } from '@mui/material';
import { ExpandMore, Group, Settings, PersonAdd, VisibilityOff, Visibility, ExitToApp, Delete } from '@mui/icons-material';
import TeamItem from './TeamItem';
import { JOBS_API, NOTIFICATIONS_API } from '../../routes/api-routes';
import AddMemberDialog from './AddMemberDialog';
import MuiAlert from '@mui/material/Alert';
import { JOBS_PATH, LOGIN_PATH } from '../../routes/app-routes';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { deleteImageFromStorage, deleteMessagesFromGroupStorage, deleteFilesFromGroupStorage, removeNotificationsByUser } from '../../services/firebase';
import axiosInstance from '../../services/axios';
import PropTypes from 'prop-types';
import { clearLocalStorage } from '../../App';

const TeamComponent = ( { fetchData, teamsHidden, teamsVisible }) => {
  const user = localStorage.getItem('userEmail');
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [visibleExpanded, setVisibleExpanded] = useState(true);
  const [hiddenExpanded, setHiddenExpanded] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);

  const [openDialog, setOpenDialog] = useState(false);
  const [team, setTeam] = useState(null);
  const [friend, setFriend] = useState(null);

  const [deleted, setDelete] = useState(false);
  const [deleteTeam, setDeleteTeam] = useState(null);
  const [confirmDeleted, setConfirmDeleted] = useState(false);

  const [leaved, setLeaved] = useState(false);
  const [leaveTeam, setLeaveTeam] = useState(false);
  const [confirmLeaved, setConfirmLeaved] = useState(false);

  let [menuTeam, setMenuTeam] = useState(null);
  let [creator, setCreator] = useState(null);

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchMembers = async (jobTitle) => {
    try {
      const response = await axiosInstance.get(JOBS_API + `/members?jobTitle=${jobTitle}&user=${user}`);

      const updatedMemberData = response.data.map(async (member) => {
        try {
          const isAdminResponse = await axiosInstance.get(JOBS_API + `/isAdmin`, {
            params: {
              jobTitle: jobTitle,
              userEmail: member.email
            }
          });
          return { ...member, isAdmin: isAdminResponse.data ? "Admin" : "Member" };
        } catch (error) {
          if (error.response.status == 401) {
            clearLocalStorage();
            navigate(LOGIN_PATH);
          }
          console.error("Error getting admin status:", error);
          return;
        }
      });

      const updatedMembers = await Promise.all(updatedMemberData);
      return updatedMembers[0].isAdmin == "Admin" ? updatedMembers[0].email : null;
    } catch (error) {
      if (error.response.status == 401) {
        clearLocalStorage();
        navigate(LOGIN_PATH);
      }
      console.error("Error getting members: " + error);
    }
};

  const handleVisibleExpandClick = () => {
    setVisibleExpanded(!visibleExpanded);
  };

  const handleHiddenExpandClick = () => {
    setHiddenExpanded(!hiddenExpanded);
  };

  const handleMenuClick = async (event, team) => {
    setAnchorEl(event.currentTarget);
    setMenuTeam(team);

    setCreator(await fetchMembers(team.name));
  };

  const handleClose = () => {
    setAnchorEl(null);
    setMenuTeam(null);
  };

  const handleChangeTeam = async (team) => {
    try {
      await axiosInstance.put(JOBS_API + `/${team.id}/visibility`);
      fetchData();
      handleClose();
    } catch (error) {
      if (error.response.status == 401) {
        clearLocalStorage();
        navigate(LOGIN_PATH);
      }
    }
  };

  const handleOpen = (team) => {
    setOpenDialog(true);
    handleClose();
    setTeam(team);
  }

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setTeam(null);
  }

  const handleDelete = (team) => {
    setDelete(true);
    setDeleteTeam(team.name);
    setAnchorEl(null);
  }

  const handleLeave = (team) => {
    setLeaved(true);
    setLeaveTeam(team.name);
    setAnchorEl(null);
  }

  const handleDeleteTeam = async () => {
    const team = deleteTeam;
    await axiosInstance.post(NOTIFICATIONS_API + `/push`, {
      type: "JOB_DELETE",
      receiver: team,
      sender: user,
      read: false,
      hidden: false,
      date: new Date(),
    });

    await deleteImageFromStorage(team);
    await deleteFilesFromGroupStorage(team);
    await deleteMessagesFromGroupStorage(team);
    removeNotificationsByUser(team, true);
    
    try {
      await axiosInstance.delete(JOBS_API + `/${team}/deleteTeam?user=${user}`);
    } catch (error) {
      if (error.response.status == 401) {
        clearLocalStorage();
        navigate(LOGIN_PATH);
      }
      console.error('Error delete team:', error);
      return;
    }

    fetchData();
    setDelete(false);
    setConfirmDeleted(true);
  };

  
  const handleLeaveGroup = async () => {
    const team = leaveTeam;
    try {
      await axiosInstance.delete(JOBS_API + `/${team}/exitTeam?email=${user}`);
    } catch (error) {
      if (error.response.status == 401) {
        clearLocalStorage();
        navigate(LOGIN_PATH);
      }
      console.error('Error exit team:', error);
      return;
    }

    await axiosInstance.post(NOTIFICATIONS_API + `/push`, {
      type: "JOB_LEAVE",
      receiver: team,
      sender: user,
      read: false,
      hidden: false,
      date: new Date(),
    });

    fetchData();
    setLeaved(false);
    setConfirmLeaved(true);
  };

  
  return (
    <div style={{ marginBottom: '16px' }}>
      <Paper style={{ padding: '16px', display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
        <Group style={{ marginRight: '16px' }} />
        <Typography variant="h6" style={{ marginRight: 'auto' }}>{t('jobs.visible')}</Typography>
        <Tooltip title={t('jobs.ocult')}>
          <IconButton onClick={handleVisibleExpandClick}>
            <ExpandMore />
          </IconButton>
        </Tooltip>
      </Paper>
      <Collapse in={visibleExpanded}>
        <List style={{ display: 'flex', flexWrap: 'wrap' }}>
          {teamsVisible.map((team) => (
            <ListItem key={team.id} style={{ width: '100%', maxWidth: '400px' }}>
              <Paper style={{ padding: '16px', display: 'flex', alignItems: 'center', marginBottom: '8px', width: '100%' }}>
                <TeamItem team={team} handleMenuClick={handleMenuClick} />
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl && menuTeam && menuTeam.id === team.id)}
                  onClose={handleClose}
                  transformOrigin={{
                    horizontal: 'left',
                  }}
                >
                  <MenuItem onClick={() => handleChangeTeam(team)}>
                    <IconButton color="inherit" size="small" style={{ marginLeft: '5px' }}>
                      <VisibilityOff />
                    </IconButton>
                    {t('jobs.team')}
                  </MenuItem>
                  <Divider />
                  <MenuItem component={Link} to={JOBS_PATH + `/${team.name}`} >
                    <IconButton color="inherit" size="small" style={{ marginLeft: '5px' }}>
                      <Settings />
                    </IconButton>
                    {t('jobs.administrator')}
                  </MenuItem>
                  {team.role == "ADMIN" &&
                    <MenuItem onClick={() => handleOpen(team)}>
                      <IconButton color="inherit" size="small" style={{ marginLeft: '5px' }}>
                        <PersonAdd />
                      </IconButton>
                      {t('jobs.add')}
                    </MenuItem>
                  }
                  <MenuItem onClick={() => handleLeave(team)}>
                    <IconButton color="inherit" size="small" style={{ marginLeft: '5px' }}>
                      <ExitToApp />
                    </IconButton>
                    {t('jobs.leave')}
                  </MenuItem>
                  {creator == user &&
                    <div>
                      <Divider />
                      <MenuItem onClick={() => handleDelete(team)}>
                        <IconButton color="inherit" size="small" style={{ marginLeft: '5px' }}>
                          <Delete />
                        </IconButton>
                        {t('jobs.delete')}
                      </MenuItem>
                    </div>
                  }
                </Menu>
              </Paper>
            </ListItem>
          ))}
        </List>          
      </Collapse>
      <AddMemberDialog
        openDialog={openDialog} 
        handleCloseDialog={handleCloseDialog}
        team={team?.name}
        setFriend={setFriend}
      />
      <Dialog open={deleted} onClose={() => setDelete(false)}>
        <DialogTitle style={{ color: 'black', textAlign: 'center' }}>{t('jobs.delete_job')}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {t('jobs.sure_delete')} <strong>({deleteTeam})</strong>
          </DialogContentText>
        </DialogContent>
        <DialogActions style={{ paddingRight: '1.7rem', paddingBottom: '1.5rem', justifyContent: 'flex-end' }}>
          <Button variant="outlined" color="primary" onClick={() => setDelete(false)}>
            {t('home_view.cancel')}
          </Button>
          <Button variant="contained" color="primary" onClick={handleDeleteTeam}>
            {t('home_view.confirm')}
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog open={leaved} onClose={() => setLeaved(false)}>
        <DialogTitle style={{ color: 'black', textAlign: 'center' }}>{t('jobs.leave_job')}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {t('jobs.confirm_leave_team_message')} <strong>{leaveTeam}</strong>? {t('jobs.files_deleted')}
          </DialogContentText>
        </DialogContent>
        <DialogActions style={{ paddingRight: '1.7rem', paddingBottom: '1.5rem', justifyContent: 'flex-end' }}>
          <Button variant="outlined" color="primary" onClick={() => setLeaved(false)}>
            {t('home_view.cancel')}
          </Button>
          <Button variant="contained" color="primary" onClick={handleLeaveGroup}>
            {t('home_view.confirm')}
          </Button>
        </DialogActions>
      </Dialog>
      <Snackbar
        open={confirmDeleted}
        autoHideDuration={3000}
        onClose={() => setConfirmDeleted(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <MuiAlert onClose={() => setConfirmDeleted(false)} severity="success" sx={{ width: '100%' }}>
        {t('jobs.delete_job_label')}
        </MuiAlert>
      </Snackbar>
      <Snackbar
        open={confirmLeaved}
        autoHideDuration={3000}
        onClose={() => setConfirmLeaved(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <MuiAlert onClose={() => setConfirmLeaved(false)} severity="success" sx={{ width: '100%' }}>
          {t('jobs.leave_job_label')}
        </MuiAlert>
      </Snackbar>
      <Snackbar
        open={friend != null}
        autoHideDuration={3000}
        onClose={() => setFriend(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <MuiAlert onClose={() => setFriend(null)} severity="success" sx={{ width: '100%' }}>
          {t('jobs.friendAcceptedMessage', {sender: friend})}
        </MuiAlert>
      </Snackbar>
      <Paper style={{ padding: '16px', display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
        <Group style={{ marginRight: '16px' }} />
        <Typography variant="h6" style={{ marginRight: 'auto' }}>{t('jobs.ocults')}</Typography>
        <Tooltip title={t('jobs.ocult')}>
          <IconButton onClick={handleHiddenExpandClick}>
            <ExpandMore />
          </IconButton>
        </Tooltip>
      </Paper>
      <Collapse in={hiddenExpanded}>
        <List style={{ display: 'flex', flexWrap: 'wrap' }}>
          {teamsHidden.map((team) => (
            <ListItem key={team.id} style={{ width: '100%', maxWidth: '370px' }}>
              <Paper style={{ padding: '16px', display: 'flex', alignItems: 'center', marginBottom: '8px', width: '100%' }}>
                <TeamItem team={team} handleMenuClick={handleMenuClick} />
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl && menuTeam && menuTeam.id === team.id)}
                  onClose={handleClose}
                  transformOrigin={{
                    horizontal: 'left',
                  }}
                >
                  <MenuItem onClick={() => handleChangeTeam(team)}>
                    <IconButton color="inherit" size="small" style={{ marginLeft: '5px' }}>
                      <Visibility />
                    </IconButton>
                    {t('jobs.show')}
                  </MenuItem>
                  <Divider />
                  <MenuItem component={Link} to={JOBS_PATH + `/${team.name}`} >
                    <IconButton color="inherit" size="small" style={{ marginLeft: '5px' }}>
                      <Settings />
                    </IconButton>
                    {t('jobs.administrator')}
                  </MenuItem>
                  {team.role == "ADMIN" &&
                    <MenuItem onClick={() => handleOpen(team)}>
                      <IconButton color="inherit" size="small" style={{ marginLeft: '5px' }}>
                        <PersonAdd />
                      </IconButton>
                      {t('jobs.add')}
                    </MenuItem>
                  }
                  <MenuItem onClick={() => handleLeaveGroup(team)}>
                    <IconButton color="inherit" size="small" style={{ marginLeft: '5px' }}>
                      <ExitToApp />
                    </IconButton>
                    {t('jobs.leave')}
                  </MenuItem>
                  {creator == user &&
                    <div>
                      <Divider />
                      <MenuItem onClick={() => handleDelete(team)}>
                        <IconButton color="inherit" size="small" style={{ marginLeft: '5px' }}>
                          <Delete />
                        </IconButton>
                        {t('jobs.delete')}
                      </MenuItem>
                    </div>
                  }
                </Menu>
              </Paper>
            </ListItem>
          ))}
        </List>
      </Collapse>
    </div>
  );
};

TeamComponent.propTypes = {
  teamsHidden: PropTypes.array,
  teamsVisible: PropTypes.array,
  fetchData: PropTypes.func.isRequired,
};

export default TeamComponent;
