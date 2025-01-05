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
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import PropTypes from "prop-types";
import { useForm } from "react-hook-form";
import { JOBS_API } from "../../routes/api-routes";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import DeleteIcon from "@mui/icons-material/Delete";
import UserProfileAvatar from "../home/UserProfileAvatar";
import axiosInstance from "../../services/axios";
import { LOGIN_PATH } from "../../routes/app-routes";
import { useNavigate } from "react-router-dom";
import { clearLocalStorage } from "../../App";

const EventForm = ({ open, onClose, onSubmit, newEvent }) => {
  const user = localStorage.getItem("userEmail");
  const { t } = useTranslation();
  const navigate = useNavigate();
  const {
    register,
    formState: { errors },
    handleSubmit,
    reset,
    getValues
  } = useForm();

  const [fileUploaded, setFileUploaded] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const [friends, setFriends] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [, setSearchTerm] = useState("");
  const [selectedJob, setSelectedJob] = useState("");
  const [error, setError] = useState("");
  const [completed, setCompleted] = useState(true);
  const [selectedFriends, setSelectedFriends] = useState([]);
  const [initDate, setInit] = useState(null);
  const [finDate, setFin] = useState(null);

  let [eventData, setEventData] = useState({
    name: "",
    subject: "",
    attachedResources: null,
    associatedAcademicWork: "",
    location: "",
    assignedTo: [],
  });

  useEffect(() => {
    if (open) {
      const init = newEvent.start.toISOString().substring(0, completed ? 10 : 16);
      const fin = newEvent.end == undefined ? newEvent.start.toISOString().substring(0, completed ? 10 : 16) : newEvent.end.toISOString().substring(0, completed ? 10 : 16);
      setInit(init);
      setFin(fin);
    }

  }, [open, newEvent, completed])

  useEffect(() => {
    if (open) {
      setCompleted(newEvent?.allDay)
    }

  }, [open, newEvent])

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await axiosInstance.get(`${JOBS_API}/${user}/job-relations`);
        setJobs(response.data);
      } catch (error) {
        if (error.response.status == 401) {
          clearLocalStorage();
          navigate(LOGIN_PATH);
        }
        console.error("Error fetching jobs:", error);
      }
    };

    fetchJobs();
  }, [user, navigate]);

  useEffect(() => {
    if (open) {
      setError("");
      setSelectedJob(null);
      setSelectedFriends([]);
      setFriends([]);

      const init = newEvent.start.toISOString().substring(0, completed ? 10 : 16);
      const fin = newEvent.end == undefined ? newEvent.start.toISOString().substring(0, completed ? 10 : 16) : newEvent.end.toISOString().substring(0, completed ? 10 : 16);
      setInit(init);
      setFin(fin);

      setEventData({
        name: "",
        subject: "",
        deadlineDateTimeInit: initDate,
        deadlineDateTimeFin: finDate,
        attachedResources: null,
        associatedAcademicWork: "",
        location: "",
        assignedTo: []
      });

      reset({
        name: "",
        subject: "",
        deadlineDateTimeInit: initDate,
        deadlineDateTimeFin: finDate,
        associatedAcademicWork: "",
        location: "",
      });

      setFileUploaded(false);
    }
  }, [open, reset, newEvent, initDate, finDate, completed]);

  const fetchMembers = async (selectedJob) => {
    try {
      const response = await axiosInstance.get(JOBS_API + `/members?jobTitle=${selectedJob}&user=${user}`);
      const filteredData = response.data.filter(item => item.email !== user);

      setFriends(filteredData);
    } catch (error) {
      if (error.response.status == 401) {
        clearLocalStorage();
        navigate(LOGIN_PATH);
      }
      console.error("Error getting members: " + error);
    }
  };

  const handleFriendSelect = (friend) => {
    const isSelected = selectedFriends.some((selectedFriend) => selectedFriend.email === friend.email);
    if (!isSelected) {
      setSelectedFriends([...selectedFriends, friend]);
      setMenuOpen(true);
    } else {
      setSelectedFriends(selectedFriends.filter((selectedFriend) => selectedFriend.email !== friend.email));
      setMenuOpen(true);
    }
  };
  
  const handleSearchInputChange = (event) => {
    setError("");
    setSearchTerm(event.target.value);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setEventData((prevData) => ({
      ...prevData,
      attachedResources: file,
    }));
    setFileUploaded(file ? file : false);
  };

  const handleFileDelete = () => {
    setEventData((prevData) => ({
      ...prevData,
      attachedResources: null,
    }));
    setFileUploaded(false);
    document.getElementById("file-input").value = "";
  };

  const createEvent = async (data) => {
    if (selectedJob == null) {
      setError(t('tasks.no_job'));
      return;
    }
    
    const { name, subject, deadlineDateTimeInit, deadlineDateTimeFin, location } = data;

    eventData = {
      ...eventData,
      name,
      subject,
      deadlineDateTimeInit,
      deadlineDateTimeFin,
      location,
      allDay: completed,
      assignedTo: selectedFriends
    };

    eventData.associatedAcademicWork = selectedJob;

    onSubmit(eventData);
    onClose();
  };

  const handleJobSelect = async (jobId) => {
    setSelectedJob(jobId);
    setError("");
    await fetchMembers(jobId);
  };

  const deleteFriend = () => {
    setSelectedFriends([]);
  };

  const handleClose = () => {
    setFriends([]);
    setSelectedJob(null);
  };

  const handleCompletedChange = (event) => {
    setCompleted(event.target.checked);
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <Typography variant="h5" align="center" sx={{ marginTop: "15px" }}>
        {t('events.create_event')}
      </Typography>
      <DialogContent>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <TextField
            style={{ width: "48%" }}
            margin="normal"
            label={t('events.title_event')}
            name="name"
            variant="outlined"
            autoFocus={true}
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
            required
            defaultValue={initDate}
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
          rows={4}
          {...register("subject", {
            maxLength: { value: 255, message: t("contacts.error_length") },
          })}
          error={errors.subject}
          helperText={errors.subject ? errors.subject.message : ""}
        />
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <FormControl style={{ width: "48%", marginTop: "15px" }}>
            <div>
              <InputLabel id="demo-simple-select-job" required>
                {t("tasks.label_work")}
              </InputLabel>
              <Select
                labelId="demo-simple-select-job"
                id="demo-simple-select-job"
                value={selectedJob}
                label={t("tasks.label_work")}
                required
                onChange={(event) => {
                  const jobId = event.target.value;
                  handleJobSelect(jobId);
                }}
                onInputChange={handleSearchInputChange}
                endAdornment={
                  selectedJob && (
                    <Tooltip title={t("contacts.delete_friend")} arrow>
                      <IconButton
                        edge="start"
                        aria-label="delete"
                        onClick={handleClose}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  )
                }
                style={{ width: "100%" }}
                error={!!error}
              >
                {jobs.map((job) => (
                  <MenuItem key={job.id} value={job.name}>
                    <Box display="flex" alignItems="center">
                      <UserProfileAvatar imageUrl={job.name} isTask={true}/>
                      <Typography sx={{ marginLeft: 1 }}>{job.name}</Typography>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
              {error !== "" && (
                <Typography variant="caption" color="error" sx={{ mt: 1 }}>
                  {error}
                </Typography>
              )}
            </div>
          </FormControl>
          <TextField
            style={{ width: "48%" }}
            margin="normal"
            label={t("tasks.label_resources")}
            name="attachedResources"
            placeholder={!fileUploaded ? t("tasks.upload_file") : ""}
            value={fileUploaded ? fileUploaded.name : ""}
            InputLabelProps={{ shrink: true }}
            InputProps={{
              readOnly: true,
              startAdornment: (
                <Tooltip title={t("tasks.up_file")} arrow>
                  <IconButton
                    component="label"
                    htmlFor="file-input"
                    aria-label={t("tasks.file")}
                  >
                    <AttachFileIcon />
                    <input
                      type="file"
                      id="file-input"
                      style={{ display: "none" }}
                      onChange={handleFileChange}
                    />
                  </IconButton>
                </Tooltip>
              ),
              endAdornment: (
                <Box display="flex">
                  {eventData.attachedResources && (
                    <Tooltip title={t("tasks.delete_file")} arrow>
                      <IconButton onClick={handleFileDelete} size="small">
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )}
                </Box>
              ),
              className: fileUploaded ? "file-uploaded" : "",
              style: { cursor: "pointer" },
            }}
          />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <TextField
            style={{ width: "100%" }}
            margin="normal"
            label={t('events.location')}
            name="location"
            variant="outlined"
            {...register("location", {
              maxLength: { value: 255, message: t("contacts.error_length") },
            })}
            error={errors.location}
            helperText={errors.location ? errors.location.message : ""}
          />
          
        </div>
        <FormControl fullWidth style={{ marginTop: '20px' }}>
          {friends.length > 0 ? (
            <div>
              <InputLabel id="demo-simple-select-label" value={null}>
                {t('events.collaborators')}
              </InputLabel>
              <Select
                open={menuOpen}
                onClose={() => setMenuOpen(false)}
                onOpen={() => setMenuOpen(true)}
                labelId="demo-simple-select-label"
                id="demo-simple-select"
                value={null}
                label={t('events.collaborators')}
                onChange={(event) => {
                  const friendEmail = event.target.value;
                  const friend = friends.find((f) => f.email === friendEmail);
                  handleFriendSelect(friend);
                }}
                onInputChange={handleSearchInputChange}
                endAdornment={
                  selectedFriends?.length > 0 && (
                    <Tooltip title={t("contacts.delete_friend") + "(s)"} arrow>
                      <IconButton
                      edge="start"
                      aria-label="delete"
                      onClick={deleteFriend}
                      >
                      <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  )
                }
                style={{ width: "100%" }}
                >
                {friends.map((friend) => (
                  <MenuItem key={friend.id} value={friend.email}>
                    <Box display="flex" alignItems="center">
                      <Tooltip title={t('events.mark')}>
                        <Checkbox
                          checked={selectedFriends.some((selectedFriend) => selectedFriend.id === friend.id)}
                          onChange={() => handleFriendSelect(friend)}
                        />
                      </Tooltip>
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
            <Typography style={{ marginTop: '-10px' }}>{t('events.no_people')}</Typography>
          )}
        </FormControl>
      </DialogContent>
      <DialogActions
        style={{
          paddingRight: "1.7rem",
          paddingBottom: "1.5rem",
          justifyContent: "flex-end",
        }}
      >
        <Button onClick={onClose} variant="outlined" color="primary">
          {t("home_view.cancel")}
        </Button>
        <Button
          onClick={handleSubmit(createEvent)}
          variant="contained"
          color="primary"
        >
          {t("home_view.create")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

EventForm.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  newEvent: PropTypes.object
};

export default EventForm;
                  