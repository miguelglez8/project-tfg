import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Avatar, Button, Grid, Radio, RadioGroup, FormControlLabel, TextField, CssBaseline, Typography, Box, IconButton, Tooltip, Snackbar } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { checkImageExists, deleteImageFromStorage, uploadImageToStorage } from '../../services/firebase';
import { JOBS_API, NOTIFICATIONS_API } from '../../routes/api-routes';
import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import MuiAlert from '@mui/material/Alert';
import axiosInstance from '../../services/axios';
import { useNavigate } from 'react-router-dom';
import { JOBS_PATH, LOGIN_PATH } from '../../routes/app-routes';
import { clearLocalStorage } from '../../App';

const JobDetails = ({ job }) => {
  const user = localStorage.getItem('userEmail');
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { register, formState: { errors }, handleSubmit, setValue, watch } = useForm();

  const [avatarUrl, setAvatarUrl] = useState('');
  const [borderColor, setBorderColor] = useState('#000');
  const [localImage, setLocalImage] = useState(null);
  const [imageUploaded, setImageUploaded] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [priority, setPriority] = useState(job.priority || '');
  const [type, setType] = useState(job.type || '');
  const [isSubjectFocused, setIsSubjectFocused] = useState(false);

  useEffect(() => {
    const isAdmin = async () => {
      try {
        const response = await axiosInstance.get(JOBS_API + `/isAdmin`, {
          params: {
            jobTitle: job.title,
            userEmail: user
          }
        });

        if (response.data == false) {
          navigate(JOBS_PATH);
        }
      } catch (error) {
        if (error.response.status == 401) {
          clearLocalStorage();
          navigate(LOGIN_PATH);
        }
        console.error("Error get admin:", error);
      }
    };

    isAdmin();
  }, [job, user, navigate]);

  useEffect(() => {
    const getJobByTitle = async () => {
      try {
        const response = await axiosInstance.get(`${JOBS_API}/${job.title}/job`);

        const dataFromApi = response.data;

        setValue('creator', dataFromApi.creator, { shouldValidate: true });
        setValue('title', dataFromApi.title, { shouldValidate: true });
        setValue('description', dataFromApi.description, { shouldValidate: true });
        setValue('relatedSubject', dataFromApi.relatedSubject, { shouldValidate: true });
        setValue('deadlineDateTime', dataFromApi.deadlineDateTime, { shouldValidate: true });
        setValue('note', dataFromApi.note, { shouldValidate: true });

        setPriority(dataFromApi.priority);
        setType(dataFromApi.type);
      } catch (error) {
        if (error.response.status == 401) {
          clearLocalStorage();
          navigate(LOGIN_PATH);
        }
        console.error('Error obtaining job:', error);
      }
    };

    const fetchAvatarUrl = async () => {
      const url = await checkImageExists(job.title);
      if (url) {
        setAvatarUrl(url);
      }
    };

    getJobByTitle();
    fetchAvatarUrl();
  }, [job, setValue, navigate]);

  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarOpen(false);
  };

  const handleImageUpload = async (event) => {
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

  const handlePriorityChange = (event) => {
    setPriority(event.target.value);
  };

  const handleTypeChange = (event) => {
    setType(event.target.value);
  };

  const deleteImg = async () => {
    try {
      const avatarExists = await checkImageExists(job.title);

      if (avatarExists) {
        await deleteImageFromStorage(job.title);
      }
    } catch (error) {
      console.error('Error deleting avatar image:', error);
    }
  };

  const handleUpdate = async (data) => {
    const { description, relatedSubject, deadlineDateTime, note } = data;

    try {
      await axiosInstance.put(JOBS_API + `/${job.id}?user=${user}`, {
        description,
        type,
        priority,
        relatedSubject,
        deadlineDateTime,
        note
      });

      setValue('description', data.description, { shouldValidate: true });
      setValue('relatedSubject', data.relatedSubject, { shouldValidate: true });
      setValue('deadlineDateTime', data.deadlineDateTime, { shouldValidate: true });
      setValue('note', data.note, { shouldValidate: true });

      if (avatarUrl == null) {
        await deleteImg();
      } else if (imageUploaded) {
        await uploadImageToStorage(localImage, job.title);
      }

      setSnackbarOpen(true);
      setBorderColor('#000');

    } catch (error) {
      if (error.response.status == 401) {
        clearLocalStorage();
        navigate(LOGIN_PATH);
      }
      console.error('Error updating user information:', error);
      navigate(JOBS_PATH);
      return;
    }

    if (data.note > 0 && data.note != job.note) {
      job.note = data.note;
      await axiosInstance.post(NOTIFICATIONS_API + `/push`, {
        type: "JOB_NOTE",
        receiver: job.title,
        sender: user,
        read: false,
        hidden: false,
        date: new Date()
      });
    }
    
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', width: '60%', marginLeft: '-35px' }}>
      <CssBaseline />
      <Box
        sx={{
          my: 0,
          mx: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Typography variant="h4" align="center" gutterBottom>
          {t('jobs.job_create')}{job.creator}{"\n"}
        </Typography>
        <Grid item xs={6}>
          <Typography component="h1" variant="h5" align="center">
            {t('jobs.job_edit')}
          </Typography>
        </Grid>
        <Box sx={{ marginTop: '10px', display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100px', height: '100px', borderRadius: '50%', border: '2px solid #ccc', position: 'relative' }}>
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
        <Box component="form" noValidate onSubmit={handleSubmit(handleUpdate)} sx={{ mt: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                id="title"
                label={t('jobs.title')}
                name="title"
                autoComplete="family-name"
                type="text"
                InputProps={{
                  readOnly: true
                }}
                variant="outlined"
                value={job.title || ''}
                contentEditable={false}
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                id="deadlineDateTime"
                label={t('tasks.label_date')}
                name="deadlineDateTime"
                autoComplete="family-name"
                type="datetime-local"
                required
                InputLabelProps={{
                  shrink: true,
                }}
                variant="outlined"
                {...register('deadlineDateTime', {required: t('signup_view.birthdate_error'),
                validate: (value) => {
                  const inputDate = new Date(value);
                  const currentDate = new Date();
                  return inputDate > currentDate || t("tasks.error_date2");
                }})}
                error={errors.deadlineDateTime}
                helperText={errors.deadlineDateTime? errors.deadlineDateTime.message : ""}
              />
            </Grid>
            <Grid item xs={12} sm={12}>
              <TextField
                fullWidth
                id="description"
                label={t('tasks.label_subject')}
                name="description"
                autoComplete="family-name"
                type="text"
                variant="outlined"
                multiline
                required
                rows={3}
                InputLabelProps={{
                  shrink: true,
                }}
                {...register('description', {required: t('jobs.error_description'), maxLength: {value: 255, message: t('contacts.error_length')}} )}
                error={errors.description}
                helperText={errors.description ? errors.description.message : ""}
              />
            </Grid>
            <Grid item xs={12} sm={12}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <Typography variant="h6" style={{ marginRight: '10px', width: '30%' }}>{t('jobs.type')}:</Typography>
                <RadioGroup
                  id="type"
                  aria-label="type"
                  name="type"
                  value={type}
                  onChange={handleTypeChange}
                  style={{ flexDirection: 'row' }}
                >
                  <FormControlLabel value="TFG" control={<Radio />} label="TFG" />
                  <FormControlLabel value="TFM" control={<Radio />} label="TFM" />
                  <FormControlLabel value="THESIS" control={<Radio />} label={t('jobs.thesis')} />
                  <FormControlLabel value="OTHER" control={<Radio />} label={t('jobs.other')} />
                </RadioGroup>
              </div>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                id="relatedSubject"
                label={t('jobs.subject')}
                name="relatedSubject"
                autoComplete="family-name"
                type="text"
                variant="outlined"
                InputLabelProps={{
                  shrink: isSubjectFocused || !!watch('relatedSubject')
                }}
                onFocus={() => setIsSubjectFocused(true)}
                onBlur={() => setIsSubjectFocused(false)}
                {...register('relatedSubject', {maxLength: {value: 255, message: t('contacts.error_length')}} )}
                error={errors.relatedSubject}
                helperText={errors.relatedSubject ? errors.relatedSubject.message : ""}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              id="note"
              label={t('jobs.note')}
              name="note"
              autoComplete="family-name"
              type="text"
              variant="outlined"
              InputLabelProps={{
                shrink: true,
              }}
              inputProps={{
                inputMode: "numeric",
              }}
              {...register('note', {
                  validate: (value) => {
                    const regex = /^\d*\.?\d*$/;
                    return regex.test(value) || t('jobs.error_note');
                  }
              })}
              error={errors.note}
              helperText={errors.note ? errors.note.message : ""}
            />
            </Grid>
            <Grid item xs={12} sm={12}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <Typography variant="h6" style={{ marginRight: '10px', width: '30%' }}>{t('jobs.priority')}:</Typography>
                <RadioGroup
                  id="priority"
                  aria-label="priority"
                  name="priority"
                  value={priority}
                  onChange={handlePriorityChange}
                  style={{ flexDirection: 'row' }}
                >
                  <FormControlLabel value="HIGH" control={<Radio />} label={t('jobs.high')} />
                  <FormControlLabel value="MEDIUM" control={<Radio />} label={t('jobs.medium')} />
                  <FormControlLabel value="LOW" control={<Radio />} label={t('jobs.low')} />
                </RadioGroup>
              </div>
            </Grid>
            <Grid item xs={12}>
              <Button type="submit" variant="contained" color="primary" fullWidth>
                {t('home_view.update')}
              </Button>
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
    </div>
  );
};

JobDetails.propTypes = {
  job: PropTypes.shape({
    id: PropTypes.number,
    creator: PropTypes.string,
    title: PropTypes.string,
    description: PropTypes.string,
    type: PropTypes.string,
    priority: PropTypes.string,
    relatedSubject: PropTypes.string,
    deadlineDateTime: PropTypes.string,
    note: PropTypes.number,
  }).isRequired,
};

export default JobDetails;
