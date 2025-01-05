import { useState, useEffect } from 'react';
import { styled, createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import MuiDrawer from '@mui/material/Drawer';
import Box from '@mui/material/Box';
import MuiAppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import List from '@mui/material/List';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Badge from '@mui/material/Badge';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import NotificationsIcon from '@mui/icons-material/Notifications';
import LanguageIcon from '@mui/icons-material/Language';
import { MainListItems, SecondaryListItems } from '../components/home/ListItems';
import StickyFooter from '../components/Footer';
import UserProfileAvatar from "../components/home/UserProfileAvatar"
import { useTranslation } from 'react-i18next';
import Tooltip from '@mui/material/Tooltip'; 
import { Outlet, useNavigate } from 'react-router-dom';
import { checkImageExists, deleteFilesFromStorage, deleteImageFromStorage, deleteMessagesFromStorage, listenForNotifications, removeNotificationsByUser } from '../services/firebase';
import Avatar from '@mui/material/Avatar';
import { useMediaQuery, Modal } from '@mui/material';
import { LOGIN_PATH } from '../routes/app-routes';
import { NOTIFICATIONS_API, USERS_API } from '../routes/api-routes';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Button from '@mui/material/Button';
import MenuLanguage from '../components/home/MenuLanguage';
import MenuProfile from '../components/home/MenuProfile';
import { useForm } from 'react-hook-form';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import NotificationComponent from '../components/home/NotificationComponent';
import axiosInstance from '../services/axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { init } from '../services/zegocloud';
import { clearLocalStorage } from '../App';

const drawerWidth = 240;

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== 'open',
})(({ theme, open }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(['width', 'margin'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

const Drawer = styled(MuiDrawer, { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme, open }) => ({
    '& .MuiDrawer-paper': {
      position: 'relative',
      whiteSpace: 'nowrap',
      width: drawerWidth,
      transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen,
      }),
      boxSizing: 'border-box',
      ...(!open && {
        overflowX: 'hidden',
        transition: theme.transitions.create('width', {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.leavingScreen,
        }),
        width: theme.spacing(7),
        [theme.breakpoints.up('sm')]: {
          width: theme.spacing(9),
        },
      }),
    },
  }),
);
  
const defaultTheme = createTheme();

export default function Home() {
  const email = localStorage.getItem('userEmail');
  const { t } = useTranslation();
  const { register, formState: {errors}, handleSubmit, reset } = useForm();
  const navigate = useNavigate();

  const [avatarUrl, setAvatarUrl] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [place, setPlace] = useState('');
  const [birthdate, setBirthdate] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [selectedStatus, setSelectedStatus] = useState(''); 

  const [notif, setNotif] = useState(false);

  const [open, setOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [profileAnchorEl, setProfileAnchorEl] = useState(null);

  const [messages, setMessages] = useState(null);

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const [showPassword, setShowPassword] = useState(false);

  const hideOnMenu = useMediaQuery('(max-width:600px)')
  const contentStyles = hideOnMenu ? {
    visibility: open ? "hidden" : "inherit",
    opacity: open ? "0" : "1"
  }: {}

  const [prevNotificationCount, setPrevNotificationCount] = useState(0);

  useEffect(() => {
    fetchNotifications();
    reset({ password: '' });
  }, [reset]);

  useEffect(() => {
    init();
  }, []);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axiosInstance.get(USERS_API + `/${email}`);
        
        const userData = response.data;
  
        setFirstName(userData.firstName);
        setLastName(userData.lastName);
        setBirthdate(userData.birthdate);
        setPlace(userData.place);
        setPhoneNumber(userData.phoneNumber == 0 ? '' : userData.phoneNumber);
        setSelectedStatus(userData.currentConnectivity);
      } catch (error) {
        console.error('Error updating user information:', error);
      }
    };

    const fetchAvatarUrl = async () => {
      const url = await checkImageExists(email);
      if (url) {
        setAvatarUrl(url);
      } 
    };
    
    fetchAvatarUrl();
    fetchUserData();
  }, [email]);

  useEffect(() => {
    if (email) {
      const unsubscribe = listenForNotifications(email, setMessages);

      const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const text = regex.test(messages?.user) ? "" : t('chat.job');

      if (messages?.user !== undefined) {
        const audio = new Audio('/soundNotif.mp3');
        audio.play();
        toast(t('chat.new_message') + messages?.user + text + "! 🎉", {
          autoClose: 2500,
          style: {
            background: 'white',
            color: 'black',
            fontWeight: 'bold',
            fontSize: '16px',
          }
        });
        return () => unsubscribe();
      }
    }
  }, [email, messages?.dataArray, messages?.user, t]);

  const fetchNotifications = async () => {
    try {
      const response = await axiosInstance.get(NOTIFICATIONS_API + `/${email}/notSeen`);

      setPrevNotificationCount(response.data.length);
    } catch (error) {
      if (error.response.status == 401) {
        clearLocalStorage();
        navigate(LOGIN_PATH);
      }
      console.error('Error charging not seen and not hidden notifications:', error);
    }
  };

  const handleOpen = () => {
    setNotif(true);
  };

  const handleClose = () => {
    fetchNotifications();
    setNotif(false);
  };

  const toggleDrawer = () => {
    setOpen(!open);
  };

  const closeDrawer = () => {
    setOpen(false);
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleProfileMenuOpen = (event) => {
    setProfileAnchorEl(event.currentTarget);
  };
  
  const closeDeleteDialog = () => {
    setShowDeleteDialog(false);
    reset({ password: '' });
  };

  const handleDelete = async () => {
    await axiosInstance.post(NOTIFICATIONS_API + `/push`, {
      type: "JOB_EXIT",
      receiver: "MEMBERS",
      sender: email,
      read: false,
      hidden: false,
      date: new Date(),
    });

    await deleteImageFromStorage(email);
    await deleteFilesFromStorage(email);
    await deleteMessagesFromStorage(email);
    await deleteMessagesFromStorage(email, true);
    removeNotificationsByUser(email);
    removeNotificationsByUser(email, true);

    try {
      const response = await axiosInstance.delete(USERS_API + `/${email}`);
      if (response.status === 200) {
        clearLocalStorage();
        navigate(LOGIN_PATH);
        closeDeleteDialog(); 
      }
    } catch (error) {
      if (error.response.status == 401) {
        clearLocalStorage();
        navigate(LOGIN_PATH);
        closeDeleteDialog();
      }
      console.error('Error delete account:', error);
    }
  };

  return (
    <ThemeProvider theme={defaultTheme}>
      <CssBaseline />
      <Box sx={{ display: 'flex' }}>
        <ToastContainer />
        <AppBar position="absolute" open={open}>
          <Toolbar>
            <Tooltip title={t('home_view.expandMenu')} arrow>
              <IconButton
                edge="start"
                color="inherit"
                aria-label="open drawer"
                onClick={toggleDrawer}
                sx={{ mr: 2, ...(open && { display: 'none' }) }}
              >
                <MenuIcon />
              </IconButton>
            </Tooltip>
            <MenuLanguage anchorEl={anchorEl} handleMenuClose={handleMenuClose} />
            <div style={{display: open?"none":"flex", justifyContent:"space-between", alignItems:"center", width:"100%"}}>
              <Typography variant="h8" component="div" width={"35%"}>
                {t('home_view.title')}
              </Typography>
              <div>
                <Tooltip title={t('home_view.language')} arrow>
                <IconButton color="inherit" onClick={handleMenuOpen}>
                    <LanguageIcon />
                    <Typography variant="body2" sx={{ ml: 1 }}>{t('home_view.language_short')}</Typography>
                  </IconButton>
                </Tooltip>
                <Tooltip title={t('home_view.notifications')} arrow>
                  <IconButton color="inherit" sx={{ mr: prevNotificationCount > 0 ? 1 : 0 }} onClick={handleOpen}>
                    <Badge badgeContent={prevNotificationCount} color="secondary">
                      <NotificationsIcon />
                    </Badge>
                  </IconButton>
                </Tooltip>
                <Modal
                  open={notif}
                  onClose={handleClose}
                  aria-labelledby="notification-modal-title"
                  aria-describedby="notification-modal-description"
                  style={{
                    display: 'flex',
                    alignItems: 'left',
                    justifyContent: 'center',
                  }}
                >
                  <div>
                    <NotificationComponent onClose={handleClose} />
                  </div>
                </Modal>
                <Tooltip title={t('home_view.account')} arrow>
                  <IconButton color="inherit" onClick={handleProfileMenuOpen}>
                    <UserProfileAvatar imageUrl={email} selectedStatus={selectedStatus} value={true} isHome={true} sx={{ marginLeft: 'auto' }} />
                  </IconButton>
                </Tooltip>
                <MenuProfile 
                  setProfileAnchorEl={setProfileAnchorEl} 
                  profileAnchorEl={profileAnchorEl} 
                  avatarUrl={avatarUrl} 
                  firstName={firstName}
                  lastName={lastName} 
                  email={email} 
                  birthdate={birthdate} 
                  place={place} 
                  phoneNumber={phoneNumber} 
                  selectedStatus={selectedStatus} 
                  setSelectedStatus={setSelectedStatus} 
                  setShowDeleteDialog={setShowDeleteDialog}
                />
              </div>
            </div>
          </Toolbar>
        </AppBar>
        <Drawer variant="permanent" open={open}>
          <Toolbar
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              px: [1],
            }}
          >
            <IconButton color="inherit">
              <Avatar alt="Logo" src='/logo.png' sx={{ marginLeft: 'auto' }} />
            </IconButton>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1, marginLeft: "4px" }}>
              {t('home_view.menu')}
            </Typography>
            <Tooltip title={t('home_view.closeMenu')} arrow>
            <IconButton onClick={toggleDrawer}>
              <ChevronLeftIcon />
            </IconButton>
          </Tooltip>
          </Toolbar>
          <Divider />
          <List>{MainListItems({ closeDrawer }, open)}</List>
          <Divider />
          <List>{SecondaryListItems({ closeDrawer}, open)}</List>
        </Drawer>
        <Box
          component="main"
          sx={{
            backgroundColor: (theme) =>
              theme.palette.mode === 'light'
                ? theme.palette.grey[100]
                : theme.palette.grey[900],
            flexGrow: 1,
            width: "100%",
            height: 'calc(100vh - 75px)',
            overflow: 'auto',
          }}
        >
          <Toolbar />
          <Container maxWidth="lg" sx={{ mt: 4, mb: 4, transitionDuration: "0.2s", width: '100%', 
          '@media only screen and (max-width: 500px)': {
            overflowX: 'hidden'
          } }} style={contentStyles}>
            <Grid container spacing={3}>
              <Outlet />
            </Grid>
          </Container>
        </Box>
      </Box>
      <StickyFooter />
      <Dialog open={showDeleteDialog} onClose={closeDeleteDialog}>
        <DialogTitle style={{ color: 'black', textAlign: 'center' }}>{t('home_view.confirm_delete')}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {t('home_view.delete_all')}
          </DialogContentText>
            <TextField
              required
              fullWidth
              autoFocus
              name="password"
              label={t('account_view.password')}
              type={showPassword ? 'text' : 'password'}
              style={{ marginTop: '15px' }}
              id="password"
              autoComplete="new-password"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      <Tooltip title={t('login_view.password_visibility_toggle')}>
                        {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </Tooltip>
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              {...register('password', {required: t('signup_view.actual_password'), pattern: {value: /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*()_+{}[\]:;<>,.?/\\~-]).{8,}$/, message: t('signup_view.actual_password')},
              validate: async (value) => {
                const response = await axiosInstance.post(USERS_API + `/${email}/check-password`, {password: value});
                const passwordsMatch = response.data;
                return passwordsMatch || t('signup_view.actual_password');
              }})}
              error={errors.password}
              helperText={errors.password? errors.password.message : ""}
            />
        </DialogContent>
        <DialogActions style={{ paddingRight: '1.7rem', paddingBottom: '1.5rem', justifyContent: 'flex-end' }}>
          <Button variant="outlined" color="primary" onClick={closeDeleteDialog}>
            {t('home_view.cancel')}
          </Button>
          <Button variant="contained" color="primary" onClick={handleSubmit(handleDelete)} >
            {t('home_view.confirm')}
          </Button>
        </DialogActions>
      </Dialog>                  
    </ThemeProvider>
  );
}