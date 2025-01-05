import PropTypes from 'prop-types';
import { Typography, Grid, Select, MenuItem, Paper, IconButton, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button, Snackbar, Tooltip } from '@mui/material';
import { useEffect, useState } from 'react';
import { JOBS_API, NOTIFICATIONS_API } from '../../routes/api-routes';
import UserProfileAvatar from '../home/UserProfileAvatar';
import DeleteIcon from '@mui/icons-material/Delete';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { JOBS_PATH, LOGIN_PATH } from '../../routes/app-routes';
import AddMemberDialog from './AddMemberDialog';
import MuiAlert from '@mui/material/Alert';
import { deleteFilesFromGroupStorage, deleteImageFromStorage, deleteMessagesFromGroupStorage, removeNotificationsByUser } from '../../services/firebase';
import axiosInstance from '../../services/axios';
import { clearLocalStorage } from '../../App';

const ListMembers = ({ job, isAdmin }) => {
  const user = localStorage.getItem('userEmail');
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [memberData, setMemberData] = useState([]);
  const [creator, setCreator] = useState([]);
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [deleteTeam, setDeleteTeam] = useState(false);
  const [exitTeam, setExitTeam] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [friend, setFriend] = useState(null);

  const options = [
    { value: 'Member', label: t('jobs.member') },
    { value: 'Admin', label: t('jobs.admin') }
  ];

  useEffect(() => {
    fetchMembers(job);
  }, [job]);

  const handleCloseDialog = () => {
    setOpenDialog(false);
  }

  const fetchMembers = async (jobTitle) => {
    try {
      const response = await axiosInstance.get(JOBS_API + `/members?jobTitle=${jobTitle}&user=${user}`);

      const updatedMemberData = response.data.map(async (member) => {
        try {
          const isAdminResponse = await axiosInstance.get(JOBS_API + `/isAdmin`, {
            params: {
              jobTitle: job,
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
        }
      });

      const updatedMembers = await Promise.all(updatedMemberData);
      setMemberData(updatedMembers);
      setCreator(updatedMembers[0].isAdmin == "Admin" ? updatedMembers[0].email : null);
    } catch (error) {
      if (error.response.status == 401) {
        clearLocalStorage();
        navigate(LOGIN_PATH);
      }
      console.error("Error getting members: " + error);
    }
  };

  const handleChange = async (event, memberId) => {
    const newValue = event.target.value;
    setMemberData(prevMemberData => 
      prevMemberData.map(member => 
      member.email === memberId ? { ...member, isAdmin: newValue } : member
    ));

    try {
      await axiosInstance.put(JOBS_API + `/${job}/permissions?email=${memberId}&user=${user}`);
    } catch (error) {
      if (error.response.status == 401) {
        clearLocalStorage();
        navigate(LOGIN_PATH);
      }
      console.error('Error change permissions: ', error);
      navigate(JOBS_PATH);
      return;
    }

    await axiosInstance.post(NOTIFICATIONS_API + `/push`, {
      type: "JOB_PERMISSIONS",
      receiver: memberId,
      sender: user,
      read: false,
      hidden: false,
      date: new Date(),
      titleTeam: job
    });
  };

  const handleDeleteMember = async () => {
    const email = selectedFriend.email;
    try {
      await axiosInstance.delete(JOBS_API + `/${job}/deleteMember?email=${email}&user=${user}`);
    } catch (error) {
      if (error.response.status == 401) {
        clearLocalStorage();
        navigate(LOGIN_PATH);
      }
      console.error('Error deleting member: ', error);
      navigate(JOBS_PATH);
      return;
    }

    await axiosInstance.post(NOTIFICATIONS_API + `/push`, {
      type: "JOB_DELETE_MEMBER",
      receiver: email,
      sender: user,
      read: false,
      hidden: false,
      date: new Date(),
      titleTeam: job
    });

    setFriend(email);
    setSelectedFriend(null);
    fetchMembers(job);
  };

  const handleExitTeam = async () => {
    try {
      await axiosInstance.delete(JOBS_API + `/${job}/exitTeam?email=${user}`);
    } catch (error) {
      if (error.response.status == 401) {
        clearLocalStorage();
        navigate(LOGIN_PATH);
      }
      console.error('Error exit team: ', error);
      navigate(JOBS_PATH);
      return;
    }

    await axiosInstance.post(NOTIFICATIONS_API + `/push`, {
      type: "JOB_LEAVE",
      receiver: job,
      sender: user,
      read: false,
      hidden: false,
      date: new Date()
    });
    
    navigate(JOBS_PATH);
  };

  const handleDeleteTeam = async () => {
    await axiosInstance.post(NOTIFICATIONS_API + `/push`, {
      type: "JOB_DELETE",
      receiver: job,
      sender: user,
      read: false,
      hidden: false,
      date: new Date()
    });

    await deleteFilesFromGroupStorage(job);
    await deleteImageFromStorage(job);
    await deleteMessagesFromGroupStorage(job);
    removeNotificationsByUser(job, true);

    try {
      await axiosInstance.delete(JOBS_API + `/${job}/deleteTeam?user=${user}`);
    } catch (error) {
      if (error.response.status == 401) {
        clearLocalStorage();
        navigate(LOGIN_PATH);
      }
      console.error('Error deleting member: ', error);
      navigate(JOBS_PATH);
      return;
    }

    navigate(JOBS_PATH);
  }
  
  return (
    <div style={{ width: '80vw', marginLeft: '15px', display: 'flex', flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center' }}>
      <Typography variant="h4" textAlign='center' gutterBottom>{t('jobs.members_title')}</Typography>
        {memberData.map((member, index) => (
          <Grid item xs={12} key={index}>
            <Paper elevation={3} style={{ display: 'flex', alignItems: 'center', padding: '10px', marginBottom: '20px', flexDirection: 'column', marginRight: '20px' }}>
              <div style={{ marginBottom: '20px' }}>
                <UserProfileAvatar imageUrl={member.email} />
              </div>
              <div style={{ textAlign: 'center', alignContent: 'flex-start' }}>
                <Typography variant="body1" gutterBottom><b>{t('signup_view.firstname')}: </b>{member.firstName}</Typography>
                <Typography variant="body1" gutterBottom><b>{t('signup_view.lastname')}: </b>{member.lastName}</Typography>
                <Typography variant="body1" gutterBottom><b>{t('signup_view.email')}: </b>{member.email}</Typography>
                <div>
                <Typography variant="body1" gutterBottom style={{ display: 'flex', alignItems: 'center', textAlign: 'center', marginLeft: '60px', marginRight: '5px' }}>
                    <b>{t('jobs.connectivity_label')}: </b>
                    <div>
                      {member.currentConnectivity === 'AVAILABLE' && (
                        <Typography variant="body1" style={{ marginLeft: '5px' }}>{t('home_view.available')}</Typography>
                      )}
                      {member.currentConnectivity === 'BUSY' && (
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          <Typography variant="body1" style={{ marginLeft: '5px' }}>{t('home_view.busy')}</Typography>
                        </div>
                      )}
                      {member.currentConnectivity === 'AWAY' && (
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          <Typography variant="body1" style={{ marginLeft: '5px' }}>{t('home_view.away')}</Typography>
                        </div>
                      )}
                      {member.currentConnectivity === 'OFFLINE' && (
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          <Typography variant="body1" style={{ marginLeft: '5px' }}>{t('home_view.offline')}</Typography>
                        </div>
                      )}
                    </div>
                  </Typography>
                </div>
                {(!isAdmin || member.email === user || member.email === creator || member.role === 'STUDENT' || user !== creator) && 
                  <Typography variant="body1" gutterBottom>
                    <b>{t('jobs.permissions_label')}: </b>
                    { member.email === creator ? t('jobs.creator_role') : (member.isAdmin === "Member" ? t('jobs.member') : member.isAdmin)}
                  </Typography>
                }
                {isAdmin && member.email !== user && member.email !== creator && member.role !== 'STUDENT' && user == creator && (
                  <Select value={member.isAdmin} onChange={(event) => handleChange(event, member.email)}>
                    {options.map(option => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                )}
              </div>
              {isAdmin && member.email !== user && member.email !== creator && member.isAdmin=="Member" && (
                <div>
                  <Tooltip title={t('jobs.delete_member')}>
                    <IconButton color='error' aria-label={t('contacts.delete_friend')} onClick={() => setSelectedFriend(member)}>
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </div>
              )}
            </Paper>
          </Grid>
        ))}
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px', marginLeft: '-10px' }}>
        {isAdmin && (
          <Button variant="outlined" color="primary" onClick={() => setOpenDialog(true)}>
            {t('jobs.add')}
          </Button>
        )}
        <div style={{ marginLeft: '10px' }}>
          <Button variant="outlined" color="error" onClick={() => setExitTeam(true)}>
            {t('jobs.leave')}
          </Button>
        </div>
        <div style={{ marginLeft: '10px' }}>
          {isAdmin && user === creator && (
            <Button variant="contained" color="error" onClick={() => setDeleteTeam(true)}>
              {t('jobs.delete')}
            </Button>
          )}
        </div>
      </div>
      <AddMemberDialog
        openDialog={openDialog} 
        handleCloseDialog={handleCloseDialog}
        team={job}        
        fetchMembers={fetchMembers}
        />
      <Snackbar
        open={friend != null}
        autoHideDuration={3000}
        onClose={() => setFriend(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <MuiAlert onClose={() => setFriend(null)} severity="success" sx={{ width: '100%' }}>
        {t('jobs.delete_member_success_message', {friend: friend})}
        </MuiAlert>
      </Snackbar>
      <Dialog open={selectedFriend != null} onClose={() => setSelectedFriend(null)}>
          <DialogTitle style={{ color: 'black', textAlign: 'center' }}>{t('jobs.delete_member')}</DialogTitle>
          <DialogContent>
          <DialogContentText>
          {t('jobs.confirm_delete_member_message')} <strong>{selectedFriend?.email}</strong>? {t('jobs.files_deleted2')}
          </DialogContentText>
          </DialogContent>
          <DialogActions style={{ paddingRight: '1.7rem', paddingBottom: '1.5rem', justifyContent: 'flex-end' }}>
            <Button variant="outlined" color="primary" onClick={() => setSelectedFriend(null)}>
              {t('home_view.cancel')}
            </Button>
            <Button variant="contained" color="primary" onClick={handleDeleteMember}>
              {t('home_view.confirm')}
            </Button>
          </DialogActions>
       </Dialog>
       <Dialog open={deleteTeam} onClose={() => setDeleteTeam(false)}>
          <DialogTitle style={{ color: 'black', textAlign: 'center' }}>{t('jobs.delete_team')}</DialogTitle>
          <DialogContent>
          <DialogContentText>
            {t('jobs.sure_delete')} <strong>({job})</strong>
          </DialogContentText>
          </DialogContent>
          <DialogActions style={{ paddingRight: '1.7rem', paddingBottom: '1.5rem', justifyContent: 'flex-end' }}>
            <Button variant="outlined" color="primary" onClick={() => setDeleteTeam(false)}>
              {t('home_view.cancel')}
            </Button>
            <Button variant="contained" color="primary" onClick={handleDeleteTeam}>
              {t('home_view.confirm')}
            </Button>
          </DialogActions>
       </Dialog>
       <Dialog open={exitTeam} onClose={() => setExitTeam(false)}>
        <DialogTitle style={{ color: 'black', textAlign: 'center' }}>{t('jobs.leave_job')}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {t('jobs.confirm_leave_team_message')} <strong>{job}</strong>? {t('jobs.files_deleted')}
          </DialogContentText>
        </DialogContent>
        <DialogActions style={{ paddingRight: '1.7rem', paddingBottom: '1.5rem', justifyContent: 'flex-end' }}>
          <Button variant="outlined" color="primary" onClick={() => setExitTeam(false)}>
            {t('home_view.cancel')}
          </Button>
          <Button variant="contained" color="primary" onClick={handleExitTeam}>
            {t('home_view.confirm')}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
  
};

ListMembers.propTypes = {
  job: PropTypes.string.isRequired,
  isAdmin: PropTypes.bool.isRequired
};

export default ListMembers;
