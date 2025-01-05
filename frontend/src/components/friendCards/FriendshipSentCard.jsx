import { ListItemAvatar, Avatar, ListItemText, Tooltip, IconButton, ListItem } from '@mui/material';
import CancelIcon from '@mui/icons-material/Cancel';
import { format } from 'date-fns';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';
import { checkImageExists } from '../../services/firebase';

const FriendshipSentCard = ({ receiver, message, date, index, handleDeleteRequest }) => {
    const { t } = useTranslation();
    const [image, setImage] = useState("");

    useEffect(() => {
        async function fetchImage() {
            setImage(await checkImageExists(receiver));
        }

        fetchImage();
    }, [receiver]);

    return (
        <ListItem key={index}>
            <ListItemAvatar>
                <Avatar alt={receiver} src={image} />
            </ListItemAvatar>
            <ListItemText 
                primary={receiver} 
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
            <Tooltip title={t('contacts.cancel')}>
                <IconButton onClick={() => handleDeleteRequest()} color="error">
                    <CancelIcon  />
                </IconButton>
            </Tooltip>
        </ListItem>
    );
};    

FriendshipSentCard.propTypes = {
    receiver: PropTypes.string.isRequired,
    message: PropTypes.string.isRequired,
    date: PropTypes.string.isRequired,
    index: PropTypes.object.isRequired,
    handleDeleteRequest: PropTypes.func.isRequired
};

export default FriendshipSentCard;
