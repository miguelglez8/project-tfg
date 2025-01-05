const BASE_PATH = import.meta.env.VITE_PATH;

const LOGIN_PATH = "/login";
const SIGNUP_PATH = "/signup";

const RECOVER_ACCOUNT_PATH = "/recover-account";
const RECOVER_PASSWORD_PATH = "/recover-password";

const HOME_PATH = "/";
const JOBS_PATH = "/jobs";
const JOBS_SUBPATH = JOBS_PATH + "/:title";
const CONTACTS_PATH = "/contacts";
const KANBAN_PATH = "/kanban";
const CALENDAR_PATH = "/calendar";
const INFORMS_PATH = "/informs";
const STATS_PATH = "/stats";
const CHAT_PATH = "/chat";
const CALLS_PATH = "/calls";

const ABOUT_PATH = "/about";
const ACCOUNT_PATH = "/account";
const PASSWORD_PATH = "/password";

const IMAGES_PATH = "accountImages";
const AUDIOS_PATH = "audios";
const FILES_PATH = "files";

const NOT_FOUND = "*";

export {
  BASE_PATH,
  LOGIN_PATH,
  SIGNUP_PATH,
  RECOVER_ACCOUNT_PATH,
  RECOVER_PASSWORD_PATH,
  HOME_PATH,
  JOBS_PATH,
  JOBS_SUBPATH,
  CONTACTS_PATH,
  KANBAN_PATH,
  CALENDAR_PATH,
  INFORMS_PATH,
  STATS_PATH,
  CHAT_PATH,
  CALLS_PATH,
  ABOUT_PATH,
  ACCOUNT_PATH,
  PASSWORD_PATH,
  IMAGES_PATH,
  AUDIOS_PATH,
  FILES_PATH,
  NOT_FOUND
};