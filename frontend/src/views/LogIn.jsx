import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import LanguageSelector from '../components/login/LanguageSelector';
import Link from '@mui/material/Link';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Tooltip from '@mui/material/Tooltip';
import { HOME_PATH, RECOVER_ACCOUNT_PATH, SIGNUP_PATH } from '../routes/app-routes';
import { AUTH_API } from '../routes/api-routes';
import { Copyright } from '../components/Footer';
import { useForm } from 'react-hook-form';
import axiosInstance from '../services/axios';

const defaultTheme = createTheme();

export default function LogIn() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { register, formState: {errors}, handleSubmit } = useForm();

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const login = async (data) => {
    const { email, password } = data;

    try {
      const response = await axiosInstance.post(AUTH_API, {
        email: email,
        password: password
      });
      if (response.status === 200) {
        const data = response.data;
        localStorage.setItem('token', data.token);
        localStorage.setItem('userEmail', email);
        navigate(HOME_PATH);
      } else {
        setError(t('login_view.no_user_error'));
      }    
    } catch (error) {
      setError(t('login_view.no_user_error'));
      console.error('Error login:', error);
    }
  };

  return (
    <ThemeProvider theme={defaultTheme}>
      <Grid container component="main" sx={{ height: '100vh', width: '100vw', minWidth: "430px", justifyContent: 'center'}}>
        <CssBaseline />
        <Grid
          item
          xs={false}
          sm={4}
          md={7}
          sx={{
            backgroundImage: 'url(/fondo.jpg)',
            backgroundRepeat: 'no-repeat',
            backgroundColor: (t) =>
              t.palette.mode === 'light' ? t.palette.grey[50] : t.palette.grey[900],
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            alignItems: 'center',
          }}
        />
        <Grid item xs={12} sm={8} md={5} component={Paper} elevation={6} square>
          <Box
            sx={{
              mx: 4,
              height: "100vh",
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Typography component="h1" variant="h5" sx={{ fontWeight: 'bold', fontSize: '1.6rem', textAlign: 'center'}}>
              {t('login_view.title')}
            </Typography>
            <Typography component="h4" sx={{ fontSize: '1.2rem', textAlign: 'center', color: 'text.secondary'}}>
              {t('login_view.subtitle')}
            </Typography>
            <Avatar
              alt="Logo"
              src="/logo.png"
              sx={{ width: 80, height: 80, marginBottom: "10px" }}
            />
            <Typography component="h1" variant="h5" sx={{ textAlign: 'center' }}>
              {t('login_view.join_us')}
            </Typography>
            <Box component="form" noValidate onSubmit={handleSubmit(login)} sx={{ mt: 1 }}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label={t('login_view.email_label')}
                name="email"
                autoComplete="email"
                autoFocus
                {...register('email', {
                  required: t('login_view.email_error'),
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: t('login_view.email_error')
                }})}
                error={errors.email}
                helperText={errors.email? errors.email.message : ""}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label={t('login_view.password_label')}
                type={showPassword ? 'text' : 'password'}
                id="password"
                autoComplete="current-password"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <Tooltip title={t('signup_view.password_visibility_toggle')} arrow>
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </Tooltip>
                    </InputAdornment>
                  ),
                }}
                {...register('password', {required: t('login_view.password_error'), pattern: {value: /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*()_+{}[\]:;<>,.?/\\~-]).{8,}$/, message: t('login_view.password_error')}})}
                error={errors.password}
                helperText={errors.password? errors.password.message : ""}
              />
              {error && (
                <p style={{ color: 'red', marginTop: '5px', textAlign: 'center' }}>
                  {t('login_view.no_user_error')}
                </p>
              )}
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
              >
                {t('login_view.login_button')}
              </Button>
              <Grid container>
                <Grid item xs>
                  <Link component={RouterLink} to={RECOVER_ACCOUNT_PATH} variant="body2">
                    {t('login_view.forgot_password')}
                  </Link>
                </Grid>
                <Grid item>
                  <Link component={RouterLink} to={SIGNUP_PATH} variant="body2">
                    {t('login_view.no_account')}
                  </Link>
                </Grid>
              </Grid>
              <LanguageSelector />
              <Copyright sx={{ mt: 4 }} />
            </Box>
          </Box>
        </Grid>
      </Grid>
    </ThemeProvider>
  );
}
