import { useState, useEffect } from 'react';
import { FormControl, Tooltip, Button, Dialog, DialogActions, DialogContent, TextField, Typography, Radio, RadioGroup, FormControlLabel, Checkbox, Box, IconButton } from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import { Delete, AddCircleOutline as AddCircleOutlineIcon } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import { TASKS_API, USERS_API } from '../../routes/api-routes';
import { getFileDownloadURL } from '../../services/firebase';
import { useForm } from 'react-hook-form';
import axiosInstance from '../../services/axios';
import { LOGIN_PATH } from '../../routes/app-routes';
import { useNavigate } from 'react-router-dom';
import { clearLocalStorage } from '../../App';

const TaskDetails = ({ open, taskId, onClose, onSubmit }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm();

  const [newObjective, setNewObjective] = useState('');
  let [taskData, setTaskData] = useState(null);

  const [user1Info, setUser1Info] = useState({});
  const [user2Info, setUser2Info] = useState({});

  useEffect(() => {
    const fetchTaskData = async () => {
      try {
        const response = await axiosInstance.get(TASKS_API + `/${taskId}/id`);
        const task = response.data;

        if (open) {
          setTaskData({
            id: task.id,
            columnId: task.taskStatus,
            name: task.name,
            subject: task.subject,
            deadlineDateTime: task.deadlineDateTime,
            associatedAcademicWork: task.associatedAcademicWork,
            objectivesList: task.objectivesList,
            attachedResources: task.attachedResources,
            difficultyLevel: task.difficultyLevel,
            assignedTo: task.assignedTo
          });
        }
      } catch (error) {
        if (error.response.status == 401) {
          clearLocalStorage();
          navigate(LOGIN_PATH);
        }
        console.error('Error fetching task data:', error);
      }
    };

    fetchTaskData();
  }, [open, taskId, navigate]);

  useEffect(() => {
    const fetchUserInfo = async () => {
      const user1 = await fetchUserDetails(taskData.assignedTo[0]);
      const user2 = taskData.assignedTo.length > 1 ? await fetchUserDetails(taskData.assignedTo[1]) : null;
      
      setUser1Info(user1);
      setUser2Info(user2);
    };

    fetchUserInfo();
  }, [taskData]);

  const fetchUserDetails = async (email) => {
    const response = await axiosInstance.get(USERS_API + `/${email}`);
    return response.data;
  };

  const renderUserDetails = (userInfo) => {
    return (
      <p>
        ○ {userInfo.firstName} {userInfo.lastName} ({userInfo.email})
      </p>
    );
  };
  
  const handleObjectiveChange = (index) => {
    const updatedObjectives = taskData.objectivesList.map((objective, i) =>
      index === i ? { ...objective, isCompleted: !objective.isCompleted } : objective
    );
    setTaskData(prevData => ({
      ...prevData,
      objectivesList: updatedObjectives,
    }));
  };

  const handleObjectiveDelete = (index) => {
    const updatedObjectives = taskData.objectivesList.filter((objective, i) => index !== i);
    setTaskData(prevData => ({
      ...prevData,
      objectivesList: updatedObjectives,
    }));
  };

  const handleAddObjective = () => {
    if (newObjective.trim() !== '') {
      setTaskData(prevData => ({
        ...prevData,
        objectivesList: [
          ...prevData.objectivesList,
          { isCompleted: false, description: newObjective }
        ],
      }));
      setNewObjective('');
    }
  };

  const handleDifficultyChange = (e) => {
    setTaskData(prevData => ({
      ...prevData,
      difficultyLevel: e.target.value,
    }));
  };

  async function handleDownload(file) {
    const fileURL = await getFileDownloadURL(taskData.associatedAcademicWork, file);
    const link = document.createElement('a');
    link.href = fileURL;
    link.target = '_blank';
    link.download = file;
    link.click();
  }

  const updateTask = (data) => {
    const { name, subject, deadlineDateTime, associatedAcademicWork } = data;
    taskData = { ...taskData, name, subject, deadlineDateTime, associatedAcademicWork }
    onSubmit(taskData);
    onClose();
  };

  return (
    taskData && (
      <Dialog open={open} onClose={onClose}>
        <Typography variant="h5" align="center" sx={{ marginTop: '15px' }}>Detalle de tarea</Typography>
        <DialogContent>
          <form>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <TextField
                style={{ width: '48%' }}
                margin="normal"
                label={t('tasks.label_title')}
                name="name"
                defaultValue={taskData.name}
                variant='outlined'
                required
                {...register('name', { required: t('tasks.error_title'), maxLength: {value: 255, message: t('contacts.error_length') }} )}
                error={errors.name}
                helperText={errors.name ? errors.name.message : ""}
              />
              <TextField
                style={{ width: '48%' }}
                margin="normal"
                label={t('tasks.label_date')}
                name="deadlineDateTime"
                type="datetime-local"
                defaultValue={taskData.deadlineDateTime}
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
              name="subject"
              multiline
              rows={4}
              defaultValue={taskData.subject}
              {...register('subject', {maxLength: {value: 255, message: t('contacts.error_length')}} )}
              error={errors.subject}
              helperText={errors.subject ? errors.subject.message : ""}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <TextField
                style={{ width: '48%' }}
                margin="normal"
                label={t('tasks.label_work')}
                defaultValue={taskData.associatedAcademicWork}
                variant='outlined'
                contentEditable={false}
                InputProps={{
                  readOnly: true
                }}
              />
              <TextField
                style={{ width: '48%' }}
                margin="normal"
                label={t('tasks.label_resources')}
                contentEditable={false}
                value={taskData.attachedResources ? taskData.attachedResources : t('tasks.not_files')}
                name="attachedResources"
                InputLabelProps={{ shrink: true }}
                InputProps={{
                  readOnly: true,
                  disableUnderline: true,
                  alignContent: 'center',
                  startAdornment: taskData.attachedResources ? (
                    <Box display="flex" alignItems="center">
                      <Tooltip title={t('tasks.download_file')}>
                        <IconButton
                          size="small"
                          onClick={() => handleDownload(taskData.attachedResources)}
                        >
                          <DownloadIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  ) : (
                    ""
                  ),
                }}
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', alignContent: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h6" style={{ width: "30%" }}>
              {t("tasks.level")}
            </Typography>
              <RadioGroup
                row
                aria-label="difficultyLevel"
                name="difficultyLevel"
                value={taskData.difficultyLevel}
                onChange={handleDifficultyChange}
                style={{ alignItems: 'center', width: '90%' }}
              >
                <FormControlLabel value="EASY" control={<Radio color="primary" />} label={t('tasks.label_easy')} />
                <FormControlLabel value="INTERMEDIATE" control={<Radio color="primary" />} label={t('tasks.label_intermediate')} />
                <FormControlLabel value="DIFFICULT" control={<Radio color="primary" />} label={t('tasks.label_difficult')} />
              </RadioGroup>
            </div>

            <div style={{ marginLeft: 'auto', marginBottom: '0px' }}>
              <Typography variant="h6">{t('tasks.objectives')}</Typography>
              {taskData.objectivesList.map((objective, index) => (
                <div key={index} className="objective-item">
                  <Tooltip title={t('tasks.mark_objective')}>
                    <Checkbox
                      className="objective-checkbox"
                      checked={objective.isCompleted}
                      onChange={() => handleObjectiveChange(index)}
                      color="primary"
                    />
                  </Tooltip>
                  <Typography className="objective-text">{objective.description}</Typography>
                  <Tooltip title={t('tasks.delete_objective')}>
                    <Button className="objective-delete-button" onClick={() => handleObjectiveDelete(index)}>
                      <Delete />
                    </Button>
                  </Tooltip>
                </div>
              ))}
              <TextField
                fullWidth
                margin="normal"
                label={t('tasks.new_objective')}
                value={newObjective}
                onChange={(e) => setNewObjective(e.target.value)}
              />
              <Button onClick={handleAddObjective} startIcon={<AddCircleOutlineIcon />}>{t('tasks.add_objective')}</Button>
            </div>
            <FormControl fullWidth margin="normal">
              <Typography variant="h6" style={{ marginBottom: '10px' }}>{t('tasks.friends_tasks')}</Typography>
              <ol>
                <li>
                  {user1Info && renderUserDetails(user1Info)}
                </li>
                <li>
                  {user2Info && renderUserDetails(user2Info)}
                </li>
              </ol>
            </FormControl>
            <DialogActions style={{ paddingRight: '0rem', paddingTop: '1.5rem', paddingBottom: '1rem', justifyContent: 'flex-end' }}>
              <Button onClick={onClose} variant="outlined" color="primary">{t('home_view.cancel')}</Button>
              <Button onClick={handleSubmit(updateTask)} variant="contained" color="primary">{t('home_view.update')}</Button>
            </DialogActions>
          </form>
        </DialogContent>
      </Dialog>
    )
  );
};

TaskDetails.propTypes = {
  open: PropTypes.bool.isRequired,
  taskId: PropTypes.number.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
};

export default TaskDetails;
