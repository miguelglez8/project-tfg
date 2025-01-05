import { Container, Typography, Grid, Paper } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { Description, BarChart, Work, AssignmentTurnedIn, Event, PeopleAlt, Chat, Phone } from '@mui/icons-material';
import { CALENDAR_PATH, CALLS_PATH, CHAT_PATH, CONTACTS_PATH, INFORMS_PATH, JOBS_PATH, KANBAN_PATH, STATS_PATH } from '../../routes/app-routes';
import { Link } from 'react-router-dom';

const Init = () => {
  const { t } = useTranslation();

  return (
    <Container>
      <Paper elevation={3} style={{ padding: '2rem', marginTop: '1rem' }}>
      <Grid container spacing={2} alignItems="center" justifyContent="center">
          <Grid item xs={12} md={2}>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <img src="/logo.png" alt="Descripción de la imagen" style={{ 
                width: '70%',
                maxWidth: '200px',
                marginBottom: '2rem', 
                borderRadius: '50%', 
                border: '4px solid #1976d2', 
                padding: '4px',
                '@media (minwidth: 600px)': {
                  maxWidth: '50%',
                }
              }}
             />
            </div>
          </Grid>
          <Grid item xs={12} md={10}>
            <Typography variant="h4" align="center" gutterBottom>
              {t('home.welcome')}
            </Typography>
            <Typography variant="body1" align="center" paragraph>
              {t('home.tools')}
            </Typography>
          </Grid>
        </Grid>
        <Grid container justifyContent="center" spacing={2}>
        <Grid item>
        <div style={{ textAlign: 'center' }}>
          <Work sx={{ fontSize: 30, color: '#1976d2' }} />
          <Typography variant="body1" style={{ color: '#1976d2', textDecoration: 'none' }}>
            <Link to={JOBS_PATH}>{t('home.jobs')}</Link>
          </Typography>
        </div>
        </Grid>
        <Grid item>
        <div style={{ textAlign: 'center' }}>
          <AssignmentTurnedIn sx={{ fontSize: 30, color: '#1976d2' }} />
          <Typography avariant="body1" style={{ color: '#1976d2', textDecoration: 'none' }}>
            <Link to={KANBAN_PATH}>{t('home.tasks')}</Link>
          </Typography>
        </div>
        </Grid>
        <Grid item>
        <div style={{ textAlign: 'center' }}>
          <Event sx={{ fontSize: 30, color: '#1976d2' }} />
          <Typography variant="body1" style={{ color: '#1976d2', textDecoration: 'none' }}>
            <Link to={CALENDAR_PATH}>{t('home.calendar')}</Link>
          </Typography>
        </div>
        </Grid>
        <Grid item>
        <div style={{ textAlign: 'center' }}>
          <BarChart sx={{ fontSize: 30, color: '#1976d2' }} />
          <Typography variant="body1" style={{ color: '#1976d2', textDecoration: 'none' }}>
            <Link to={INFORMS_PATH}>{t('home.reports')}</Link>
          </Typography>
        </div>
        </Grid>
        <Grid item>
        <div style={{ textAlign: 'center' }}>
          <Description sx={{ fontSize: 30, color: '#1976d2' }} />
          <Typography variant="body1" style={{ color: '#1976d2', textDecoration: 'none' }}>
            <Link to={STATS_PATH}>{t('home.stats')}</Link>
          </Typography>
        </div>
        </Grid>
        <Grid item>
        <div style={{ textAlign: 'center' }}>
          <PeopleAlt sx={{ fontSize: 30, color: '#1976d2' }} />
          <Typography variant="body1" style={{ color: '#1976d2', textDecoration: 'none' }}>
            <Link to={CONTACTS_PATH}>{t('home.contacts')}</Link>
          </Typography>
        </div>
        </Grid>
        <Grid item>
        <div style={{ textAlign: 'center' }}>
          <Chat sx={{ fontSize: 30, color: '#1976d2' }} />
          <Typography variant="body1" style={{ color: '#1976d2', textDecoration: 'none' }}>
            <Link to={CHAT_PATH}>{t('home.chats')}</Link>
          </Typography>
        </div>
        </Grid>
        <Grid item>
        <div style={{ textAlign: 'center' }}>
          <Phone sx={{ fontSize: 30, color: '#1976d2' }} />
          <Typography variant="body1" style={{ color: '#1976d2', textDecoration: 'none' }}>
            <Link to={CALLS_PATH}>{t('home.calls')}</Link>
          </Typography>
        </div>
        </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default Init;