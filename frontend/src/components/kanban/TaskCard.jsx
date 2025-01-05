import { useState } from "react";
import TrashIcon from "../../icons/TrashIcon";
import { useSortable } from "@dnd-kit/sortable";
import PropTypes from 'prop-types';
import { Tooltip, Snackbar } from '@mui/material';
import DetailsIcon from "../../icons/DetailsIcon";
import TaskDetails from "./TaskDetails";
import { TASKS_API } from "../../routes/api-routes";
import MuiAlert from '@mui/material/Alert';
import { useTranslation } from 'react-i18next';
import Slider from '@mui/material/Slider';
import UserProfileAvatar from "../home/UserProfileAvatar";
import axiosInstance from "../../services/axios";
import { LOGIN_PATH } from "../../routes/app-routes";
import { useNavigate } from "react-router-dom";
import { clearLocalStorage } from "../../App";

function SliderValueLabel({ value }) {
  return (
    <span>
      {value}
    </span>
  );
}

function TaskCard({ task, deleteTask, updateTask, fetchDefaultTasks }) {
  const user = localStorage.getItem('userEmail');
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [mouseIsOver, setMouseIsOver] = useState(false);
  const [editMode, setEditMode] = useState(false);

  const [showDetails, setShowDetails] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [percentage, setPercentage] = useState(task.percentage);
  const [formOpen, setFormOpen] = useState(false);

  function formatDate(dateTimeString) {
    const dateTime = new Date(dateTimeString);
    const day = String(dateTime.getDate()).padStart(2, "0");
    const month = String(dateTime.getMonth() + 1).padStart(2, "0");
    const year = dateTime.getFullYear();
    const hours = String(dateTime.getHours()).padStart(2, "0");
    const minutes = String(dateTime.getMinutes()).padStart(2, "0");

    return `${day}/${month}/${year} ${hours}:${minutes}`;
  }

  async function getTaskById(id) {
    try {
      const response = await axiosInstance.get(TASKS_API + `/${id}/id`);
      return response.data;
    } catch (error) {
      if (error.response.status == 401) {
        clearLocalStorage();
        navigate(LOGIN_PATH);
      }
      console.error('Error getting task by id:', error);
    }
  }
  
  async function updatePercentage(newValue) {
    try {
      let updateTask = await getTaskById(task.id);
      updateTask.percentage = newValue;
      const response = await axiosInstance.put(TASKS_API + `/${task.id}?user=` + user, updateTask);
      return response.data;
    } catch (error) {
      if (error.response.status == 401) {
        clearLocalStorage();
        navigate(LOGIN_PATH);
      }
      console.error('Error updating percentage:', error);
    }
  }

  const {
    setNodeRef,
    attributes,
    listeners,
  } = useSortable({
    id: task.id,
    data: {
      type: "Task",
      task,
    },
  });

  const toggleEditMode = () => {
    setEditMode((prev) => !prev);
    setMouseIsOver(false);
  };

  const handleShowDetails = () => {
    setFormOpen(true);
    setShowDetails(true);
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const handleSubmitForm = async (taskData) => {
    try {
      taskData.objectivesList = Object.values(taskData.objectivesList);

      taskData.objectivesList = taskData.objectivesList.map(objective => ({
        ...objective,
        isCompleted: objective.isCompleted ? 1 : 0
      }));
      
      await axiosInstance.put(TASKS_API + `/${taskData.id}?user=`+user, taskData);
      setSnackbarOpen(true);
      fetchDefaultTasks();
    } catch (error) {
      if (error.response.status == 401) {
        clearLocalStorage();
        navigate(LOGIN_PATH);
      }
      console.error("Error updating tasks:", error);
    }
  };

  const handleSliderChange = async (event, newValue) => {
    setPercentage(newValue);
    try {
      await updatePercentage(newValue);
    } catch (error) {
      console.error("Error updating percentage:", error);
    }
  };

  const truncateText = (text, maxLength) => {
    if (text.length > maxLength) {
      return text.slice(0, maxLength - 3) + '...';
    } else {
      return text;
    }
  };

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className="bg-mainBackgroundColor p-2.5 min-h-[150px] items-center flex text-left rounded-xl hover:ring-2 hover:ring-inset relative task"
      onMouseEnter={() => {
        setMouseIsOver(true);
      }}
      onMouseLeave={() => {
        setMouseIsOver(false);
      }}
    >
      {editMode ? (
        <textarea
          className="h-0 w-full resize-none border-none rounded bg-transparent text-black focus:outline-none"
          autoFocus
          onBlur={toggleEditMode}
          onKeyDown={(e) => {
            if (e.key === "Enter" && e.shiftKey) {
              toggleEditMode();
            }
          }}
          onChange={(e) => updateTask(task.id, e.target.value)}
          placeholder="Task content here"
        />
      ) : null}
      <div className="my-auto w-full overflow-y-auto overflow-x-hidden whitespace-pre-wrap">
        <Tooltip title={t("tasks.select_task")}>
          <p style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}><strong>{t("tasks.title")}</strong> {truncateText(task.content, 28)}</p>
          <p style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}><strong>{t("tasks.work")}</strong> {truncateText(task.work, 28)}</p>
          <p>
            <strong>{t("tasks.date")}</strong>{" "}
            {formatDate(task.date)}
          </p>
        </Tooltip>
        <Tooltip title={t('tasks.percentage')}>
          <div style={{ textAlign: 'center' }}>
            <Slider
              aria-label="Percentage"
              value={percentage}
              onChange={handleSliderChange}
              step={10}
              marks
              min={0}
              max={100}
              valueLabelDisplay="auto"
              style={{ width: '55%', marginLeft: '10px' }}
            />
            <p style={{ color: percentage === 0 ? 'red' : (percentage === 100 ? 'green' : 'blue') }}>
              {percentage} / 100 %
            </p>
          </div>
        </Tooltip>
      </div>
      <div className="absolute bottom-0 right-0 m-2">
        {mouseIsOver && (
          <>
            <Tooltip title={t("tasks.delete_task")}>
              <button
                onClick={() => {
                  deleteTask(task.id);
                }}
                className="stroke-gray-500 hover:stroke-white hover:bg-columnBackgroundColor rounded px-1 py-2"
              >
                <TrashIcon />
              </button>
            </Tooltip>
            <Tooltip title={t("tasks.details_task")}>
              <button
                onClick={() => {
                  handleShowDetails();
                }}
                className="stroke-gray-500 hover:stroke-white hover:bg-columnBackgroundColor rounded px-1 py-2 ml-2"
              >
                <DetailsIcon />
              </button>
            </Tooltip>
          </>
        )}
      </div>
      <div className="absolute top-0 right-0 m-2">
        <UserProfileAvatar imageUrl={task.work} />
      </div>
      {showDetails && (
        <TaskDetails open={formOpen} taskId={task.id} onClose={() => setShowDetails(false)} onSubmit={handleSubmitForm} />
      )}
      <Snackbar 
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <MuiAlert onClose={handleSnackbarClose} severity="success" sx={{ width: '100%' }}>
          {t("tasks.succesfull")}
        </MuiAlert>
      </Snackbar>
    </div>
  );
}

TaskCard.propTypes = {
  task: PropTypes.shape({
    id: PropTypes.string.isRequired,
    content: PropTypes.string.isRequired,
    academicWork: PropTypes.string.isRequired,
    assignedTo: PropTypes.string.isRequired,
    work: PropTypes.string.isRequired,
    date: PropTypes.string.isRequired,
    avatar: PropTypes.string.isRequired,
    percentage: PropTypes.number.isRequired
  }).isRequired,
  deleteTask: PropTypes.func.isRequired,
  updateTask: PropTypes.func.isRequired,
  fetchDefaultTasks: PropTypes.func.isRequired
};

SliderValueLabel.propTypes = {
  value: PropTypes.number.isRequired
};

export default TaskCard;
