import { useState, useEffect } from 'react';
import { Typography, Grid, Paper, Avatar } from '@mui/material';
import { Group, Settings, Chat, Edit, Star, PendingActions, Videocam, Attachment, LockOpen, DeleteForever } from '@mui/icons-material';
import { checkImageExists } from '../../services/firebase';
import PropTypes from 'prop-types';
import { JOBS_API } from '../../routes/api-routes';
import { useTranslation } from 'react-i18next';
import axiosInstance from '../../services/axios';
import { JOBS_PATH, LOGIN_PATH } from '../../routes/app-routes';
import { useNavigate } from 'react-router-dom';
import { clearLocalStorage } from '../../App';

const WelcomeTeamComponent = ({ job, isAdmin }) => {
  const user = localStorage.getItem('userEmail');
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  const [image, setImage] = useState("");
  const [creator, setCreator] = useState("");
 
  useEffect(() => {
    async function fetchImage() {
      setImage(await checkImageExists(job));
    }

    fetchImage();
  }, [job]);

  useEffect(() => {
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
            return { ...member, isAdmin: isAdminResponse.data ? t('jobs.admin') : t('jobs.member') };
          } catch (error) {
            if (error.response.status == 401) {
              clearLocalStorage();
              navigate(LOGIN_PATH);
            }
            console.error("Error getting admin status:", error);
          }
        });

        const updatedMembers = await Promise.all(updatedMemberData);
        setCreator(updatedMembers[0].isAdmin == t('jobs.admin') ? updatedMembers[0].email : null);
      } catch (error) {
        if (error.response.status == 401) {
          clearLocalStorage();
          navigate(LOGIN_PATH);
        }
        console.error("Error getting members: " + error);
        navigate(JOBS_PATH);
        return;
      }
    };

    fetchMembers(job);
  }, [job, t, navigate, user, creator]);

  const stringToColor = (string) => {
    let hash = 0;
    let i;

    for (i = 0; i < string.length; i += 1) {
      hash = string.charCodeAt(i) + ((hash << 5) - hash);
    }

    let color = '#';

    for (i = 0; i < 3; i += 1) {
      const value = (hash >> (i * 8)) & 0xff;
      color += `00${value.toString(16)}`.slice(-2);
    }

    return color;
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
      <Typography variant="h4" textAlign='center' gutterBottom>{t('jobs.welcome_team')}</Typography>
      {image && <Avatar sx={{ height: '100px', width: '100px', marginBottom: '10px' }} src={image} />}
      {!image && <Avatar sx={{ bgcolor: stringToColor(job[0]), height: '100px', width: '100px', marginBottom: '10px' }}>{job[0]}</Avatar>}
      <Typography variant="body1" textAlign='center' paragraph>{t('jobs.welcome_message')} <strong>{user==creator ? t('jobs.creator') : (isAdmin ? t('jobs.admin') : t('jobs.member'))}</strong> {t('jobs.of_team')}</Typography>
        <Grid container spacing={2} justifyContent="center">
        {isAdmin && (
          <Grid item xs={12} sm={6} md={3}>
            <Paper elevation={3} style={{ textAlign: 'center', padding: '20px', height: '100%' }}>
              <LockOpen style={{ fontSize: 80, color: '#3f51b5' }} />
              <Typography variant="h6" gutterBottom>{t('jobs.access_info')}</Typography>
            </Paper>
          </Grid>
        )}
        {isAdmin && (
          <Grid item xs={12} sm={6} md={3}>
            <Paper elevation={3} style={{ textAlign: 'center', padding: '20px', height: '100%' }}>
              <Edit style={{ fontSize: 80, color: '#3f51b5' }} />
              <Typography variant="h6" gutterBottom>{t('jobs.edit_info')}</Typography>
            </Paper>
          </Grid>
        )}
        {isAdmin && (
          <Grid item xs={12} sm={6} md={3}>
            <Paper elevation={3} style={{ textAlign: 'center', padding: '20px', height: '100%' }}>
              <Star style={{ fontSize: 80, color: '#ff9800' }} />
              <Typography variant="h6" gutterBottom>{t('jobs.add_rating')}</Typography>
            </Paper>
          </Grid>
        )}
        {!isAdmin && (
          <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={3} style={{ textAlign: 'center', padding: '20px', height: '100%' }}>
            <Group style={{ fontSize: 80, color: '#4caf50' }} />
            <Typography variant="h6" gutterBottom>{t('jobs.view_members')}</Typography>
          </Paper>
          </Grid>
        )}
        {isAdmin && (
          <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={3} style={{ textAlign: 'center', padding: '20px', height: '100%' }}>
            <Group style={{ fontSize: 80, color: '#4caf50' }} />
            <Typography variant="h6" gutterBottom>{t('jobs.manage_members')}</Typography>
          </Paper>
          </Grid>
        )}
        {isAdmin && (
          <Grid item xs={12} sm={6} md={3}>
            <Paper elevation={3} style={{ textAlign: 'center', padding: '20px', height: '100%' }}>
              <Settings style={{ fontSize: 80, color: '#f44336' }} />
              <Typography variant="h6" gutterBottom>{t('jobs.manage_permissions')}</Typography>
            </Paper>
          </Grid>
        )}
        {isAdmin && (
          <Grid item xs={12} sm={6} md={3}>
            <Paper elevation={3} style={{ textAlign: 'center', padding: '20px', height: '100%' }}>
              <PendingActions style={{ fontSize: 80, color: '#9c27b0' }} />
              <Typography variant="h6" gutterBottom>{t('jobs.manage_requests')}</Typography>
            </Paper>
          </Grid>
        )}
        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={3} style={{ textAlign: 'center', padding: '20px', height: '100%' }}>
            <Chat style={{ fontSize: 80, color: 'green' }} />
            <Typography variant="h6" gutterBottom>{t('jobs.text_chat')}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={3} style={{ textAlign: 'center', padding: '20px', height: '100%' }}>
            <Videocam style={{ fontSize: 80, color: 'blue' }} />
            <Typography variant="h6" gutterBottom>{t('chat.videocall')}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={3} style={{ textAlign: 'center', padding: '20px', height: '100%' }}>
            <Attachment style={{ fontSize: 80, color: '#795548' }} />
            <Typography variant="h6" gutterBottom>{t('jobs.share_files')}</Typography>
          </Paper>
        </Grid>
        {isAdmin && user==creator && (
          <Grid item xs={12} sm={6} md={3}>
            <Paper elevation={3} style={{ textAlign: 'center', padding: '20px', height: '100%' }}>
              <DeleteForever style={{ fontSize: 80, color: 'red' }} />
              <Typography variant="h6" gutterBottom>{t('jobs.delete_job')}</Typography>
            </Paper>
          </Grid>
        )}
      </Grid>
    </div>
  );  
};

WelcomeTeamComponent.propTypes = {
    job: PropTypes.string.isRequired,
    isAdmin: PropTypes.bool.isRequired
  };

export default WelcomeTeamComponent;
