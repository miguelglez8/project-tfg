import { useState } from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Link from '@mui/material/Link';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import UploadImageButton from '../components/login/UploadImageButton';
import RoleSelection from '../components/login/RoleSelection';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';
import Tooltip from '@mui/material/Tooltip'; 
import { useTranslation } from 'react-i18next';
import { uploadImageToStorage } from '../services/firebase';
import { LOGIN_PATH } from '../routes/app-routes';
import { NOTIFICATIONS_API, USERS_API } from '../routes/api-routes';
import { Copyright } from '../components/Footer';
import { useForm } from 'react-hook-form';
import axiosInstance from '../services/axios';

const defaultTheme = createTheme();

function SignUp() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { register, formState: {errors}, handleSubmit, watch } = useForm();

  const [role, setRole] = useState('STUDENT');
  const [showPassword, setShowPassword] = useState(false);
  const [showRepeatPassword, setShowRepeatPassword] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [formDisabled, setFormDisabled] = useState(false); 
  const [selectedImage, setSelectedImage] = useState(null);

  const updateRole = (newRole) => {
    setRole(newRole);
  };

  const handleImageUploaded = (imageFile) => {
    setSelectedImage(imageFile);
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarOpen(false);
    navigate(LOGIN_PATH);
  };

  const onSubmit = async (data) => {
    const { firstName, lastName, email, place, birthdate, phoneNumber, password } = data;

    if (selectedImage) {
      await uploadImageToStorage(selectedImage, email);
    }

    try {
      await axiosInstance.post(USERS_API, { 
        role, 
        firstName, 
        lastName, 
        email, 
        place, 
        birthdate, 
        phoneNumber, 
        password 
      });
      await axiosInstance.post(NOTIFICATIONS_API + `/push`, {
        type: "WELCOME",
        receiver: email,
        sender: "system",
        read: false,
        hidden: false,
        date: new Date(),
      });

      setFormDisabled(true); 
      setSnackbarOpen(true); 
    } catch (error) { 
      console.error('Error register user:', error); 
    } 
  }

  return (
    <ThemeProvider theme={defaultTheme}>
      <Container component="main" sx={{ width: '40vw', minWidth: "430px", display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'flex-start' }}>
        <CssBaseline />
        <Box
            sx={{
              my: 8,
              mx: 4,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
        <Typography component="h1" variant="h5" sx={{ fontWeight: 'bold', fontSize: '1.6rem', textAlign: 'center'}}>
          {t('signup_view.title')}
        </Typography>
        <Grid container spacing={3}>
        <Grid item xs={6}>
          <Grid container direction="column" alignItems="center" justifyContent="center" spacing={1}>
            <Grid item>
              <Avatar alt="Logo" src="/logo.png" sx={{ width: 80, height: 80 }} />
            </Grid>
            <Grid item>
              <Typography component="h1" variant="h5" sx={{ textAlign: 'center' }}>
                {t('signup_view.register')}
              </Typography>
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs={6}>
          <RoleSelection onUpdateRole={updateRole} disabled={formDisabled} />
        </Grid>
        </Grid>
          <Box component="form" noValidate onSubmit={handleSubmit(onSubmit)} sx={{ mt: 3 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  disabled={formDisabled}
                  autoComplete="given-name"
                  name="firstName"
                  required
                  fullWidth
                  id="firstName"
                  label={t('signup_view.firstname')}
                  autoFocus
                  type="text"
                  variant='outlined'
                  {...register('firstName', {required: t('signup_view.name_error'), maxLength: {value: 255, message: t('contacts.error_length') }} )}
                  error={errors.firstName}
                  helperText={errors.firstName? errors.firstName.message : ""}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  disabled={formDisabled}
                  required
                  fullWidth
                  id="lastName"
                  label={t('signup_view.lastname')}
                  name="lastName"
                  autoComplete="family-name"
                  type="text"
                  variant='outlined'
                  {...register('lastName', {required: t('signup_view.lastname_error'), maxLength: {value: 255, message: t('contacts.error_length') }} )}
                  error={errors.lastName}
                  helperText={errors.lastName? errors.lastName.message : ""}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField 
                  disabled={formDisabled}
                  required 
                  fullWidth 
                  id="email" 
                  label={t('signup_view.email')} 
                  name="email" 
                  autoComplete="email" 
                  type="email"
                  variant='outlined'
                  {...register('email', {
                    required: t('signup_view.email_error'),
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: t('signup_view.email_error')
                    },
                    validate: async (value) => {
                      try {
                        const response = await axiosInstance.get(USERS_API + `/${value}`);
                        if (response.status === 200) {
                          return t('signup_view.duplicate_account_error');
                        } else {
                          return null;
                        }
                      } catch (error) {
                        return null;
                      }
                    }
                  })}
                  error={errors.email}
                  helperText={errors.email? errors.email.message : ""}
                /> 
              </Grid>
              <Grid item xs={12} sm={6}>
              <TextField
                disabled={formDisabled}
                fullWidth
                required
                type='date'
                label={t('signup_view.birthdate')}
                name="birthdate"
                InputLabelProps={{
                  shrink: true,
                }}
                variant='outlined'
                {...register('birthdate', {required: t('signup_view.birthdate_error'),
                validate: (value) => {
                  const inputDate = new Date(value);
                  const currentDate = new Date();
                  return inputDate < currentDate || t('signup_view.birthdate_error2');
                }})}
                error={errors.birthdate}
                helperText={errors.birthdate? errors.birthdate.message : ""}
              />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  disabled={formDisabled}
                  fullWidth
                  id="place"
                  label={t('signup_view.residence')}
                  name="place"
                  autoComplete="family-place"
                  type="text"
                  variant='outlined'
                  {...register('place', {maxLength: {value: 255, message: t('contacts.error_length')}} )}
                  error={errors.place}
                  helperText={errors.place ? errors.place.message : ""}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
              <TextField
                  disabled={formDisabled}
                  fullWidth
                  id="phoneNumber"
                  label={t('phone_field.personal_phone')}
                  name="phoneNumber"
                  autoComplete="family-place"
                  type="tel"
                  variant='outlined'
                  inputProps={{
                    pattern: "[0-9]*",
                    inputMode: "numeric",
                  }}
                  {...register('phoneNumber', {
                  validate: (value) => {
                    const regex = /^$|^\d{9}$|^\d{10}$|^\d{11}$/;
                    return regex.test(value) || t('signup_view.phone_error');
                  }})}
                  error={errors.phoneNumber}
                  helperText={errors.phoneNumber ? errors.phoneNumber.message : ""}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  disabled={formDisabled}
                  required
                  fullWidth
                  name="password"
                  label={t('signup_view.password')}
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  autoComplete="new-password"
                  variant='outlined'
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <Tooltip title={t('signup_view.password_visibility_toggle')} arrow>
                        <IconButton
                          disabled={formDisabled}
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
                  {...register('password', {required: t('signup_view.password_error'), pattern: {value: /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*()_+{}[\]:;<>,.?/\\~-]).{8,}$/, message: t('signup_view.password_error')}})}
                  error={errors.password}
                  helperText={errors.password? errors.password.message : ""}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  disabled={formDisabled}
                  required
                  fullWidth
                  name="confirmPassword"
                  label={t('signup_view.repeat_password')}
                  type={showRepeatPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  autoComplete="new-confirmPassword"
                  variant='outlined'
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <Tooltip title={t('signup_view.password_visibility_toggle')} arrow>
                          <IconButton
                            disabled={formDisabled}
                            aria-label="toggle repeat password visibility"
                            onClick={() => setShowRepeatPassword(!showRepeatPassword)}
                            edge="end"
                          >
                            {showRepeatPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                          </IconButton>
                        </Tooltip>
                      </InputAdornment>
                    ),
                  }}
                  {...register('confirmPassword', {required: t('signup_view.repeat_password_error'),
                  validate: (value) => {
                    return value == watch('password') || t('signup_view.repeat_password_error');
                  }})}
                  error={errors.confirmPassword}
                  helperText={errors.confirmPassword? errors.confirmPassword.message : ""}
                />
              </Grid>
            </Grid>
            <Grid container justifyContent="space-between" alignItems="center" sx={{ mt: 3 }}>
              <Grid item xs={6}>
                <UploadImageButton disabled={formDisabled} onImageUploaded={handleImageUploaded} />
              </Grid>
              <Grid item xs={6}>
              <div style={{ marginLeft: '7.5px' }}>
                <Button type="submit" variant="contained" fullWidth disabled={formDisabled}>
                  {t('signup_view.continue')}
                </Button>
                </div>
              </Grid>
            </Grid>
            <Grid container justifyContent="flex-end">
              <Grid item>
                <Link component={RouterLink} to={LOGIN_PATH} variant="body2">
                  {t('signup_view.have_account')}
                </Link>
              </Grid>
            </Grid>
          </Box>
          <Snackbar 
            open={snackbarOpen}
            autoHideDuration={3000}
            onClose={handleSnackbarClose}
            anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
          >
            <MuiAlert onClose={handleSnackbarClose} severity="success" sx={{ width: '100%' }}>
              {t('signup_view.success_message')}
            </MuiAlert>
          </Snackbar>
        </Box>
        <Copyright sx={{ mt: 3 }} />
      </Container>
    </ThemeProvider>
  );
}

export default SignUp;