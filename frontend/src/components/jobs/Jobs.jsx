import { Container, Typography } from '@mui/material';
import JoinOrCreateTeamSection from './JoinOrCreateTeamSection';
import { useTranslation } from 'react-i18next';

const Jobs = () => {
  const { t } = useTranslation();

  return (
    <Container maxWidth="lg" style={{ width: '100%', marginTop: '20px', textAlign: 'center' }}>
      <Typography variant="h4" gutterBottom>
        {t('jobs.access')}
      </Typography>
      <JoinOrCreateTeamSection />
    </Container>
  );
};

export default Jobs;
