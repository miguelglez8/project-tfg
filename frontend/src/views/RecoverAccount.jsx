import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { Link as RouterLink } from 'react-router-dom';
import { useState } from 'react';
import DoneIcon from '@mui/icons-material/Done';
import { useTranslation } from 'react-i18next';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';
import { LOGIN_PATH } from '../routes/app-routes';
import { EMAIL_API, USERS_API } from '../routes/api-routes';
import { Copyright } from '../components/Footer';
import { useForm } from 'react-hook-form';
import axiosInstance from '../services/axios';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';

function RecoverAccount() {
  const { t } = useTranslation();
  const { register, formState: {errors}, handleSubmit, watch } = useForm();

  const [emailSent, setEmailSent] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const handleSnackbarClose = (reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarOpen(false);
  };

  const getUserByEmail = async (email) => {
    try {
      const response = await axiosInstance.get(USERS_API + `/${email}`);
      return response.data;
    } catch (error) {
      if (error.response.status === 404) {
        return null; 
      }
      throw error;
    }
  };

  const submit = async (data) => {
    const { email } = data;

    try {
      const user = await getUserByEmail(email);

      await axiosInstance.post(EMAIL_API, {
        to: email,
        subject: t('send_email.subject'),
        text: t('send_email.text1') + user.firstName + " " + user.lastName + t('send_email.text2') + t('send_email.text3')
      });

      setEmailSent(true);
      setSnackbarOpen(true);
    } catch (error) {
      console.error('Error sending email to user:', error);
    }
  };

  return (
    <ThemeProvider theme={createTheme()}>
        <Container component="main" sx={{ height: '100vh', width: '40vw', minWidth: "430px", display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center', }}>        
        <CssBaseline />
        <Box
          sx={{
            my: 7,
            mx: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Typography component="h1" variant="h5" sx={{ fontWeight: 'bold', fontSize: '1.6rem', textAlign: 'center'}}>
            {t('recover_view.title')}
          </Typography>
          <Grid item xs={12} sm={6} md={4}>
            <Grid container direction="column" alignItems="center" justifyContent="center" spacing={1}>
              <Grid item>
                <Avatar alt="Logo" src="/logo.png" sx={{width: 80, height: 80 }}/>
              </Grid>
              <Grid item>
                <Typography component="h1" variant="h5" sx={{ textAlign: 'center' }}>
                  {t('recover_view.join_us2')}
                </Typography>
              </Grid>
            </Grid>
          </Grid>
          <Box component="form" noValidate onSubmit={handleSubmit(submit)} sx={{ mt: 3, width: '80%' }} >
            <Grid container spacing={2}>
              <Grid item xs={12} sm={20}>
                <TextField
                  required
                  fullWidth
                  name="email"
                  label={t('recover_view.email')}
                  id="email"
                  type="text"
                  autoFocus
                  disabled={emailSent}
                  {...register('email', {
                    required: t('recover_view.valid_email'),
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: t('recover_view.valid_email')
                    },
                    validate: async (value) => {
                      const user = await getUserByEmail(value);
                      return user || t('recover_view.exist');          
                    }
                  })}
                  error={errors.email}
                  helperText={errors.email? errors.email.message : ""}
                />
                {emailSent && (
                <p style={{ color: 'green', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '5px' }}>
                  <DoneIcon style={{ marginRight: '5px' }} />
                  {t('recover_view.sent')}{watch('email')}{"\n"}{t('recover_view.spam')}

                </p>
              )}
              </Grid>
            </Grid>
            <Grid container justifyContent="space-between" alignItems="center" sx={{ mt: 3 }}>
              <Grid item xs={6}>
                <Button variant="outlined" color="primary" startIcon={<ArrowBackIosIcon />}fullWidth sx={{ marginRight: '7.5px', width: '95%' }} component={RouterLink} to={LOGIN_PATH}>
                  {t('recover_view.back')}
                </Button>
              </Grid>
              <Grid item xs={6}>
                <Button type="submit" variant="contained" disabled={emailSent} sx={{ marginLeft: '7.5px', width: '95%' }}>
                  {t('recover_view.request')}
                </Button>
              </Grid>
            </Grid>
          </Box>
        </Box>
        <Snackbar 
          open={snackbarOpen}
          autoHideDuration={3000}
          onClose={handleSnackbarClose}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <MuiAlert onClose={handleSnackbarClose} severity="success" sx={{ width: '100%' }}>
            {t('recover_view.email_message')}
          </MuiAlert>
        </Snackbar>
        <Copyright sx={{ mt: 3 }} />
      </Container>
    </ThemeProvider>
  );
}

export default RecoverAccount;
