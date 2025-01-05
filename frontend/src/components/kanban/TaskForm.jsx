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
  Radio,
  RadioGroup,
  FormControlLabel,
  Checkbox,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import {
  Delete,
  AddCircleOutline as AddCircleOutlineIcon,
} from "@mui/icons-material";
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

const TaskForm = ({ open, onClose, onSubmit }) => {
  const user = localStorage.getItem("userEmail");
  const { t } = useTranslation();
  const navigate = useNavigate();
  const {
    register,
    formState: { errors },
    handleSubmit,
    reset,
  } = useForm();

  const [fileUploaded, setFileUploaded] = useState(false);

  const [newObjective, setNewObjective] = useState("");

  const [friends, setFriends] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [, setSearchTerm] = useState("");
  const [selectedJob, setSelectedJob] = useState("");
  const [error, setError] = useState("");

  let [taskData, setTaskData] = useState({
    name: "",
    subject: "",
    deadlineDateTime: "",
    attachedResources: null,
    associatedAcademicWork: "",
    objectivesList: [],
    difficultyLevel: "",
    assignedTo: "",
  });

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
      setSelectedFriend(null);
      setFriends([]);

      setTaskData({
        name: "",
        subject: "",
        deadlineDateTime: "",
        attachedResources: null,
        associatedAcademicWork: "",
        objectivesList: [],
        difficultyLevel: "",
      });

      reset({
        name: "",
        subject: "",
        deadlineDateTime: "",
        associatedAcademicWork: "",
        assignedTo: "",
      });

      setNewObjective("");
      setFileUploaded(false);
    }
  }, [open, reset]);

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
    setSelectedFriend(friend);
    setSearchTerm("");
  };

  const handleSearchInputChange = (event) => {
    setError("");
    setSearchTerm(event.target.value);
  };

  const handleObjectiveChange = (index) => {
    const updatedObjectives = taskData.objectivesList.map((objective, i) =>
      index === i
        ? { ...objective, isCompleted: !objective.isCompleted }
        : objective
    );
    setTaskData((prevData) => ({
      ...prevData,
      objectivesList: updatedObjectives,
    }));
  };

  const handleObjectiveDelete = (index) => {
    const updatedObjectives = taskData.objectivesList.filter(
      (objective, i) => index !== i
    );
    setTaskData((prevData) => ({
      ...prevData,
      objectivesList: updatedObjectives,
    }));
  };

  const handleAddObjective = () => {
    if (newObjective.trim() !== "" && newObjective.length <= 255) {
      setTaskData((prevData) => ({
        ...prevData,
        objectivesList: [
          ...prevData.objectivesList,
          { isCompleted: false, description: newObjective },
        ],
      }));
      setNewObjective("");
    }
  };

  const handleDifficultyChange = (e) => {
    setTaskData((prevData) => ({
      ...prevData,
      difficultyLevel: e.target.value,
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setTaskData((prevData) => ({
      ...prevData,
      attachedResources: file,
    }));
    setFileUploaded(file ? file : false);
  };

  const handleFileDelete = () => {
    setTaskData((prevData) => ({
      ...prevData,
      attachedResources: null,
    }));
    setFileUploaded(false);
    document.getElementById("file-input").value = "";
  };

  const createTask = async (data) => {
    if (selectedJob == null) {
      setError(t('tasks.no_job'));
      return;
    }
    
    const percentage = 0;
    const { name, subject, deadlineDateTime } = data;

    taskData = {
      ...taskData,
      name,
      subject,
      deadlineDateTime,
      selectedFriend,
      percentage,
    };

    taskData.associatedAcademicWork = selectedJob;

    onSubmit(taskData);
    onClose();
  };

  const handleJobSelect = async (jobId) => {
    setSelectedJob(jobId);
    setError("");
    await fetchMembers(jobId);
  };

  const deleteFriend = () => {
    setSelectedFriend(null);
  };

  const handleClose = () => {
    setFriends([]);
    setSelectedJob(null)
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <Typography variant="h5" align="center" sx={{ marginTop: "15px" }}>
        {t("tasks.create_task")}
      </Typography>
      <DialogContent>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <TextField
            style={{ width: "48%" }}
            margin="normal"
            label={t("tasks.label_title")}
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
          <TextField
            style={{ width: "48%" }}
            margin="normal"
            label={t("tasks.label_date")}
            name="deadlineDateTime"
            type="datetime-local"
            InputLabelProps={{ shrink: true }}
            required
            variant="outlined"
            {...register("deadlineDateTime", {
              required: t("tasks.error_date1"),
              validate: (value) => {
                const inputDate = new Date(value);
                const currentDate = new Date();
                return inputDate > currentDate || t("tasks.error_date2");
              },
            })}
            error={errors.deadlineDateTime}
            helperText={
              errors.deadlineDateTime ? errors.deadlineDateTime.message : ""
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
          <FormControl style={{ width: "48%", marginTop: "15px" }} required>
            <div>
              <InputLabel id="demo-simple-select-job" required>
                {t("tasks.label_work")}
              </InputLabel>
              <Select
                labelId="demo-simple-select-job"
                id="demo-simple-select-job"
                value={selectedJob}
                required
                label={t("tasks.label_work")}
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
                  {taskData.attachedResources && (
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
        <div
          style={{
            display: "flex",
            alignItems: "center",
            alignContent: "center",
            justifyContent: "space-between",
          }}
        >
          <Typography variant="h6" style={{ width: "30%" }}>
            {t("tasks.level")}
          </Typography>
          <RadioGroup
            row
            aria-label="difficultyLevel"
            name="difficultyLevel"
            value={taskData.difficultyLevel}
            onChange={handleDifficultyChange}
            style={{ alignItems: "center", width: "90%" }}
          >
            <FormControlLabel
              value="EASY"
              control={<Radio color="primary" />}
              label={t("tasks.label_easy")}
            />
            <FormControlLabel
              value="INTERMEDIATE"
              control={<Radio color="primary" />}
              label={t("tasks.label_intermediate")}
            />
            <FormControlLabel
              value="DIFFICULT"
              control={<Radio color="primary" />}
              label={t("tasks.label_difficult")}
            />
          </RadioGroup>
        </div>
        <div style={{ marginLeft: "auto", marginBottom: "0px" }}>
          <Typography variant="h6">{t("tasks.objectives")}</Typography>
          {taskData.objectivesList.map((objective, index) => (
            <div key={index} className="objective-item">
              <Tooltip title={t("tasks.mark_objective")}>
                <Checkbox
                  className="objective-checkbox"
                  checked={objective.isCompleted}
                  onChange={() => handleObjectiveChange(index)}
                  color="primary"
                />
              </Tooltip>
              <Typography className="objective-text">
                {objective.description}
              </Typography>
              <Tooltip title={t("tasks.delete_objective")}>
                <Button
                  className="objective-delete-button"
                  onClick={() => handleObjectiveDelete(index)}
                >
                  <Delete />
                </Button>
              </Tooltip>
            </div>
          ))}
          <TextField
            fullWidth
            margin="normal"
            label={t("tasks.new_objective")}
            value={newObjective}
            onChange={(e) => setNewObjective(e.target.value)}
          />
          <Button
            style={{ marginBottom: "10px" }}
            onClick={handleAddObjective}
            startIcon={<AddCircleOutlineIcon />}
          >
            {t("tasks.add_objective")}
          </Button>
        </div>
        <FormControl fullWidth>
          {friends.length > 0 ? (
            <div>
              <InputLabel id="demo-simple-select-label">
                {t("tasks.assigned_to")}
              </InputLabel>
              <Select
                labelId="demo-simple-select-label"
                id="demo-simple-select"
                value={selectedFriend ? selectedFriend.email : ""}
                label={t("tasks.assigned_to")}
                onChange={(event) => {
                  const friendEmail = event.target.value;
                  const friend = friends.find((f) => f.email === friendEmail);
                  handleFriendSelect(friend);
                }}
                onInputChange={handleSearchInputChange}
                endAdornment={
                  selectedFriend && (
                    <Tooltip title={t("contacts.delete_friend")} arrow>
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
            <Typography>{t("tasks.no_friends_assigned")}</Typography>
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
          onClick={handleSubmit(createTask)}
          variant="contained"
          color="primary"
        >
          {t("home_view.create")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

TaskForm.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
};

export default TaskForm;
