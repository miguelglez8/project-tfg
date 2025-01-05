const BASE_API = import.meta.env.VITE_API;

const USERS_API = BASE_API + "/users";

const AUTH_API = BASE_API + "/auth";
const LOGOUT_API = BASE_API + "/logout";
const TOKEN_API = BASE_API + "/token";

const EMAIL_API = BASE_API + "/send-email";

const FRIENDS_API = BASE_API + "/friendships";

const TASKS_API = BASE_API + "/tasks";

const TASKSTATUS_API = BASE_API + "/taskStatus";

const EVENTS_API = BASE_API + "/events";

const NOTIFICATIONS_API = BASE_API + "/notifications";

const CALLS_API = BASE_API + "/calls";

const JOBS_API = BASE_API + "/jobs";

const JOBINQUIRIES_API = BASE_API + "/jobinquiries";

const INFORMS_API = BASE_API + "/informs";

const STATS_API = BASE_API + "/stats";

export {
  BASE_API,
  USERS_API,
  AUTH_API,
  LOGOUT_API,
  TOKEN_API,
  EMAIL_API,
  FRIENDS_API,
  TASKS_API,
  TASKSTATUS_API,
  EVENTS_API,
  NOTIFICATIONS_API,
  CALLS_API,
  JOBS_API,
  JOBINQUIRIES_API,
  INFORMS_API,
  STATS_API
};