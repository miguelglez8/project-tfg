import { ListItemAvatar, Avatar, ListItemText, Tooltip, IconButton, ListItem } from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import ClearIcon from '@mui/icons-material/Clear';
import { format } from 'date-fns';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';
import { checkImageExists } from '../../services/firebase';
import axiosInstance from '../../services/axios';
import { JOBS_API } from '../../routes/api-routes';
import { useNavigate } from 'react-router-dom';
import { LOGIN_PATH } from '../../routes/app-routes';
import { clearLocalStorage } from '../../App';

const FriendshipReceivedCard = ({ sender, message, date, index, handleAcceptRequest, handleCancelRequest, isJob, job }) => {
    const user = localStorage.getItem('userEmail');
    const { t } = useTranslation();
    const navigate = useNavigate();

    const [image, setImage] = useState("");
    const [max, setMax] = useState(true);

    useEffect(() => {
        async function fetchImage() {
            setImage(await checkImageExists(sender));
        }

        async function fetchMembers() {
            try {
                const response = await axiosInstance.get(`${JOBS_API}/members`, {
                    params: {
                        jobTitle: job,
                        user: user
                    }
                });
                if (response.data.length == 4) {
                    setMax(false);
                }
            } catch (error) {
                if (error.response.status == 401) {
                    clearLocalStorage();
                    navigate(LOGIN_PATH);
                }
                console.error("Error fetching members: " + error);
            }
        }

        fetchImage();

        if (isJob) fetchMembers();
    }, [sender, isJob, job, user, navigate]);


    return (
        <ListItem key={index}>
            <ListItemAvatar>
                <Avatar alt={sender} src={image} />
            </ListItemAvatar>
            <ListItemText 
            primary={sender} 
                secondary={
                    <>
                        <div>
                            {message}
                        </div>
                        <div>
                            {format(new Date(date), "dd/MM/yyyy HH:mm")}
                        </div>
                    </>
                }
                secondaryTypographyProps={{
                    component: 'div',
                    style: {
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                    }
                }}
            />
            {max &&
                <Tooltip title={t('contacts.accept')}>
                    <IconButton onClick={() => handleAcceptRequest()} color="primary">
                        <CheckIcon />
                    </IconButton>
                </Tooltip>
            }
            <Tooltip title={t('contacts.reject')}>
                <IconButton onClick={() => handleCancelRequest()} color="error">
                    <ClearIcon />
                </IconButton>
            </Tooltip>
        </ListItem>
    );
};    

FriendshipReceivedCard.propTypes = {
    sender: PropTypes.string.isRequired,
    message: PropTypes.string.isRequired,
    date: PropTypes.string.isRequired,
    index: PropTypes.object.isRequired,
    handleAcceptRequest: PropTypes.func.isRequired,
    handleCancelRequest: PropTypes.func.isRequired,
    isJob: PropTypes.bool.isRequired,
    job: PropTypes.string.isRequired
};

export default FriendshipReceivedCard;
