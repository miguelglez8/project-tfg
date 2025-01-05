import PropTypes from 'prop-types';
import { Typography, Paper, Grid, Chip } from '@mui/material';
import { Schedule, LabelImportant } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

const JobInfo = ({ job }) => {
  const { t } = useTranslation();

  const formatDate = (date) => {
    return new Intl.DateTimeFormat('es-ES', {
      year: 'numeric',
      month: 'long',
      day: '2-digit',
      hour: 'numeric',
      minute: 'numeric',
    }).format(new Date(date));
  };

  return (
    <div style={{ width: '80vw', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <Paper elevation={3} style={{ padding: '10px', width: '70%', textAlign: 'center', alignItems: 'center' }}>
        <Typography variant="h4" textAlign='center' gutterBottom>{t('jobs.title')}: {job.title}</Typography>
        <Typography variant="body1" gutterBottom><b>{t('jobs.creator')}:</b> {job.creator}</Typography>
        <Typography variant="body1" gutterBottom><b>{t('jobs.description')}:</b> {job.description}</Typography>
        <Typography variant="body1" gutterBottom><b>{t('jobs.type')}:</b> {job.type == "THESIS" ? t('jobs.thesis') : (job.type == "OTHER" ? t('jobs.other') : job.type)}</Typography>
        <Typography variant="body1" gutterBottom><b>{t('jobs.priority')}:</b> {job.priority == "NONE" ? t('jobs.none') : (job.priority == "HIGH" ? t('jobs.high') : (job.priority == "LOW" ? t('jobs.low') : t('jobs.medium')))}</Typography>
        <Typography variant="body1" gutterBottom><b>{t('jobs.relatedSubject')}:</b> {job.relatedSubject !== "" ? job.relatedSubject : t('jobs.noRelatedSubject')}</Typography>
        <Typography variant="body1" gutterBottom><b>{t('jobs.deadline')}:</b> <Schedule /> {formatDate(job.deadlineDateTime)}</Typography>
        <Typography variant="body1" gutterBottom><b>{t('jobs.note')}:</b> {job.note !== 0 ? job.note : t('jobs.noNote')}</Typography>
        <Grid container spacing={1} style={{ textAlign: 'center', marginTop: "10px", alignContent: 'center', justifyContent: 'center' }}>
          {job.note === 0 && (
            <Grid item>
              <Chip label={t('jobs.inProgress')} color="primary" icon={<Schedule />} />
            </Grid>
          )}
          {job.note !== 0 && (
            <Grid item>
              <Chip label={t('jobs.completed')} color="error" icon={<Schedule />} />
            </Grid>
          )}
          {job.priority === 'HIGH' && (
            <Grid item>
              <Chip label={t('jobs.highPriority')} color="error" icon={<LabelImportant />} />
            </Grid>
          )}
          {job.priority === 'MEDIUM' && (
            <Grid item>
              <Chip label={t('jobs.mediumPriority')} color="warning" icon={<LabelImportant />} />
            </Grid>
          )}
          {job.priority === 'LOW' && (
            <Grid item>
              <Chip label={t('jobs.lowPriority')} color="info" icon={<LabelImportant />} />
            </Grid>
          )}
        </Grid>
      </Paper>
    </div>
    
  );
};

JobInfo.propTypes = {
  job: PropTypes.shape({
    id: PropTypes.number,
    creator: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    priority: PropTypes.string.isRequired,
    relatedSubject: PropTypes.string,
    deadlineDateTime: PropTypes.string.isRequired,
    note: PropTypes.number,
  }).isRequired,
};

export default JobInfo;
