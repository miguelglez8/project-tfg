import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { useState, useEffect } from 'react';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';
import { useTranslation } from 'react-i18next';
import Tooltip from '@mui/material/Tooltip';
import { EMAIL_API, NOTIFICATIONS_API, TOKEN_API, USERS_API } from '../routes/api-routes';
import { Copyright } from '../components/Footer';
import { LOGIN_PATH } from '../routes/app-routes';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import axiosInstance from '../services/axios';

const defaultTheme = createTheme();

const RecoverPassword = () => {
  const { t } = useTranslation();
  const navigate  = useNavigate();
  const { register, formState: {errors}, handleSubmit, watch } = useForm();
  const [, setIsValidToken] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showRepeatPassword, setShowRepeatPassword] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [redirectToHome, setRedirectToHome] = useState(false);
  const [isButtonDisabled, setIsButtonDisabled] = useState(false); 
  const queryParams = new URLSearchParams(window.location.search);
  const token = queryParams.get('token');
  const userEmail = queryParams.get('userEmail');

  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const token = queryParams.get('token');
    const userEmail = queryParams.get('userEmail');

    const validateToken = async () => {
      try {
        const response = await axiosInstance.get(TOKEN_API + `?token=${token}&email=${userEmail}`);
        if (!response.data) {
          navigate(LOGIN_PATH);
        }        
        setIsValidToken(response.data === true); 
      } catch (error) {
        navigate(LOGIN_PATH);
        setIsValidToken(false);
      }
    };

    validateToken();
  }, [navigate, token, userEmail]);

  const handleSnackbarClose = (reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarOpen(false);
    if (redirectToHome) {
      navigate(LOGIN_PATH);
    }
  };

  const recover = async (data) => {
    const { password } = data; 
  
    try {
      await axiosInstance.put(USERS_API + `/${userEmail}/password`, { 
        password: password
      });

      await axiosInstance.post(EMAIL_API, {
        to: userEmail,
        subject: t('send_email.subject1'),
        text: t('send_email.text4'),
        confirm: true,
        i18n: localStorage.getItem('language')
      });

      await axiosInstance.post(NOTIFICATIONS_API + `/push`, {
        type: "RECOVER",
        receiver: userEmail,
        sender: "system",
        read: false,
        hidden: false,
        date: new Date(),
      });
        
      setIsButtonDisabled(true); 
      setSnackbarOpen(true);
      setRedirectToHome(true);
    } catch (error) {
      console.log("Error recover password: " + error);
    }
  };

  return (
    <ThemeProvider theme={defaultTheme}>
      <Container component="main" sx={{ height: '100vh', width: '40vw', minWidth: "430px", display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center' }}>
        <CssBaseline />
        <Box
          sx={{
            my: 7,
            mx: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: 0
          }}
        >
          <Typography component="h1" variant="h5" sx={{ fontWeight: 'bold', fontSize: '1.6rem', textAlign: 'center'}}>
            {t('recover_view.title')}
          </Typography>
          <Grid item xs={6}>
            <Grid container direction="column" alignItems="center" justifyContent="center" spacing={1}>
              <Grid item>
                <Avatar alt="Logo" src="/logo.png" sx={{ width: 80, height: 80 }} />
              </Grid>
              <Grid item>
                <Typography component="h1" variant="h5" sx={{ textAlign: 'center' }}>
                  {t('recover_view.join_us')}
                </Typography>
              </Grid>
            </Grid>
          </Grid>
          <Box component="form" noValidate onSubmit={handleSubmit(recover)} sx={{ mt: 3 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  disabled={isButtonDisabled}
                  required
                  fullWidth
                  autoFocus
                  name="password"
                  label={t('recover_view.password_label')}
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  autoComplete="new-password"
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          disabled={isButtonDisabled}
                          aria-label="toggle password visibility"
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                        >
                          <Tooltip title={t('recover_view.password_visibility_toggle')}>
                            {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                          </Tooltip>
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  {...register('password', {required: t('recover_view.password_error'), pattern: {value: /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*()_+{}[\]:;<>,.?/\\~-]).{8,}$/, message: t('recover_view.password_error')}})}
                  error={errors.password}
                  helperText={errors.password? errors.password.message : ""}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  disabled={isButtonDisabled}
                  required
                  fullWidth
                  name="newpassword"
                  label={t('recover_view.repeat_password_label')}
                  type={showRepeatPassword ? 'text' : 'password'}
                  id="repeat-password"
                  autoComplete="new-repeat-password"
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          disabled={isButtonDisabled}
                          aria-label="toggle repeat password visibility"
                          onClick={() => setShowRepeatPassword(!showRepeatPassword)}
                          edge="end"
                        >
                          <Tooltip title={t('recover_view.password_visibility_toggle')}>
                            {showRepeatPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                          </Tooltip>
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  {...register('newpassword', {required: t('recover_view.repeat_password_error'), pattern: {value: /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*()_+{}[\]:;<>,.?/\\~-]).{8,}$/, message: t('recover_view.repeat_password_error')},
                  validate: (value) => {
                    return value == watch('password') || t('recover_view.repeat_password_error');
                  }})}
                  error={errors.newpassword}
                  helperText={errors.newpassword? errors.newpassword.message : ""}
                />
              </Grid>
            </Grid>
            <Grid container alignItems="center" sx={{ mt: 3 }}>
              <Grid item xs={12}>
                <Button type="submit" variant="contained" fullWidth disabled={isButtonDisabled}>
                  {t('recover_view.reset_button')}
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
            {t('recover_view.success_message')}
          </MuiAlert>
        </Snackbar>
        <Copyright sx={{ mt: 3 }} />
      </Container>
    </ThemeProvider>
  );
}

export default RecoverPassword;
