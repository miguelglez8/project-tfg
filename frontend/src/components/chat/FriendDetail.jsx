import { useMemo, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { ListItemText, Tooltip, IconButton, Grid } from '@mui/material';
import ChatIcon from '@mui/icons-material/Chat';
import DeleteIcon from '@mui/icons-material/Delete';
import { useTranslation } from 'react-i18next';
import { getDocsReceiver, getDocsSender, getReceiver, getSender } from '../../services/firebase';
import VisibilityIcon from '@mui/icons-material/Visibility';
import MicIcon from "@mui/icons-material/Mic";
import FileIcon from '../messages/FileIcon';

const FriendDetail = ({ contact, handleSendMessage, handleOpenConfirmation }) => {
    const user = localStorage.getItem('userEmail');
    const { t } = useTranslation();
    const [lastMessages, setMessage] = useState('');
    const SeenIcon = VisibilityIcon;
    const [receiver, setIsReceiver] = useState('');

    useEffect(() => {
        async function fetchData() {
          const lastMessage = await getLastMessages();

          setIsReceiver(lastMessage?.sender !== user && lastMessage?.seenByRecipient==false && lastMessage !== t('chat.startConversation'));
    
          setMessage(lastMessage);
        }
    
        fetchData();
      }, [user, t]);
    
    const getLastMessages = async () => {    
        const senderQuery = getSender(user, contact);
    
        const receiverQuery = getReceiver(contact, user);

        const [senderSnapshot, receiverSnapshot] = await Promise.all([
            getDocsSender(senderQuery),
            getDocsReceiver(receiverQuery)
        ]);
    
        const senderMessage = senderSnapshot.empty ? null : senderSnapshot.docs[0].data();
        const receiverMessage = receiverSnapshot.empty ? null : receiverSnapshot.docs[0].data();

        const lastMessage = 
            (!senderMessage && !receiverMessage) ? t('chat.startConversation') :
            (!senderMessage) ? receiverMessage :
            (!receiverMessage) ? senderMessage :
            (senderMessage.createdAt > receiverMessage.createdAt) ? senderMessage : receiverMessage;

        if (lastMessage) {
            return lastMessage;
        }
    };

    const formatMessageDate = (lastMessage) => {
        if (lastMessage === t('chat.startConversation')) {
            const fechaActual = new Date();
            const dia = String(fechaActual.getDate()).padStart(2, '0');
            const mes = String(fechaActual.getMonth() + 1).padStart(2, '0');
            const año = fechaActual.getFullYear();
            return `${dia}/${mes}/${año}`;
        }

        const date = lastMessage?.createdAt?.toDate ? lastMessage.createdAt.toDate() : null;

        if (!date) return '';

        const now = new Date();
        const messageDate = new Date(date);

        const isSameDay =
            now.getDate() === messageDate.getDate() &&
            now.getMonth() === messageDate.getMonth() &&
            now.getFullYear() === messageDate.getFullYear();

        const isYesterday =
            now.getDate() - messageDate.getDate() === 1 &&
            now.getMonth() === messageDate.getMonth() &&
            now.getFullYear() === messageDate.getFullYear();

        if (isSameDay) {
            return messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } else if (isYesterday) {
            return t('time.yesterday');
        } else {
            const dia = String(messageDate.getDate()).padStart(2, '0');
            const mes = String(messageDate.getMonth() + 1).padStart(2, '0');
            const año = messageDate.getFullYear();
            return `${dia}/${mes}/${año}`;
        }
    };

    const truncatedText = useMemo(() => {
        if (lastMessages === t('chat.startConversation')) return lastMessages;

        if (lastMessages && lastMessages.duration) {
            const durationMinutes = Math.floor(lastMessages.duration / 60);
            const durationSeconds = lastMessages.duration % 60;
            const formattedDuration = `${durationMinutes}:${durationSeconds.toString().padStart(2, '0')}`;
            return (
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <span style={{ marginRight: '5px' }} role="img" aria-label="microphone"><MicIcon /></span>
                    {formattedDuration}
                </div>
            );
        }
    
        if (lastMessages && lastMessages.fileName) {
            return (
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <span style={{ marginRight: '5px' }} role="img" aria-label="file"><FileIcon fileName={lastMessages.fileName} /></span> 
                    {lastMessages.fileName}
                </div>
            );
        }
    
        const MAX_LENGTH = 50;
        return lastMessages && lastMessages.text && lastMessages.text.length > MAX_LENGTH
            ? lastMessages.text.substring(0, MAX_LENGTH - 3) + '...'
            : lastMessages?.text || '';
    }, [lastMessages, t]);
    
    return (
        <Grid container spacing={0}>
            <Grid item xs={12}>
                <Grid container justifyContent="space-between">
                    <Grid item>
                        <ListItemText primary={<b>{`${contact.firstName} ${contact.lastName}`}</b>} />
                    </Grid>
                    <Grid item>
                        <Tooltip title={t('chat.lastMessage')}>
                            <div>{formatMessageDate(lastMessages)}</div>
                        </Tooltip>
                    </Grid>
                </Grid>
            </Grid>
            <Grid item xs={12}>
                <ListItemText
                    secondary={
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', overflow: 'hidden', textOverflow: 'ellipsis', wordBreak: 'break-all' }}>
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                    {lastMessages?.sender === user && lastMessages?.seenByRecipient == false && (
                                        <>
                                            <Tooltip title={t('chat.sent')}>
                                                <span style={{ fontSize: 20 }}>✓✓</span>
                                            </Tooltip>
                                            <span>&nbsp;</span>
                                        </>
                                    )}
                                    {lastMessages?.sender === user && lastMessages?.seenByRecipient == true && (
                                        <>
                                            <Tooltip title={t('chat.seen')}>
                                                <SeenIcon />
                                            </Tooltip>
                                            <span>&nbsp;</span>
                                        </>
                                    )}
                                    {receiver ? <span style={{ fontWeight: receiver ? 'bold' : 'normal' }}> {truncatedText} </span> : truncatedText}
                                </div>
                            </div>
                        </div>
                    }
                />
            </Grid>
            <Grid item xs={12}>
                <Grid container justifyContent="flex-end">
                    <Grid item>
                        <Tooltip title={t('chat.send')}>
                            <IconButton color="primary" onClick={() => handleSendMessage(contact)}>
                                <ChatIcon />
                            </IconButton>
                        </Tooltip>
                        {receiver && (
                            <span style={{ color: 'red', fontSize: 12 }}>● </span>
                        )}
                        <Tooltip title={t('chat.delete')}>
                            <IconButton color="error" onClick={() => handleOpenConfirmation(contact.email)}>
                                <DeleteIcon />
                            </IconButton>
                        </Tooltip>
                    </Grid>
                </Grid>
            </Grid>
        </Grid>
    );       
};

FriendDetail.propTypes = {
    contact: PropTypes.object.isRequired,
    handleSendMessage: PropTypes.func.isRequired,
    handleOpenConfirmation: PropTypes.func.isRequired,
};

export default FriendDetail;
