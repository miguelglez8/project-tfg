import { useState, useEffect } from 'react';
import { Box, Typography, IconButton, Tooltip, LinearProgress } from '@mui/material';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../services/axios';
import { EVENTS_API, TASKS_API } from '../../routes/api-routes';
import { LOGIN_PATH } from '../../routes/app-routes';
import { DataGrid } from '@mui/x-data-grid';
import { format } from 'date-fns';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import { getFileDownloadURL } from '../../services/firebase';
import { useTranslation } from 'react-i18next';
import { clearLocalStorage } from '../../App';

const StudentJob = ({ job }) => {
  const user = localStorage.getItem('userEmail');
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [tasks, setTasks] = useState([]);
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const fetchDataTasks = async () => {
      try {
        const response = await axiosInstance.get(TASKS_API + `/${job}/job`, {
          params: {
            user: user
          }
        });

        setTasks(response.data.map(task => ({
          ...task,
          deadlineDateTime: format(new Date(task.deadlineDateTime), "dd/MM/yyyy HH:mm"),
          objectivesListText: task.objectivesList.length > 0 ? task.objectivesList.map(objective => `${objective.description}${objective.isCompleted ? t('jobs.objective_completed') : t('jobs.objective_not_completed')}`).join(', ') : t('jobs.not_included'),
          subject: task.subject || t('jobs.not_included'),
          difficultyLevel: parseDifficultyLevel(task.difficultyLevel)
        })));
      } catch (error) {
        if (error.response.status === 401) {
          clearLocalStorage();
          navigate(LOGIN_PATH);
        }
        console.error('Error fetching tasks data:', error);
      }
    };

    const fetchDataEvents = async () => {
      try {
        const response = await axiosInstance.get(EVENTS_API + `/${job}/job`, {
          params: {
            user: user
          }
        });

        setEvents(response.data.map(event => ({
          ...event,
          deadlineDateTimeInit: format(new Date(event.deadlineDateTimeInit), event.allDay ? "dd/MM/yyyy" : "dd/MM/yyyy HH:mm"),
          deadlineDateTimeFin: format(new Date(event.deadlineDateTimeFin), event.allDay ? "dd/MM/yyyy" : "dd/MM/yyyy HH:mm"),
          duration: event.allDay ? t('jobs.allday') : calculateDuration(event.deadlineDateTimeInit, event.deadlineDateTimeFin),
          subject: event.subject || t('jobs.not_included'),
          location: event.location ||t('jobs.not_included')
        })));
      } catch (error) {
        if (error.response.status === 401) {
          clearLocalStorage();
          navigate(LOGIN_PATH);
        }
        console.error('Error fetching events ata:', error);
      }
    };

    fetchDataTasks();
    fetchDataEvents();
  }, [job, user, navigate, t]);

  const calculateDuration = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const hoursDifference = Math.abs(end - start) / 36e5;
    return `${hoursDifference} ` + t('jobs.hours');
  };

  function parseDifficultyLevel(difficulty) {
    switch (difficulty) {
      case 'EASY':
        return t('tasks.label_easy');
      case 'INTERMEDIATE':
        return t('tasks.label_intermediate'); 
      case 'DIFFICULT':
        return t('tasks.label_difficult'); 
      case 'NONE':
        return t('jobs.none');
    }
}

  const handleDownloadFile = async (attachedResource, value) => {
    const downloadUrl = await getFileDownloadURL(job, attachedResource, value);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.target = '_blank';
    link.download = attachedResource;
    link.click();
  };

  const columnsTasks = [
    { field: 'name', headerName: t('jobs.label_title'), width: 80 },
    { field: 'subject', headerName: t('tasks.label_subject'), width: 130 },
    { field: 'deadlineDateTime', headerName: t('tasks.label_date'), width: 140 },
    { field: 'assignedTo', headerName: t('jobs.assigned_to'), width: 150 },
    { field: 'difficultyLevel', headerName: t('jobs.level'), width: 130 },
    { field: 'objectivesListText', headerName: t('jobs.objectives'), width: 160 },
    { 
      field: 'percentage', 
      headerName: t('jobs.percentage'), 
      width: 120,
      renderCell: (params) => (
        <div>
          <LinearProgress variant="determinate" value={params.value} />
          <Typography variant="body2" color="textSecondary" align="center" sx={{ mt: 1 }}>
            {params.value}%
          </Typography>
        </div>
      )
    },
    { 
      field: 'attachedResources', 
      headerName: t('tasks.label_resources'), 
      width: 170,
      renderCell: (params) => (
        <Tooltip title={t('tasks.download_file')}>
          <Box display="flex" justifyContent="center" alignItems="center">
            <IconButton 
              aria-label="download" 
              onClick={() => handleDownloadFile(params.row.attachedResources, false)}
              disabled={!params.value}
            >
              <CloudDownloadIcon />
            </IconButton>
          </Box>
        </Tooltip>
      )
    },
  ];

  const columnsEvents = [
    { field: 'name', headerName: t('jobs.label_title'), width: 80 },
    { field: 'subject', headerName: t('tasks.label_subject'), width: 130 },
    { field: 'deadlineDateTimeInit', headerName: t('events.init_datee'), width: 160 },
    { field: 'deadlineDateTimeFin', headerName: t('events.fin_datee'), width: 140 },
    { field: 'duration', headerName: t('jobs.duration'), width: 100 },
    { field: 'assignedTo', headerName: t('jobs.assigned_to'), width: 200 },
    { field: 'location', headerName: t('events.location'), width: 125 },
    { 
      field: 'attachedResources', 
      headerName: t('tasks.label_resources'), 
      width: 170,
      renderCell: (params) => (
        <Tooltip title={t('tasks.download_file')}>
          <Box display="flex" justifyContent="center" alignItems="center">
            <IconButton 
              aria-label="download" 
              onClick={() => handleDownloadFile(params.row.attachedResources, true)}
              disabled={!params.value}
            >
              <CloudDownloadIcon />
            </IconButton>
          </Box>
        </Tooltip>
      )
    },
  ];

  return (
    <Box sx={{ width: '75vw' }}>
      <Typography variant="h5" gutterBottom textAlign='center'>
        {t('home_view.tasks')}:
      </Typography>
      <DataGrid
        rows={tasks}
        columns={columnsTasks}
        pageSize={5}
        pageSizeOptions={[5, 10, 20]}
        autoHeight
        disableRowSelectionOnClick
        localeText={{
          noRowsLabel: tasks.length === 0 ? t('tasks.noTasks') : ""
        }}
      />
      <Typography variant="h5" gutterBottom textAlign='center' marginTop='10px'>
        {t('home_view.events')}:
      </Typography>
      <DataGrid
        rows={events}
        columns={columnsEvents}
        pageSize={5}
        disableSelectionOnClick
        autoHeight
        pageSizeOptions={[5, 10, 20]}
        disableRowSelectionOnClick
        localeText={{
          noRowsLabel: events.length === 0 ? t('events.noEvents') : "",
        }}
      />
    </Box>
  );
};

StudentJob.propTypes = {
  job: PropTypes.string.isRequired,
};

export default StudentJob;
