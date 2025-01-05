import { ListItem, ListItemAvatar, ListItemText, IconButton, Tooltip } from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import DeleteIcon from '@mui/icons-material/Delete';
import { useTranslation } from 'react-i18next';
import UserProfileAvatar from '../home/UserProfileAvatar';
import PropTypes from 'prop-types';

const ContactCard = ({ contact, handleViewFriendDetail, handleOpenConfirmation }) => {
    const { t } = useTranslation();
   
    return (<ListItem>
    <ListItemAvatar>
        <UserProfileAvatar imageUrl={contact.email} selectedStatus={contact.currentConnectivity} />
    </ListItemAvatar>
    <ListItemText primary={`${contact.firstName} ${contact.lastName}`} secondary={contact.email} />
    <Tooltip title={t('contacts.info')}>
        <IconButton onClick={() => handleViewFriendDetail(contact.email)} color="primary">
            <InfoIcon />
        </IconButton>
    </Tooltip>
    <Tooltip title={t('contacts.delete_friend')}>
        <IconButton onClick={() => handleOpenConfirmation(contact.email)} color="error">
            <DeleteIcon />
        </IconButton>
    </Tooltip>
</ListItem>)
}

ContactCard.propTypes = {
    contact: PropTypes.object.isRequired,
    handleViewFriendDetail: PropTypes.func.isRequired,
    handleOpenConfirmation: PropTypes.func.isRequired,
  };

export default ContactCard;