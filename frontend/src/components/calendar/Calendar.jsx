import { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import multiMonthPlugin from '@fullcalendar/multimonth';
import listPlugin from '@fullcalendar/list';
import { Snackbar, Tooltip, Typography } from '@mui/material';
import EventForm from './EventForm';
import { useNavigate } from 'react-router-dom';
import { deleteFileFromStorage, uploadFileToStorage } from '../../services/firebase';
import axiosInstance from '../../services/axios';
import { EVENTS_API, NOTIFICATIONS_API } from '../../routes/api-routes';
import { LOGIN_PATH } from '../../routes/app-routes';
import { useTranslation } from 'react-i18next';
import MuiAlert from "@mui/material/Alert";
import EventDetails from './EventDetails';
import { clearLocalStorage } from '../../App';

export default function Calendar() {
  const user = localStorage.getItem("userEmail");
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [events, setEvents] = useState([]);
  const [createEvent, setCreateEvent] = useState(false);
  const [modifyEvent, setModifyEvent] = useState(false);
  const [created, setEventCreatedMessage] = useState(false);
  const [deleted, setEventDeletedMessage] = useState(false);
  const [modified, setEventModifiedMessage] = useState(false);
  const [newEvent, setNewEvent] = useState(null);

  useEffect(() => {
    fetchDefaultEvents();
  }, []);

  const handleDateClick = (arg) => {
    let newEvent = { start: new Date(arg.date.getTime()), allDay: arg.allDay };
    setNewEvent(newEvent);
    setCreateEvent(true);
  };

  const handleDetails = (info) => {
    setNewEvent(info.event);
    setModifyEvent(true);
  };

  const handleCloseFormCreate = () => {
    setCreateEvent(false);
  };

  const handleCloseFormModify = () => {
    setModifyEvent(false);
  };

  const handleEvent = async (info) => {
    const id = info.event.id;
    const startIndex = info.event.title.indexOf('(') + 1;
    const endIndex = info.event.title.indexOf(')'); 

    try {
      await axiosInstance.put(EVENTS_API + `/${id}?user=`+user, {
        id: id,
        name: info.event.title.substring(0, info.event.title.indexOf('(')).trim(),
        subject: info.event.extendedProps.subject,
        attachedResources: info.event.extendedProps.attachedResources,
        deadlineDateTimeInit: info.event.start,
        deadlineDateTimeFin: info.event.end,
        associatedAcademicWork: info.event.title.substring(startIndex, endIndex).trim(),
        assignedTo: info.event.extendedProps.assignedTo,
        allDay: info.event.allDay,
        location: info.event.extendedProps.location
      });
    } catch (error) {
      if (error.response.status == 401) {
        clearLocalStorage();
        navigate(LOGIN_PATH);
      }
      console.error("Error updating events:", error);
    }
    
    const assignedTo = info.event.extendedProps.assignedTo;
    const associatedAcademicWork = info.event.title.substring(startIndex, endIndex).trim();

    if (assignedTo && assignedTo.length > 1) {
      for (let i = 1; i < assignedTo.length; i++) {
        if (assignedTo[i] != user) {
          const friend = assignedTo[i];
          await axiosInstance.post(NOTIFICATIONS_API + `/push`, {
            type: "EVENT_MODIFY",
            receiver: friend,
            sender: user,
            read: false,
            hidden: false,
            date: new Date(),
            titleTeam: associatedAcademicWork
          });
        }
      }
    }

    fetchDefaultEvents();
  };

  const handleSelectableDates = (selectionInfo) => {
    const { start, end, allDay } = selectionInfo;
    let newEvent = { start: new Date(start.getTime()), end: new Date(end.getTime() - 1), allDay: allDay };
    setNewEvent(newEvent);
    setCreateEvent(true);
  };

  const fetchDefaultEvents = async () => {
    try {
      const response = await axiosInstance.get(EVENTS_API + `/${user}`);
      const fetchedEvents = response.data.map((event) => ({
        id: event.id,
        title: event.name + ' (' + event.associatedAcademicWork + ')',
        start: event.deadlineDateTimeInit,
        end: event.deadlineDateTimeFin,
        color: event.assignedTo.length > 1 ? '#ff0000' : '#3788d8',
        textColor: '#ffffff',
        borderColor: '#285e8e',
        editable: true,
        allDay: event.allDay,
        extendedProps: {
          subject: event.subject,
          resources: event.attachedResources,
          location: event.location,
          assignedTo: event.assignedTo
        }
      }));
      setEvents(fetchedEvents);
    } catch (error) {
      if (error.response.status == 401) {
        clearLocalStorage
        navigate(LOGIN_PATH);
      }
      console.error("Error fetching events:", error);
    }
  };

  const handleSubmitForm = async (eventData) => {
    try {
      eventData.assignedTo = [user, ...eventData.assignedTo.map(friend => friend.email)];

      if (eventData.allDay) {
        eventData.deadlineDateTimeInit = eventData.deadlineDateTimeInit + 'T00:00';
        eventData.deadlineDateTimeFin = eventData.deadlineDateTimeFin + 'T00:00';

        let deadline = new Date(eventData.deadlineDateTimeFin);

        deadline.setDate(deadline.getDate() + 2);

        eventData.deadlineDateTimeFin = deadline;
      }

      if (eventData.attachedResources) {
        uploadFileToStorage(
          eventData.attachedResources,
          eventData.associatedAcademicWork,
          true
        );
        eventData.attachedResources = eventData.attachedResources.name;
      }
    
      await axiosInstance.post(EVENTS_API, eventData);
    } catch (error) {
      if (error.response.status == 401) {
        clearLocalStorage();
        navigate(LOGIN_PATH);
      }
      console.error("Error creating events:", error);
    }

    if (eventData.assignedTo && eventData.assignedTo.length > 1) {
      for (let i = 1; i < eventData.assignedTo.length; i++) {
        const friend = eventData.assignedTo[i];
        await axiosInstance.post(NOTIFICATIONS_API + `/push`, {
          type: "EVENT",
          receiver: friend,
          sender: user,
          read: false,
          hidden: false,
          date: new Date(),
          titleTeam: eventData.associatedAcademicWork
        });
      }
    }

    setEventCreatedMessage(true);
    fetchDefaultEvents();
  };

  const handleDelete = async (event) => {
    let response = null;
    try {
      response = await axiosInstance.get(EVENTS_API + `/${event.id}/id`);
      const file = response.data.attachedResources;

      await axiosInstance.delete(EVENTS_API + `/${event.id}/id?user=` + user);

      if (response.data.assignedTo[0] == user)
        deleteFileFromStorage(response.data.associatedAcademicWork, file, true);
      
    } catch (error) {
      if (error.response.status == 401) {
        clearLocalStorage();
        navigate(LOGIN_PATH);
      }
      console.error("Error deleting events:", error);
    }

    if (response.data.assignedTo && response.data.assignedTo.length > 1) {
      for (let i = 0; i < response.data.assignedTo.length; i++) {
        if (response.data.assignedTo[i] != user) {
          const friend = response.data.assignedTo[i];
          await axiosInstance.post(NOTIFICATIONS_API + `/push`, {
            type: user==response.data.assignedTo[0] ? "EVENT_DELETE" : "EVENT_EXIT",
            receiver: friend,
            sender: user,
            read: false,
            hidden: false,
            date: new Date(),
            titleTeam: response.data.associatedAcademicWork
          });
        }
      }
    }

    setEventDeletedMessage(true);
    fetchDefaultEvents();
  };

  async function handleUpdate(eventData) {
    const assignedTo = eventData.assignedTo;
    const associatedAcademicWork = eventData.associatedAcademicWork;

    try {
      if (eventData.allDay || eventData.start != eventData.end) {
        eventData.deadlineDateTimeInit = eventData.deadlineDateTimeInit + 'T00:00';
        eventData.deadlineDateTimeFin = eventData.deadlineDateTimeFin + 'T00:00';

        let deadline = new Date(eventData.deadlineDateTimeFin);

        deadline.setDate(deadline.getDate() + 2);

        eventData.deadlineDateTimeFin = deadline;
      }

      await axiosInstance.put(EVENTS_API + `/${eventData.id}?user=`+user, eventData);
    } catch (error) {
      if (error.response.status == 401) {
        clearLocalStorage();
        navigate(LOGIN_PATH);
      }
      console.error("Error updating events:", error);
    }

    if (assignedTo && assignedTo.length > 1) {
      for (let i = 1; i < assignedTo.length; i++) {
        if (assignedTo[i] != user) {
          const friend = assignedTo[i];
          await axiosInstance.post(NOTIFICATIONS_API + `/push`, {
            type: "EVENT_MODIFY",
            receiver: friend,
            sender: user,
            read: false,
            hidden: false,
            date: new Date(),
            titleTeam: associatedAcademicWork
          });
        }
      }
    }

    setEventModifiedMessage(true);
    fetchDefaultEvents();
  }

  function renderEventContent(eventInfo) {
    const viewInfo = eventInfo.view;
    const color = eventInfo?.event.extendedProps?.assignedTo?.length > 1 ? '#ff0000' : '#3788d8';
    return (
      <Tooltip title={t('events.move')}>
        <div>
          {eventInfo.event.allDay == false && viewInfo.type === "dayGridMonth" &&
          <span style={{ fontSize: '1.2em', fontWeight: 'bold', color: color }}>• </span>
          }
          <span>{eventInfo.timeText}</span>
          {eventInfo.event.allDay == false && viewInfo.type !== "dayGridMonth" && viewInfo.type !== "list" &&
            <br></br>
          }
            <strong> {eventInfo.event.title}</strong>
        </div>
      </Tooltip>
    );
  }

  return (
    <div className="text-center">
      <Typography variant="h4" gutterBottom style={{ marginTop: "20px" }}>
        {t('events.title')}
      </Typography>
      <div style={{ width: '85%', marginLeft: '15px' }}>
        <FullCalendar
          locale={localStorage.getItem('language')}
          timeZone='UTC'
          plugins={[multiMonthPlugin, dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          droppable={true}
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay,list'
          }}
          buttonText= {{
            today: t('events.today'),
            month: t('events.month'),
            week: t('events.week'),
            day:  t('events.day'),
            list:  t('events.list')
          }}
          firstDay={1}
          events={events}
          dayMaxEventRows={true}
          editable={true}
          selectable={true}
          eventContent={renderEventContent}
          noEventsContent={t('events.noEvents')}
          eventDrop={handleEvent}
          eventResize={handleEvent}
          dateClick={handleDateClick}
          select={handleSelectableDates}
          eventClick={handleDetails}
          eventTimeFormat= {{
            hour: '2-digit',
            minute: '2-digit',
            meridiem: false
          }}
          height="auto"
        />
      </div>
      <EventForm open={createEvent} onClose={handleCloseFormCreate} onSubmit={handleSubmitForm} newEvent={newEvent} />
      <EventDetails open={modifyEvent} onClose={handleCloseFormModify} updateData={handleUpdate} deleteData={handleDelete} newEvent={newEvent} />
      <Snackbar
        open={created}
        autoHideDuration={3000}
        onClose={() => setEventCreatedMessage(false)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <MuiAlert
          onClose={() => setEventCreatedMessage(false)}
          severity="success"
          sx={{ width: "100%" }}
        >
          {t('events.created')}
        </MuiAlert>
      </Snackbar>
      <Snackbar
        open={deleted}
        autoHideDuration={3000}
        onClose={() => setEventDeletedMessage(false)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <MuiAlert
          onClose={() => setEventDeletedMessage(false)}
          severity="success"
          sx={{ width: "100%" }}
        >
          {t('events.deleted')}
        </MuiAlert>
      </Snackbar>
      <Snackbar
        open={modified}
        autoHideDuration={3000}
        onClose={() => setEventModifiedMessage(false)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <MuiAlert
          onClose={() => setEventModifiedMessage(false)}
          severity="success"
          sx={{ width: "100%" }}
        >
          {t('events.modified')}
        </MuiAlert>
      </Snackbar>
    </div>
  );
}
