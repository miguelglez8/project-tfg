import { Typography, Box, Button } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { Link as RouterLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Container from '@mui/material/Container';
import { HOME_PATH } from '../routes/app-routes';
import { Copyright } from '../components/Footer';

const NotFound = () => {
  const { t } = useTranslation();

  return (
    <Container 
      component="main" 
      sx={{ height: '100vh', width: '40vw', minWidth: "430px", display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}
    >  
      <Box textAlign="center" mt={10} sx={{marginTop: 0}}>
      <ErrorOutlineIcon sx={{ fontSize: '100px', color: 'error.main' }} />
      <Typography variant="h3" color="textPrimary" mt={4}>
        {t('error_view.title')}
      </Typography>
      <Typography variant="body1" color="textSecondary" mt={2}>
        {t('error_view.not_found_message')}
      </Typography>
      <Typography variant="body1" color="textSecondary">
        {t('error_view.incorrect_url_message')}
      </Typography>
      <Typography variant="body1" color="textSecondary">
        {t('error_view.verify_url_message')}
      </Typography>
      <Box mt={2}>
        <Button variant="contained" color="error" component={RouterLink} to={HOME_PATH}>
          {t('error_view.home_button')}
        </Button>
      </Box>
      </Box>
      <Copyright sx={{ mt: 5 }} />
    </Container>
  );
};

export default NotFound;
