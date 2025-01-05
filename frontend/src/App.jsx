import { BrowserRouter, Route, Routes } from 'react-router-dom';
import LogIn from './views/LogIn';
import SignUp from './views/SignUp';
import Home from './views/Home';
import RecoverAccount from './views/RecoverAccount';
import RecoverPassword from './views/RecoverPassword';
import NotFound from './views/NotFound';
import About from './views/About';
import Account from './views/Account';
import Password from './views/Password';
import './Globals.css';
import { ABOUT_PATH, ACCOUNT_PATH, CALENDAR_PATH, STATS_PATH, CALLS_PATH, CHAT_PATH, CONTACTS_PATH, HOME_PATH, JOBS_PATH, JOBS_SUBPATH, KANBAN_PATH, LOGIN_PATH, NOT_FOUND, PASSWORD_PATH, RECOVER_ACCOUNT_PATH, RECOVER_PASSWORD_PATH, SIGNUP_PATH, INFORMS_PATH } from './routes/app-routes';
import CheckAuth from "./components/CheckAuth.jsx";
import LanguageWrapper from "./components/LanguageWrapper.jsx";
import Kanban from "./components/kanban/Kanban.jsx";
import Contacts from "./components/contacts/Contacts.jsx";
import Init from "./components/home/Init.jsx";
import FAQ from "./components/home/FAQ.jsx";
import ChatBox from "./components/chat/ChatBox.jsx";
import CallsBox from "./components/calls/CallsBox.jsx";
import Jobs from './components/jobs/Jobs.jsx';
import JobDetail from './components/jobs/JobDetail.jsx';
import Calendar from './components/calendar/Calendar.jsx';
import Stats from './components/stats/Stats.jsx';
import Informs from './components/informs/Informs.jsx';

const App = () => {
  if (!localStorage.getItem('language')) {
    localStorage.setItem('language', 'es');
  }

  return (
      <LanguageWrapper>
        <BrowserRouter>
          <Routes>
            <Route path={HOME_PATH} element={<CheckAuth/>}>
              <Route path={HOME_PATH} element={<Home />}>
                <Route path={HOME_PATH} element={<> <Init /> <FAQ /> </>} />
                <Route path={JOBS_PATH} element={<Jobs />} />
                <Route path={JOBS_SUBPATH} element={<JobDetail />} />
                <Route path={KANBAN_PATH} element={<Kanban />} />
                <Route path={CALENDAR_PATH} element={<Calendar />} />
                <Route path={INFORMS_PATH} element={<Informs />} />
                <Route path={STATS_PATH} element={<Stats />} />
                <Route path={CONTACTS_PATH} element={<Contacts />} />
                <Route path={CHAT_PATH} element={<ChatBox />} />
                <Route path={CALLS_PATH} element={<CallsBox />} />
              </Route>
              <Route path={ACCOUNT_PATH} element={<Account />} />
              <Route path={ABOUT_PATH} element={<About />} />
              <Route path={PASSWORD_PATH} element={<Password />} />
            </Route>
            <Route path={LOGIN_PATH} element={<LogIn />} />
            <Route path={SIGNUP_PATH} element={<SignUp />} />
            <Route path={RECOVER_ACCOUNT_PATH} element={ <RecoverAccount /> } />
            <Route path={RECOVER_PASSWORD_PATH} element={<RecoverPassword />} />
            <Route path={NOT_FOUND} element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </LanguageWrapper>
  );
};

export function clearLocalStorage() {
  const storageLength = localStorage.length;
  const keysToDelete = [];

  for (let i = 0; i < storageLength; i++) {
    const key = localStorage.key(i);
    if (key.startsWith('z') || key.startsWith('firebase') || key === 'language' || key === 'userEmail' || key === 'token' || key === 'tokenZegoCloud' || key === 'accesshubDispatchServers') {
      keysToDelete.push(key);
    }
  }

  keysToDelete.forEach(key => {
    localStorage.removeItem(key);
  });
}

export default App;
