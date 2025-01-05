import { useState, useEffect } from 'react';
import { Typography, Button, TextField, Container, Grid, Tooltip } from '@mui/material';
import { useTranslation } from 'react-i18next';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import Avatar from '@mui/material/Avatar';
import IconButton from '@mui/material/IconButton';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import { Link } from 'react-router-dom';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined';
import { uploadImageToStorage, deleteImageFromStorage, checkImageExists } from '../services/firebase';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';
import { HOME_PATH } from '../routes/app-routes';
import { USERS_API } from '../routes/api-routes';
import { Copyright } from '../components/Footer';
import { useForm } from 'react-hook-form';
import axiosInstance from '../services/axios';

const defaultTheme = createTheme();

function Account() {
  const emailUser = localStorage.getItem('userEmail');
  const { t } = useTranslation();
  const { register, formState: { errors }, handleSubmit, setValue, watch } = useForm();

  const [role, setRole] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [borderColor, setBorderColor] = useState('#000');
  const [localImage, setLocalImage] = useState(null); 
  const [imageUploaded, setImageUploaded] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [isPlaceFocused, setIsPlaceFocused] = useState(false);
  const [isPhoneFocused, setIsPhoneFocused] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axiosInstance.get(USERS_API + `/${emailUser}`);
        const userDataFromApi = response.data;

        setValue('firstName', userDataFromApi.firstName, { shouldValidate: true });
        setValue('lastName', userDataFromApi.lastName, { shouldValidate: true });
        setValue('place', userDataFromApi.place, { shouldValidate: true });
        setValue('birthdate', userDataFromApi.birthdate, { shouldValidate: true });
        setValue('phoneNumber', userDataFromApi.phoneNumber == 0 ? '' : userDataFromApi.phoneNumber, { shouldValidate: true });

        setRole(userDataFromApi.role === 'STUDENT' ? t('recover_view.student') : t('recover_view.teacher'));
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    const fetchAvatarUrl = async () => {
      const url = await checkImageExists(emailUser);
      if (url) {
        setAvatarUrl(url);
      } 
    };

    fetchAvatarUrl();
    fetchData();
  }, [emailUser, t, setValue]);

  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarOpen(false);
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = () => {
      setAvatarUrl(reader.result)
      setLocalImage(file);
      setBorderColor('#00FF00');
      setImageUploaded(true);
    };

    reader.onerror = () => {
      setLocalImage(null)
      setAvatarUrl(null);
      setBorderColor('#FF0000');
      setImageUploaded(false);
    };

    if (file) {
      reader.readAsDataURL(file);
    }
  };

  const handleImageDelete = () => {
    setAvatarUrl(null);
    setBorderColor('#000');
  };

  const deleteImg = async () => {
    try {
      const avatarExists = await checkImageExists(emailUser);
      
      if (avatarExists) {
        await deleteImageFromStorage(emailUser);
      }
    } catch (error) {
      console.error('Error deleting avatar image:', error);
    }
  };

  const updateUser = async (data) => {
    const { firstName, lastName, place, birthdate, phoneNumber } = data;

    try {
      await axiosInstance.put(USERS_API + `/${emailUser}`, {
        firstName,
        lastName,
        place,
        birthdate,
        phoneNumber
      });
      
      setValue('firstName', data.firstName, { shouldValidate: true })
      setValue('lastName', data.lastName, { shouldValidate: true })
      setValue('place', data.place, { shouldValidate: true })
      setValue('birthdate', data.birthdate, { shouldValidate: true })
      setValue('phoneNumber', data.phoneNumber, { shouldValidate: true })

      if (avatarUrl == null) {
        await deleteImg();
      } else {
        if (imageUploaded) {
          await uploadImageToStorage(localImage, emailUser);
        }
      }

      setSnackbarOpen(true);
      setBorderColor('#000');
    } catch (error) {
      console.error('Error updating user information:', error);
    }
  };

  return (
    <ThemeProvider theme={defaultTheme}>
      <Container component="main" sx={{ width: '40vw', minWidth: "430px", display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'flex-start' }}>
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
              {t('recover_view.change_data')}
            </Typography>
          </Grid>
          <Box sx={{ marginTop:'10px', display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100px', height: '100px', borderRadius: '50%', border: '2px solid #ccc', position: 'relative' }}>
          <Avatar src={avatarUrl} sx={{ width: 100, height: 100, border: `1px solid ${borderColor}` }} />
            <Tooltip title={t('account_view.update_img')}>
              <label htmlFor="upload-image">
                <input
                  id="upload-image"
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={handleImageUpload}
                />
                <IconButton
                  sx={{ position: 'absolute', bottom: '-10px', right: '-20px', backgroundColor: '#fff', borderRadius: '50%' }}
                  component="span" 
                >
                  <CloudUploadOutlinedIcon color="primary" />
                </IconButton>
              </label>
            </Tooltip>
            <Tooltip title={t('account_view.delete_img')}>
            <IconButton
              sx={{ position: 'absolute', top: '-10px', left: '-20px', backgroundColor: '#fff', borderRadius: '50%', color: 'red' }}
              onClick={handleImageDelete}
            >
              <DeleteOutlineIcon />
            </IconButton>
          </Tooltip>
          </Box>
          <Box component="form" noValidate onSubmit={handleSubmit(updateUser)} sx={{ mt: 3 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  autoComplete="given-name"
                  name="firstName"
                  fullWidth
                  InputLabelProps={{
                    shrink: true,
                  }}
                  required
                  id="firstName"
                  label={t('signup_view.firstname')}
                  type="text"
                  variant='outlined'              
                  {...register('firstName', {required: t('signup_view.name_error'), maxLength: {value: 255, message: t('contacts.error_length') }} )}
                  error={errors.firstName}
                  helperText={errors.firstName? errors.firstName.message : ""}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  id="lastName"
                  label={t('signup_view.lastname')}
                  name="lastName"
                  required
                  InputLabelProps={{
                    shrink: true,
                  }}
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
                  fullWidth 
                  id="role" 
                  value={role}
                  label={t('signup_view.role')} 
                  name="role" 
                  autoComplete="role" 
                  type="text"
                  contentEditable={false}
                  InputProps={{
                    readOnly: true
                  }}
                  variant='outlined'
                /> 
              </Grid>
              <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type='date'
                label={t('signup_view.birthdate')}
                name="birthdate"
                required
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
                  fullWidth
                  id="place"
                  label={t('signup_view.residence')}
                  name="place"
                  InputLabelProps={{
                    shrink: isPlaceFocused || !!watch('place')
                  }}
                  onFocus={() => setIsPlaceFocused(true)}
                  onBlur={() => setIsPlaceFocused(false)}
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
                  fullWidth
                  id="phoneNumber"
                  label={t('phone_field.personal_phone')}
                  name="phoneNumber"
                  autoComplete="family-place"
                  type="tel"
                  variant='outlined'
                  InputLabelProps={{
                    shrink: isPhoneFocused || !!watch('phoneNumber')
                  }}
                  onFocus={() => setIsPhoneFocused(true)}
                  onBlur={() => setIsPhoneFocused(false)}
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
            </Grid>
            <Grid container justifyContent="space-between" alignItems="center" sx={{ mt: 3 }}>
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
              <div style={{ marginLeft: '7.5px' }}>
                <Button type="submit" variant="contained" fullWidth >
                  {t('account_view.update')}
                </Button>
                </div>
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
              {t('account_view.success_message')}
            </MuiAlert>
          </Snackbar>
        </Box>
        <Copyright sx={{ mt: 3 }} />
      </Container>
    </ThemeProvider>
  );
}

export default Account;