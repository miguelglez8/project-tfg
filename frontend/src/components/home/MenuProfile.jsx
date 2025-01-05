import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Divider from "@mui/material/Divider";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";
import { useNavigate, Link } from "react-router-dom";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import {
  ACCOUNT_PATH,
  PASSWORD_PATH,
  ABOUT_PATH,
  LOGIN_PATH,
} from "../../routes/app-routes";
import { LOGOUT_API, USERS_API } from "../../routes/api-routes";
import Typography from "@mui/material/Typography";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import Select from "@mui/material/Select";
import DeleteIcon from "@mui/icons-material/Delete";
import InfoIcon from "@mui/icons-material/Info";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import AccessTimeFilledIcon from "@mui/icons-material/AccessTimeFilled";
import WifiOffIcon from "@mui/icons-material/WifiOff";
import LockIcon from "@mui/icons-material/Lock";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import axiosInstance from "../../services/axios";
import { clearLocalStorage } from "../../App";

const MenuProfile = ({
  setProfileAnchorEl,
  profileAnchorEl,
  avatarUrl,
  firstName,
  lastName,
  email,
  birthdate,
  place,
  phoneNumber,
  selectedStatus,
  setSelectedStatus,
  setShowDeleteDialog,
}) => {
  const user = localStorage.getItem('userEmail');
  const { t } = useTranslation();
  const navigate = useNavigate();

  const statusOptions = [
    {
      value: "AVAILABLE",
      label: t("home_view.available"),
      icon: (
        <CheckCircleIcon
          sx={{
            color: "#00FF00",
            width: "16px",
            height: "16px",
            marginLeft: "2px",
          }}
        />
      ),
    },
    {
      value: "BUSY",
      label: t("home_view.busy"),
      icon: (
        <CancelIcon sx={{ color: "#FF0000", width: "16px", height: "16px" }} />
      ),
    },
    {
      value: "AWAY",
      label: t("home_view.away"),
      icon: (
        <AccessTimeFilledIcon
          sx={{ color: "#FFD700", width: "16px", height: "16px" }}
        />
      ),
    },
    {
      value: "OFFLINE",
      label: t("home_view.offline"),
      icon: (
        <WifiOffIcon sx={{ color: "#808080", width: "16px", height: "16px" }} />
      ),
    },
  ];

  const handleProfileMenuClose = () => {
    setProfileAnchorEl(null);
  };

  const handleLogout = async () => {
    try {
      const response = await axiosInstance.post(LOGOUT_API, {email: user});
      if (response.status === 200) {
        clearLocalStorage();
        navigate(LOGIN_PATH);
      }
    } catch (error) {
      if (error.response.status == 401) {
        clearLocalStorage();
        navigate(LOGIN_PATH);
      }
      console.error("Error logout:", error);
    }
  };

  const openDeleteDialog = () => {
    setShowDeleteDialog(true);
    setProfileAnchorEl(null)
  };

  const handleChange = async (event) => {
    try {
      setSelectedStatus(event.target.value);
      await axiosInstance.put(USERS_API + `/${email}`, {
        firstName,
        lastName,
        birthdate,
        place,
        phoneNumber,
        currentConnectivity: event.target.value,
      });
    } catch (error) {
      console.error("Error updating user status:", error);
    }
  };

  return (
    <Menu
      anchorEl={profileAnchorEl}
      open={Boolean(profileAnchorEl)}
      onClose={handleProfileMenuClose}
      anchorOrigin={{
        vertical: "bottom",
        horizontal: "right",
      }}
      transformOrigin={{
        vertical: "top",
        horizontal: "right",
      }}
      style={{ marginTop: "5px" }}
    >
      <ListItem>
        <Box display="flex" alignItems="center">
          <Avatar src={avatarUrl} sx={{ width: 80, height: 80 }} />
          <Box ml={3}>
            <ListItemText
              primary={
                <Typography variant="body1" fontWeight="bold">
                  {firstName} {lastName}
                </Typography>
              }
              secondary={
                <>
                  <Typography variant="body2">{email}</Typography>
                  <Link to={ACCOUNT_PATH} style={{ textDecoration: "none" }}>
                    <Typography variant="body2" style={{ color: "black" }}>
                      {t("home_view.consult_account")}{" "}
                      <ArrowForwardIcon sx={{ fontSize: "small" }} />
                    </Typography>
                  </Link>
                  <Link to={PASSWORD_PATH} style={{ textDecoration: "none" }}>
                    <Typography variant="body2" style={{ color: "black" }}>
                      {t("home_view.change_password")}{" "}
                      <LockIcon sx={{ fontSize: "small" }} />
                    </Typography>
                  </Link>
                  <Select
                    value={selectedStatus}
                    onChange={handleChange}
                    displayEmpty
                    style={{ marginTop: "8px", height: "32px" }}
                    sx={{ mt: "8px" }}
                  >
                    {statusOptions.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.icon} {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </>
              }
            />
          </Box>
        </Box>
      </ListItem>
      <Divider />
      <MenuItem component={Link} to={ABOUT_PATH} style={{ marginTop: "10px" }}>
        <InfoIcon sx={{ mr: 1.5 }} />
        {t("home_view.about")}
      </MenuItem>
      <Divider />
      <MenuItem onClick={openDeleteDialog} sx={{ marginTop: "8px" }}>
        <DeleteIcon sx={{ mr: 1.5 }} />
        {t("home_view.delete")}
      </MenuItem>
      <Divider />
      <MenuItem onClick={handleLogout}>
        <ExitToAppIcon sx={{ mr: 1.5 }} />
        {t("home_view.logout")}
      </MenuItem>
    </Menu>
  );
};

MenuProfile.propTypes = {
  setProfileAnchorEl: PropTypes.func.isRequired,
  profileAnchorEl: PropTypes.object,
  avatarUrl: PropTypes.string.isRequired,
  firstName: PropTypes.string.isRequired,
  lastName: PropTypes.string.isRequired,
  email: PropTypes.string.isRequired,
  birthdate: PropTypes.string.isRequired,
  place: PropTypes.string.isRequired,
  phoneNumber: PropTypes.string.isRequired,
  selectedStatus: PropTypes.string.isRequired,
  setSelectedStatus: PropTypes.func.isRequired,
  setShowDeleteDialog: PropTypes.func.isRequired,
};

export default MenuProfile;
