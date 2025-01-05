import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Dialog,
  Tooltip,
  DialogActions,
  DialogContent,
  TextField,
  Typography,
  Checkbox,
  IconButton,
  FormControl,
  FormControlLabel,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import PropTypes from "prop-types";
import { useForm } from "react-hook-form";
import { getFileDownloadURL } from "../../services/firebase";
import DownloadIcon from '@mui/icons-material/Download';
import axiosInstance from "../../services/axios";
import { USERS_API } from "../../routes/api-routes";

const EventDetails = ({ open, onClose, updateData, deleteData, newEvent }) => {
  const user = localStorage.getItem('userEmail');
  const { t } = useTranslation();
  const {
    register,
    formState: { errors },
    handleSubmit,
    reset,
    getValues,
  } = useForm();

  const [completed, setCompleted] = useState(true);
  const [users, setUsers] = useState([]);
  const [initDate, setInit] = useState(null);
  const [finDate, setFin] = useState(null);

  useEffect(() => {
    if (open) {
      let deadline = new Date(newEvent.end);
      if (newEvent.allDay && newEvent.start == newEvent.end)
        deadline.setDate(deadline.getDate() - 1);
      else if (newEvent.allDay == false) 
        deadline.setDate(deadline.getDate() + 1);

      const init = newEvent.start.toISOString().substring(0, completed ? 10 : 16);
      const fin = newEvent.end == undefined ? newEvent.start.toISOString().substring(0, completed ? 10 : 16) : deadline.toISOString().substring(0, completed ? 10 : 16);
      setInit(init);
      setFin(fin);
    }

  }, [open, newEvent, completed])

  useEffect(() => {
    if (open) {
      setCompleted(newEvent?.allDay);

      const startIndex = newEvent.title.indexOf('(') + 1;
      const endIndex = newEvent.title.indexOf(')'); 
      newEvent.name = newEvent.title.substring(0, startIndex - 1).trim();
      newEvent.associatedAcademicWork = newEvent.title.substring(startIndex, endIndex).trim();
    }

  }, [open, newEvent])

  useEffect(() => {
    const fetchUserInfo = async () => {
      const assignedTo = newEvent?.extendedProps?.assignedTo;
      if (assignedTo != undefined) {
        const userList = [];

        for (const userId of assignedTo) {
          try {
            const userDetails = await fetchUserDetails(userId);
            userList.push(userDetails);
          } catch (error) {
            console.error(`Error fetching user details for user ID ${userId}:`, error);
          }
        }

        setUsers(userList);
      }
      
    };
    
    fetchUserInfo();
  }, [newEvent]);

  useEffect(() => {
    if (open) {
      let deadline = new Date(newEvent.end);
      if (newEvent.allDay && newEvent.start != newEvent.end)
        deadline.setDate(deadline.getDate() - 1);
      const init = newEvent.start.toISOString().substring(0, completed ? 10 : 16);
      const fin = newEvent.end == undefined ? newEvent.start.toISOString().substring(0, completed ? 10 : 16) : deadline.toISOString().substring(0, completed ? 10 : 16);
      setInit(init);
      setFin(fin);

      const startIndex = newEvent.title.indexOf('(') + 1;
      const endIndex = newEvent.title.indexOf(')');
      newEvent.name = newEvent.title.substring(0, startIndex - 1).trim();
      newEvent.associatedAcademicWork = newEvent.title.substring(startIndex, endIndex).trim();

      reset({
        name: newEvent.name,
        subject: newEvent.subject,
        deadlineDateTimeInit: initDate,
        deadlineDateTimeFin: finDate,
        associatedAcademicWork: newEvent.attachedResources,
        location: newEvent.location,
      });
    }
  }, [open, reset, newEvent, initDate, finDate, completed]);

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

  const updateEvent = async (data) => {
    const { name, subject, deadlineDateTimeInit, deadlineDateTimeFin, location } = data;

    const eventData = {
      id: newEvent.id,
      name,
      subject,
      deadlineDateTimeInit,
      deadlineDateTimeFin,
      location,
      allDay: completed,
      assignedTo: newEvent.extendedProps.assignedTo,
      associatedAcademicWork: newEvent.associatedAcademicWork
    }

    updateData(eventData);
    onClose();
  };

  async function handleDownload(file) {
    const fileURL = await getFileDownloadURL(newEvent.associatedAcademicWork, file, true);
    const link = document.createElement('a');
    link.href = fileURL;
    link.target = '_blank';
    link.download = file;
    link.click();
  }

  const handleCompletedChange = (event) => {
    setCompleted(event.target.checked);
  };

  const deleteEvent = () => {
    deleteData(newEvent);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <Typography variant="h5" align="center" sx={{ marginTop: "15px" }}>
        {t('events.title_details')}
      </Typography>
      <DialogContent>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <TextField
            style={{ width: "48%" }}
            margin="normal"
            label={t('events.title_event')}
            name="name"
            variant="outlined"
            defaultValue={newEvent?.name}
            required
            {...register("name", {
              required: t("tasks.error_title"),
              maxLength: { value: 255, message: t("contacts.error_length") },
            })}
            error={errors.name}
            helperText={errors.name ? errors.name.message : ""}
          />
          <div style={{ margin: 'auto' }}>
            <FormControlLabel
              control={<Checkbox defaultValue={newEvent?.allDay} checked={completed} onChange={handleCompletedChange} />}
              label={<Typography>{t('events.allDay')}</Typography>}
            />
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <TextField
            style={{ width: "48%" }}
            margin="normal"
            label={completed ? t("events.init_date") : t("events.init_datee")}
            name="deadlineDateTimeInit"
            type={completed ? "date" : "datetime-local"}
            InputLabelProps={{ shrink: true }}
            defaultValue={initDate}
            required
            variant="outlined"
            {...register("deadlineDateTimeInit", {
              required: completed ?  t("events.required_date") : t("events.required_datee") ,
              validate: (value) => {
                const inputDate = new Date(value);
                const currentDate = new Date();
                return inputDate >= currentDate || t("tasks.error_date2");
              },
            })}
            error={errors.deadlineDateTimeInit}
            helperText={
              errors.deadlineDateTimeInit ? errors.deadlineDateTimeInit.message : ""
            }
          />
          <TextField
            style={{ width: "48%" }}
            margin="normal"
            label={completed ? t("events.fin_date") : t("events.fin_datee")}
            name="deadlineDateTimeFin"
            type={completed ? "date" : "datetime-local"}
            InputLabelProps={{ shrink: true }}
            required
            defaultValue={finDate}
            variant="outlined"
            {...register("deadlineDateTimeFin", {
              required: completed ?  t("events.required_date") : t("events.required_datee") ,
              validate: (value) => {
                const inputDate = new Date(value);
                const endDate = new Date(getValues("deadlineDateTimeInit"));
                return inputDate >= endDate || t('events.error_date');
              },
            })}
            error={errors.deadlineDateTimeFin}
            helperText={
              errors.deadlineDateTimeFin ? errors.deadlineDateTimeFin.message : ""
            }
          />
        </div>
        <TextField
          fullWidth
          margin="normal"
          label={t("tasks.label_subject")}
          name="subject"
          multiline
          variant="outlined"
          defaultValue={newEvent?.extendedProps?.subject}
          rows={4}
          {...register("subject", {
            maxLength: { value: 255, message: t("contacts.error_length") },
          })}
          error={errors.subject}
          helperText={errors.subject ? errors.subject.message : ""}
        />
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <TextField
            style={{ width: '48%' }}
            margin="normal"
            label={t('tasks.label_work')}
            value={newEvent?.associatedAcademicWork}
            InputLabelProps={{ shrink: true }}
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
            value={newEvent?.extendedProps?.resources ? newEvent?.extendedProps?.resources : t('tasks.not_files')}
            name="attachedResources"
            InputLabelProps={{ shrink: true }}
            InputProps={{
              readOnly: true,
              disableUnderline: true,
              alignContent: 'center',
              startAdornment: newEvent?.extendedProps?.resources ? (
                <Box display="flex" alignItems="center">
                  <Tooltip title={t('tasks.download_file')}>
                    <IconButton
                      size="small"
                      onClick={() => handleDownload(newEvent?.extendedProps?.resources)}
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
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <TextField
            style={{ width: "100%" }}
            margin="normal"
            label={t('events.location')}
            name="location"
            defaultValue={newEvent?.extendedProps?.location}
            variant="outlined"
            {...register("location", {
              maxLength: { value: 255, message: t("contacts.error_length") },
            })}
            error={errors.location}
            helperText={errors.location ? errors.location.message : ""}
          />
          
        </div>
        <FormControl fullWidth margin="normal">
          <Typography variant="h6" style={{ marginBottom: '10px' }}>{t('events.people')}</Typography>
          <ol>
            {users?.length > 0 && users.map((userInfo, index) => (
              <li key={index}>
                {renderUserDetails(userInfo)}
              </li>
            ))}
          </ol>
        </FormControl>
      </DialogContent>
      <DialogActions
        style={{
          paddingRight: "1.7rem",
          paddingBottom: "1.5rem",
          justifyContent: "flex-end",
        }}
      >
        <Button onClick={deleteEvent} variant="contained" color="error">
          {newEvent?.extendedProps?.assignedTo[0]==user ? t("home_view.delete_title") : t("home_view.leave_title")}
        </Button>
        <Button onClick={onClose} variant="outlined" color="primary">
          {t("home_view.cancel")}
        </Button>
        <Button
          onClick={handleSubmit(updateEvent)}
          variant="contained"
          color="primary"
        >
          {t("home_view.update")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

EventDetails.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  updateData: PropTypes.func.isRequired,
  deleteData: PropTypes.func.isRequired,
  newEvent: PropTypes.object
};

export default EventDetails;
                  