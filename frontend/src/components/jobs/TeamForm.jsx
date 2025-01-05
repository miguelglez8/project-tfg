import { useEffect, useState } from 'react';
import { Box, Button, Dialog, DialogActions, IconButton, DialogContent, FormControl, FormControlLabel, Radio, RadioGroup, TextField, Typography, MenuItem, InputLabel, Select, Tooltip } from '@mui/material';
import PropTypes from 'prop-types';
import { useForm } from 'react-hook-form';
import { JOBS_API, USERS_API, NOTIFICATIONS_API } from '../../routes/api-routes';
import { useTranslation } from 'react-i18next';
import DeleteIcon from '@mui/icons-material/Delete';
import UserProfileAvatar from '../home/UserProfileAvatar';
import UploadImageButton from '../login/UploadImageButton';
import { uploadImageToStorage } from '../../services/firebase';
import axiosInstance from '../../services/axios';
import { useNavigate } from 'react-router-dom';
import { LOGIN_PATH } from '../../routes/app-routes';
import { clearLocalStorage } from '../../App';

const TeamForm = ({ open, onClose, setCreated, fetchData }) => {
  const user = localStorage.getItem('userEmail');
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { register, formState: {errors}, handleSubmit, reset } = useForm();

  const [friends, setFriends] = useState([]);
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [, setSearchTerm] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);

  let [teamData, setTeamData] = useState({
    title: '',
    description: '',
    type: '',
    priority: '',
    relatedSubject: '',
    deadlineDateTime: '',
    userProfilePicture: ''
  });

  useEffect(() => {
    const fetchFriends = async () => {
      try {
        const response = await axiosInstance.get(`${USERS_API}/${user}/friends`);
        const teachers = response.data.filter((friend) => friend.role === 'TEACHER');
        setFriends(teachers);
      } catch (error) {
        console.error('Error fetching friends:', error);
      }
    };

    fetchFriends();
  }, [user]);

  useEffect(() => {
    if (open) {
      setTeamData({
        title: '',
        description: '',
        type: '',
        priority: '',
        relatedSubject: '',
        deadlineDateTime: ''
      });

      reset({
        title: '',
        description: '',
        type: '',
        priority: '',
        relatedSubject: '',
        deadlineDateTime: ''
      });

      setSelectedFriend(null);
    }
  }, [open, reset]);
  
  const handleFriendSelect = (friend) => {
    setSelectedFriend(friend);
    setSearchTerm('');
  };

  const handleImageUploaded = (imageFile) => {
    setSelectedImage(imageFile);
  };

  const handleTypeChange = (e) => {
    setTeamData(prevData => ({
      ...prevData,
      type: e.target.value,
    }));
  };

  const handlePriorityChange = (e) => {
    setTeamData(prevData => ({
      ...prevData,
      priority: e.target.value,
    }));
  };

  const handleSearchInputChange = (event) => {
    setSearchTerm(event.target.value);
  };
 
  const createTeam = async (data) => {
    const { title, description, relatedSubject, deadlineDateTime } = data;

    teamData = { ...teamData, title, description, relatedSubject, deadlineDateTime, type: teamData.type, priority: teamData.priority, assignedTo: selectedFriend?.email, creator: user }
    
    if (selectedImage) {
      await uploadImageToStorage(selectedImage, title);
    }

    try {
      await axiosInstance.post(JOBS_API, teamData);

      if (selectedFriend != null) {
        await axiosInstance.post(JOBS_API + '/members?jobTitle=' + title + "&userEmail=" + selectedFriend?.email + "&user=" + user);
      }  
    } catch (error) {
      if (error.response.status == 401) {
        clearLocalStorage();
        navigate(LOGIN_PATH);
      }
      console.error("Error create job: " + error);
      onClose();
      return;
    }

    if (selectedFriend != null) {
      await axiosInstance.post(NOTIFICATIONS_API + `/push`, {
        type: "JOB_ADD_MEMBER",
        receiver: selectedFriend.email,
        sender: user,
        read: false,
        hidden: false,
        date: new Date(),
        titleTeam: title
      });
    }
   
    setCreated(true);
    fetchData();

    onClose();     
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <Typography variant="h5" align="center" sx={{ marginTop: '15px'}}>{t('jobs.create_job')}</Typography>
      <DialogContent>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <TextField
                style={{ width: '48%' }}
                fullWidth
                margin="normal"
                label={t('jobs.title')}
                name="title"
                variant='outlined'
                autoFocus={true}
                required
                {...register('title', { 
                  required: t('tasks.error_title'),
                  maxLength: { value: 255, message: t("contacts.error_length") },
                  validate: async (value) => {
                    try {
                      const response = await axiosInstance.get(JOBS_API + `/${value}/job`);
                      if (response.status === 200) {
                        return t('jobs.job_register');
                      } else {
                        return null;
                      }
                    } catch (error) {
                      if (error.response.status == 401) {
                        clearLocalStorage();
                        navigate(LOGIN_PATH);
                      }
                      return null;
                    }
                  }
                })}
                error={errors.title}
                helperText={errors.title? errors.title.message : ""}
            />
            <TextField
                style={{ width: '48%' }}
                fullWidth
                margin="normal"
                label={t('tasks.label_date')}
                name="deadlineDateTime"
                type="datetime-local"
                InputLabelProps={{ shrink: true }}
                required
                variant='outlined'
                {...register('deadlineDateTime', { required: t('tasks.error_date1'),
                    validate: (value) => {
                    const inputDate = new Date(value);
                    const currentDate = new Date();
                    return inputDate > currentDate || t('tasks.error_date2');
                  }
                })}
                error={errors.deadlineDateTime}
                helperText={errors.deadlineDateTime ? errors.deadlineDateTime.message : ""}
            />
        </div>
        <TextField
            fullWidth
            margin="normal"
            label={t('tasks.label_subject')}
            name="description"
            variant='outlined'
            required
            multiline
            rows={3}
            {...register('description', {required: t('jobs.error_description'), maxLength: {value: 255, message: t('contacts.error_length')}} )}
            error={errors.description}
            helperText={errors.description ? errors.description.message : ""}
        />
        <div style={{ display: 'flex', alignItems: 'center', alignContent: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6" style={{ width: '10%' }}>{t('jobs.type')}:</Typography>
          <RadioGroup 
            row 
            aria-label="type" 
            name="type" 
            value={teamData.type} 
            onChange={handleTypeChange}
            style={{alignItems: 'center', width: '100%', marginLeft: '25px'}}
          >
            <FormControlLabel value="TFG" control={<Radio />} label="TFG" />
            <FormControlLabel value="TFM" control={<Radio />} label="TFM" />
            <FormControlLabel value="THESIS" control={<Radio />} label={t('jobs.thesis')} />
            <FormControlLabel value="OTHER" control={<Radio />} label={t('jobs.other')} />
          </RadioGroup>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <TextField
                style={{ width: '100%' }}
                fullWidth
                margin="normal"
                label={t('jobs.subject')}
                name="relatedSubject"
                variant='outlined'
                {...register('relatedSubject', {maxLength: {value: 255, message: t('contacts.error_length')}} )}
                error={errors.relatedSubject}
                helperText={errors.relatedSubject ? errors.relatedSubject.message : ""}
            />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', alignContent: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
          <Typography variant="h6" style={{ width: '40%' }}>{t('jobs.priority')}:</Typography>
          <RadioGroup 
            row 
            aria-label="priority" 
            name="priority" 
            value={teamData.priority}
            onChange={handlePriorityChange}
            style={{alignItems: 'center', width: '80%'}}
            required
          >
            <FormControlLabel value="HIGH" control={<Radio />} label={t('jobs.high')} />
            <FormControlLabel value="MEDIUM" control={<Radio />} label={t('jobs.medium')} />
            <FormControlLabel value="LOW" control={<Radio />} label={t('jobs.low')} />
          </RadioGroup>
        </div>
        <FormControl fullWidth>
        {friends.length > 0 ? (
        <div>
          <InputLabel id="demo-simple-select-label">{t('jobs.teacher')}</InputLabel>
          <Select
            labelId="demo-simple-select-label"
            id="demo-simple-select"
            value={selectedFriend ? selectedFriend.email : ''}
            label={t('jobs.teacher')}
            onChange={(event) => {
              const friendEmail = event.target.value;
              const friend = friends.find((f) => f.email === friendEmail);
              handleFriendSelect(friend);
            }}
            onInputChange={handleSearchInputChange}
            endAdornment={selectedFriend && (
              <Tooltip title={t('contacts.delete_friend')} arrow>
                <IconButton 
                  edge="start"
                  aria-label="delete"
                  onClick={() => setSelectedFriend(null)}
                >
                  <DeleteIcon />
                </IconButton>
              </Tooltip>
            )}        
            style={{ width: '100%' }}
          >
            {friends.map((friend) => (
              <MenuItem key={friend.id} value={friend.email}>
                <Box display="flex" alignItems="center">
                  <UserProfileAvatar imageUrl={friend.email} />
                  <Typography sx={{ marginLeft: 1 }}>
                    {friend.firstName} {friend.lastName} ({friend.email})
                  </Typography>
                </Box>
              </MenuItem>
            ))}
          </Select>
          </div>
        ) : (
          <Typography>{t('jobs.no_teachers')}</Typography>
        )}
        </FormControl>
      </DialogContent>
      <DialogActions style={{ paddingRight: '1.7rem', paddingBottom: '1.5rem', paddingLeft: '1.5rem', justifyContent: 'flex-start' }}>
        <UploadImageButton onImageUploaded={handleImageUploaded} />
        <Box flexGrow={1} />
        <Button onClick={onClose} variant="outlined" color="primary">{t('contacts.close')}</Button>
        <Button onClick={handleSubmit(createTeam)} variant="contained" color="primary">{t('home_view.create')}</Button>
      </DialogActions>
    </Dialog>
  );
};

TeamForm.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func,
  setCreated: PropTypes.func.isRequired,
  fetchData: PropTypes.func.isRequired
};

export default TeamForm;