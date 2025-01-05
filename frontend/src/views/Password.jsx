import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { useState } from 'react';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';
import { useTranslation } from 'react-i18next';
import Tooltip from '@mui/material/Tooltip';
import { Link, useNavigate } from 'react-router-dom';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import { HOME_PATH } from '../routes/app-routes';
import { EMAIL_API, NOTIFICATIONS_API, USERS_API } from '../routes/api-routes';
import { Copyright } from '../components/Footer';
import { useForm } from 'react-hook-form';
import axiosInstance from '../services/axios';

const defaultTheme = createTheme();

const Password = () => {
  const emailUser = localStorage.getItem('userEmail');
  const { t } = useTranslation();
  const navigate  = useNavigate();
  const { register, formState: {errors}, handleSubmit, watch } = useForm();

  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showRepeatPassword, setShowRepeatPassword] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [redirectToHome, setRedirectToHome] = useState(false);
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);

  const handleSnackbarClose = (reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarOpen(false);
    if (redirectToHome) {
      navigate(HOME_PATH);
    }
  };

  const update = async (data) => {
    const { newpassword } = data;

    try {
      const response = await axiosInstance.put(USERS_API + `/${emailUser}/password`, { 
        password: newpassword
      });

      if (response.data == null) {
        navigate(HOME_PATH);
        return;
      }
      
      await axiosInstance.post(EMAIL_API, {
        to: emailUser,
        subject: t('send_email.subject1'),
        text: t('send_email.text4'),
        confirm: true
      });

      await axiosInstance.post(NOTIFICATIONS_API + `/push`, {
        type: "CHANGE",
        receiver: emailUser,
        sender: "system",
        read: false,
        hidden: false,
        date: new Date(),
      });
      
      setIsButtonDisabled(true); 
      setSnackbarOpen(true);
      setRedirectToHome(true);
    } catch (error) {
      console.error('Error update password (missed token):', error);
    }  
};

  return (
    <ThemeProvider theme={defaultTheme}>
      <Container component="main" sx={{ width: '40vw', minWidth: "430px", display: 'flex',
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
          }}
        >
          <Typography variant="h4" align="center" gutterBottom>
          {t('recover_view.account')}{"\n"} {emailUser}
          </Typography>
          <Grid item xs={6}>
            <Typography component="h1" variant="h5" align="center">
              {t('recover_view.change_password')}
            </Typography>
          </Grid>
          <Box component="form" noValidate onSubmit={handleSubmit(update)} sx={{ mt: 3 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  disabled={isButtonDisabled}
                  required
                  fullWidth
                  autoFocus
                  name="password"
                  label={t('account_view.password')}
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
                          <Tooltip title={t('login_view.password_visibility_toggle')}>
                            {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                          </Tooltip>
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  {...register('password', {required: t('signup_view.actual_password'), pattern: {value: /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*()_+{}[\]:;<>,.?/\\~-]).{8,}$/, message: t('signup_view.actual_password')},
                  validate: async (value) => {
                    const response = await axiosInstance.post(USERS_API + `/${emailUser}/check-password`, {password: value});
                    const passwordsMatch = response.data;
                    return passwordsMatch || t('signup_view.actual_password');
                  }})}
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
                  label={t('recover_view.password_label')}
                  type={showNewPassword ? 'text' : 'password'}
                  id="newpassword"
                  autoComplete="new-password"
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          disabled={isButtonDisabled}
                          aria-label="toggle password visibility"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          edge="end"
                        >
                          <Tooltip title={t('login_view.password_visibility_toggle')}>
                            {showNewPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                          </Tooltip>
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  {...register('newpassword', {required: t('signup_view.password_error'), pattern: {value: /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*()_+{}[\]:;<>,.?/\\~-]).{8,}$/, message: t('signup_view.password_error')},
                  validate: (value) => {
                    return value != watch('password') || t('signup_view.new_password');
                  }})}
                  error={errors.newpassword}
                  helperText={errors.newpassword? errors.newpassword.message : ""}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  disabled={isButtonDisabled}
                  required
                  fullWidth
                  name="repeat-password"
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
                          <Tooltip title={t('login_view.password_visibility_toggle')}>
                            {showRepeatPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                          </Tooltip>
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  {...register('repeatpassword', {required: t('signup_view.repeat_password_error'),
                  validate: (value) => {
                    return value == watch('newpassword') || t('signup_view.repeat_password_error');
                  }})}
                  error={errors.repeatpassword}
                  helperText={errors.repeatpassword ? errors.repeatpassword.message : ""}
                />
              </Grid>
            </Grid>
            <Grid container alignItems="center" sx={{ mt: 3 }}>
            <Grid item xs={6}>
              <div style={{ marginRight: '7.5px' }}>
                <Button
                  variant="outlined"
                  component={Link}
                  to={HOME_PATH}
                  startIcon={<ArrowBackIosIcon />}
                  fullWidth
                > 
                  {t('recover_view.back')}
                </Button>
              </div>
              </Grid>
              <Grid item xs={6}>
                <Button type="submit" variant="contained" fullWidth disabled={isButtonDisabled}>
                  {t('recover_view.modify')}
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

export default Password;
