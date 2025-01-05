import { Link } from 'react-router-dom';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import { useTranslation } from 'react-i18next';
import { HOME_PATH } from '../routes/app-routes';
import { Copyright } from '../components/Footer';
import { IconButton, Stack, Tooltip } from '@mui/material';
import GitHubIcon from '@mui/icons-material/GitHub';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';

const About = () => {
  const { t } = useTranslation();

  return (
    <Container maxWidth="md" style={{ marginTop: '40px' }}>
      <Typography variant="h3" align="center" alignContent="center" gutterBottom>
        {t('about_view.title')}              
      </Typography>
      <Typography variant="body1" paragraph>
        {t('about_view.p1')}              
      </Typography>
      <Typography variant="body1" paragraph>
        {t('about_view.p2')}              
      </Typography>
      <Typography variant="body1" paragraph>
        {t('about_view.p3')}              
      </Typography>
      <Grid container justifyContent="center" alignItems="center" spacing={2}>
        <Grid item>
          <img src="/uniovi.jpg" alt="Universidad de Oviedo" style={{ height: '100px' }} />
        </Grid>
        <Grid item>
          <img src="/eii.png" alt="Escuela de Ingeniería Informática" style={{ height: '100px' }} />
        </Grid>
      </Grid>
      <Stack
        direction="row"
        justifyContent="center"
        spacing={1}
        useFlexGap
        sx={{
          color: 'text.secondary',
        }}
      >
        <Tooltip title="GitHub">
          <IconButton
            color="inherit"
            href="https://github.com/miguelglez8"
            aria-label="GitHub"
            sx={{ alignSelf: 'center' }}
          >
            <GitHubIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="LinkedIn">
          <IconButton
            color="inherit"
            href="https://www.linkedin.com/in/miguelgonzaleznavarro/"
            aria-label="LinkedIn"
            sx={{ alignSelf: 'center' }}
          >
            <LinkedInIcon />
          </IconButton>
        </Tooltip>
      </Stack>
      <Grid container justifyContent="center">
        <Button component={Link} to={HOME_PATH} startIcon={<ArrowBackIosIcon />} variant="contained" color="primary" style={{ marginTop: '20px' }}>
          {t('about_view.button')}              
        </Button>
      </Grid>
      <Copyright sx={{ mt: 5 }} />
    </Container>
  );
};

export default About;
