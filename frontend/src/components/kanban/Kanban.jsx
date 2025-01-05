import PlusIcon from "../../icons/PlusIcon";
import { useMemo, useState, useEffect } from "react";
import ColumnContainer from "./ColumnContainer";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { SortableContext } from "@dnd-kit/sortable";
import { createPortal } from "react-dom";
import TaskCard from "./TaskCard";
import TaskForm from "./TaskForm";
import {
  NOTIFICATIONS_API,
  TASKSTATUS_API,
  TASKS_API,
} from "../../routes/api-routes";
import MuiAlert from "@mui/material/Alert";
import Snackbar from "@mui/material/Snackbar";
import {
  deleteFileFromStorage,
  uploadFileToStorage,
} from "../../services/firebase";
import {
  Typography,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  DialogContentText,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import axiosInstance from "../../services/axios";
import { useNavigate } from "react-router-dom";
import { LOGIN_PATH } from "../../routes/app-routes";
import { clearLocalStorage } from "../../App";

function Kanban() {
  const user = localStorage.getItem("userEmail");
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [columns, setColumns] = useState([]);
  const columnsId = useMemo(() => columns.map((col) => col.id), [columns]);

  const [taskCreatedMessage, setTaskCreatedMessage] = useState(false);
  const [taskDeletedMessage, setTaskDeletedMessage] = useState(false);

  const [tasks, setTasks] = useState([]);
  const [formOpen, setFormOpen] = useState(false);
  const [stateId, setStateId] = useState(null);

  const [activeColumn, setActiveColumn] = useState(null);

  const [activeTask, setActiveTask] = useState(null);

  const [state, setState] = useState(null);

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const [taskCreated, setTaskCreated] = useState(null);

  useEffect(() => {
    fetchDefaultColumns();
  }, []);

  useEffect(() => {
    fetchDefaultTasks();
  }, []);

  const fetchDefaultColumns = async () => {
    try {
      const response = await axiosInstance.get(
        TASKSTATUS_API + `/task-status?email=` + user
      );

      const defaultColumns = response.data.map((task) => ({
        id: task.id,
        title: task.status,
        email: task.email,
      }));

      setColumns(defaultColumns);
    } catch (error) {
      if (error.response.status == 401) {
        clearLocalStorage();
        navigate(LOGIN_PATH);
      }
      console.error("Error fetching columns:", error);
    }
  };

  const fetchDefaultTasks = async () => {
    try {
      const response = await axiosInstance.get(TASKS_API + `/${user}`);

      const defaultTasks = response.data.map((task) => ({
        id: task.id,
        columnId: task.taskStatus,
        content: task.name,
        date: task.deadlineDateTime,
        assignedTo: task.assignedTo,
        work: task.associatedAcademicWork,
        percentage: task.percentage,
      }));

      setTasks(defaultTasks);
    } catch (error) {
      if (error.response.status == 401) {
        clearLocalStorage();
        navigate(LOGIN_PATH);
      }
      console.error("Error fetching columns:", error);
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 10,
      },
    })
  );

  const handleCloseForm = () => {
    setFormOpen(false);
  };

  function createTask(columnId) {
    setFormOpen(true);
    setState(columnId);
  }

  const handleSubmitForm = async (taskData) => {
    try {
      taskData.taskStatus = state;
      taskData.assignedTo = taskData.selectedFriend
        ? [user, taskData.selectedFriend.email]
        : [user];

      taskData.objectivesList = Object.values(taskData.objectivesList);

      taskData.objectivesList = taskData.objectivesList.map((objective) => ({
        ...objective,
        isCompleted: objective.isCompleted ? 1 : 0,
      }));

      if (taskData.attachedResources) {
        uploadFileToStorage(
          taskData.attachedResources,
          taskData.associatedAcademicWork
        );
        taskData.attachedResources = taskData.attachedResources.name;
      }

      await axiosInstance.post(TASKS_API, taskData);
    } catch (error) {
      if (error.response.status == 401) {
        clearLocalStorage();
        navigate(LOGIN_PATH);
      }
      console.error("Error creating tasks:", error);
    }

    if (taskData.selectedFriend) {
      await axiosInstance.post(NOTIFICATIONS_API + `/push`, {
        type: "TASK",
        receiver: taskData.selectedFriend.email,
        sender: user,
        read: false,
        hidden: false,
        date: new Date(),
        titleTeam: taskData.associatedAcademicWork
      });
    }

    fetchDefaultTasks();
    setState(null);
    setTaskCreatedMessage(true);
    setTaskCreated(taskData);
  };

  async function deleteTask(id) {
    try {
      const response = await axiosInstance.get(TASKS_API + `/${id}/id`);
      const file = response.data.attachedResources;

      await axiosInstance.delete(TASKS_API + `/${id}/id?user=` + user);

      deleteFileFromStorage(response.data.associatedAcademicWork, file);

      fetchDefaultTasks();
      setTaskDeletedMessage(true);
    } catch (error) {
      if (error.response.status == 401) {
        clearLocalStorage();
        navigate(LOGIN_PATH);
      }
      console.error("Error deleting tasks:", error);
    }
  }

  function updateTask(id, content) {
    const newTasks = tasks.map((task) => {
      if (task.id !== id) return task;
      return { ...task, content };
    });

    setTasks(newTasks);
  }

  async function createNewColumn() {
    try {
      const title = `Column${columns.length + 1}`;
      const id = generateId();
      await axiosInstance.post(TASKSTATUS_API + `/task-status`, {
        status: title,
        email: user,
        id: id,
      });
      
      fetchDefaultColumns();
    } catch (error) {
      if (error.response.status == 401) {
        clearLocalStorage();
        navigate(LOGIN_PATH);
      }
      console.error("Error creating columns:", error);
    }
  }

  const openDeleteDialog = () => {
    setIsDeleteDialogOpen(true);
  };

  const closeDeleteDialog = () => {
    setIsDeleteDialogOpen(false);
    setStateId(null);
    fetchDefaultColumns();
  };

  async function deleteColumn(id) {
    openDeleteDialog();
    setStateId(id);
  }

  async function handleDeleteColumn() {
    try {
      const tasksToDelete = tasks.filter((task) => task.columnId === stateId);

      if (tasksToDelete.length > 0) {
        setTaskDeletedMessage(true);
      }

      await Promise.all(
        tasksToDelete.map(async (task) => {
          const response = await axiosInstance.get(TASKS_API + `/${task.id}/id`);
          const file = response.data.attachedResources;
          deleteFileFromStorage(response.data.associatedAcademicWork, file);
        })
      );

      await axiosInstance.delete(TASKS_API + `/${stateId}`);

      fetchDefaultColumns();
      fetchDefaultTasks();
      closeDeleteDialog();
    } catch (error) {
      if (error.response.status == 401) {
        clearLocalStorage();
        navigate(LOGIN_PATH);
      }
      console.error("Error deleting columns:", error);
    }
  }

  async function updateColumn(id, title) {
    try {
      await axiosInstance.put(TASKS_API + `/${id}/${title}`);
      const newColumns = columns.map((col) => {
        if (col.id !== id) return col;
        return { ...col, title };
      });

      setColumns(newColumns);
      fetchDefaultColumns();
    } catch (error) {
      if (error.response.status == 401) {
        clearLocalStorage();
        navigate(LOGIN_PATH);
      }
      console.error("Error updating columns:", error);
    }
  }

  function onDragStart(event) {
    if (event.active.data.current?.type === "Column") {
      setActiveColumn(event.active.data.current.column);
      return;
    }

    if (event.active.data.current?.type === "Task") {
      setActiveTask(event.active.data.current.task);
      return;
    }
  }

  async function onDragEnd(event) {
    setActiveColumn(null);
    setActiveTask(null);

    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    const isActiveAColumn = active.data.current?.type === "Column";
    if (!isActiveAColumn) return;

    const columnTitles = columns.map((column) => column.id);

    try {
      await axiosInstance.put(TASKSTATUS_API + `/move-state`, {
        stateId1: activeId,
        stateId2: overId,
        stateIds: columnTitles,
      });
    } catch (error) {
      if (error.response.status == 401) {
        clearLocalStorage();
        navigate(LOGIN_PATH);
      }
      console.error("Error move status: " + error);
    }

    fetchDefaultColumns();
  }

  async function onDragOver(event) {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    const isActiveATask = active.data.current?.type === "Task";

    if (!isActiveATask) return;

    const tasksTitles = tasks.map((task) => task.id);

    const isOverAColumn = over.data.current?.type === "Column";

    try {
      if (!(isActiveATask && isOverAColumn)) {
        await axiosInstance.put(TASKS_API + `/move-state`, {
          stateId1: activeId,
          stateId2: overId,
          stateIds: tasksTitles,
        });
      } else {
        await axiosInstance.put(TASKS_API + `/move`, {
          stateId1: activeId,
          stateId2: overId,
          stateIds: [],
        });
      }
    } catch (error) {
      if (error.response.status == 401) {
        clearLocalStorage();
        navigate(LOGIN_PATH);
      }
      console.error("Error move status: " + error);
    }

    fetchDefaultTasks();
  }

  function generateId() {
    return Math.floor(Math.random() * 10001);
  }

  return (
    <div className="text-center" style={{ marginLeft: 'auto', marginRight: 'auto', width: 'fit-content' }}>
    <Typography variant="h4" gutterBottom style={{ marginTop: "20px" }}>
        {t("tasks.kanban")}
      </Typography>
      <div className="w-full flex items-center justify-center">
        <button
          style={{ marginLeft: columns.length > 0 ? '-35px' : '18px'}}
          onClick={() => {
            createNewColumn();
          }}
          className="h-[60px] w-[350px] min-w-[350px] cursor-pointer rounded-lg bg-mainBackgroundColor border-2 border-columnBackgroundColor p-4 hover:border-blue-800 hover:ring-blue-800 flex gap-2"
        >
          <PlusIcon />
          {t("tasks.new_state")}
        </button>
      </div>
      <div className="m-auto flex w-full mt-[15px] items-center overflow-x-auto overflow-y-hidden px-[40px]">
        <DndContext
          sensors={sensors}
          onDragStart={onDragStart}
          onDragEnd={onDragEnd}
          onDragOver={onDragOver}
        >
          <div className="m-auto flex gap-4">
            <div className="flex gap-4" style={{ display: 'flex', flexWrap: 'wrap' }}>
              <SortableContext items={columnsId}>
                {columns.map((col) => (
                  <ColumnContainer
                    key={col.id}
                    column={col}
                    deleteColumn={deleteColumn}
                    updateColumn={updateColumn}
                    createTask={createTask}
                    deleteTask={deleteTask}
                    updateTask={updateTask}
                    fetchDefaultTasks={fetchDefaultTasks}
                    tasks={tasks.filter((task) => task.columnId === col.id)}
                  />
                ))}
              </SortableContext>
            </div>
            
          </div>
          <TaskForm
            open={formOpen}
            onClose={handleCloseForm}
            onSubmit={handleSubmitForm}
          />

          {createPortal(
            <DragOverlay>
              {activeColumn && (
                <ColumnContainer
                  column={activeColumn}
                  deleteColumn={deleteColumn}
                  updateColumn={updateColumn}
                  createTask={createTask}
                  deleteTask={deleteTask}
                  updateTask={updateTask}
                  tasks={tasks.filter(
                    (task) => task.columnId === activeColumn.id
                  )}
                />
              )}
              {activeTask && (
                <TaskCard
                  task={activeTask}
                  deleteTask={deleteTask}
                  updateTask={updateTask}
                />
              )}
            </DragOverlay>,
            document.body
          )}
        </DndContext>
      </div>
      <Snackbar
        open={taskCreatedMessage}
        autoHideDuration={3000}
        onClose={() => {
          setTaskCreatedMessage(false);
          setTaskCreated(null);
        }}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <MuiAlert
          onClose={() => {
            setTaskCreatedMessage(false);
            setTaskCreated(null);
          }}
          severity="success"
          sx={{ width: "100%" }}
        >
          {taskCreated?.assignedTo.length == 1 && t("tasks.succesfull2")}
          {taskCreated?.assignedTo.length > 1 &&
            t("tasks.succesfull_special2", { user: taskCreated.assignedTo[1] })}
        </MuiAlert>
      </Snackbar>
      <Snackbar
        open={taskDeletedMessage}
        autoHideDuration={3000}
        onClose={() => setTaskDeletedMessage(false)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <MuiAlert
          onClose={() => setTaskDeletedMessage(false)}
          severity="success"
          sx={{ width: "100%" }}
        >
          {t("tasks.succesfull3")}
        </MuiAlert>
      </Snackbar>
      <Dialog open={isDeleteDialogOpen} onClose={closeDeleteDialog}>
        <DialogTitle style={{ color: "black", textAlign: "center" }}>
          {t("tasks.delete_state")}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>{t("tasks.delete_all")}</DialogContentText>
        </DialogContent>
        <DialogActions
          style={{
            paddingRight: "1.7rem",
            paddingBottom: "1.5rem",
            justifyContent: "flex-end",
          }}
        >
          <Button
            variant="outlined"
            color="primary"
            onClick={closeDeleteDialog}
          >
            {t("home_view.cancel")}
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleDeleteColumn}
          >
            {t("home_view.confirm")}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default Kanban;
