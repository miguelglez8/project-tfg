import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import SendIcon from "@mui/icons-material/Send";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import { Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button, IconButton, TextField, Tooltip } from '@mui/material';
import { getDocsSender, getLast, sendMessageToBd, uploadAudio, uploadFile, sendMessageToUser } from "../../services/firebase.js";
import PropTypes from 'prop-types';
import { AudioRecorder, useAudioRecorder } from 'react-audio-voice-recorder';
import { JOBS_API, NOTIFICATIONS_API } from "../../routes/api-routes.js";
import axiosInstance from "../../services/axios.js";
import { useNavigate } from "react-router-dom";
import { LOGIN_PATH } from "../../routes/app-routes.js";
import { clearLocalStorage } from "../../App.jsx";

const WriteChat = ({ setShowConfirmation, setSelectedFile, selectedFile, showConfirmation, user, selectedFriend, uuidv4, isJob, job }) => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [message, setMessage] = useState("");
    const [seconds, setSeconds] = useState(0);

    const recorderControls = useAudioRecorder();

    const [memberData, setMemberData] = useState([]);

    useEffect(() => {
        if (recorderControls.recordingTime > 0) {
          setSeconds(recorderControls.recordingTime)
        }
    }, [recorderControls]);

    useEffect(() => {
        fetchMembers(job);
    }, [job]);

    const fetchMembers = async (jobTitle) => {
        if (isJob) {
            try {
                const response = await axiosInstance.get(JOBS_API + `/members?jobTitle=${jobTitle}&user=${user}`);
                setMemberData(response.data.map(item => item.email).filter(email => email !== user));
            } catch (error) {
                if (error.response.status == 401) {
                    clearLocalStorage();
                    navigate(LOGIN_PATH);
                }
                console.error("Error getting members: " + error);
            }
        }
    };
    
    const getLastMessagesSender = async () => {    
        const senderQuery = getLast(user, selectedFriend?.email, isJob, job);
    
        const [senderSnapshot] = await Promise.all([
            getDocsSender(senderQuery),
        ]);
    
        const senderMessage = senderSnapshot.empty ? null : senderSnapshot.docs[senderSnapshot.docs.length - 1].data();

        const lastMessage = 
            (!senderMessage) ? t('chat.startConversation') : senderMessage
        ;

        if (lastMessage) {
            return lastMessage;
        }
    };

    const sendMessage = async () => {
        if (message.trim() === "" || (!selectedFriend && !isJob)) {
            return;
        }
    
        const randomUid = uuidv4();
        const sender = await getLastMessagesSender();

        if (sender == t('chat.startConversation')) {
            if (!isJob)
                await axiosInstance.post(NOTIFICATIONS_API + `/push`, {
                    type: "CONVERSATION",
                    receiver: selectedFriend.email,
                    sender: user,
                    read: false,
                    hidden: false,
                    date: new Date(),
                });
            else 
                await axiosInstance.post(NOTIFICATIONS_API + `/push`, {
                    type: "CONVERSATION_JOB",
                    receiver: job,
                    sender: user,
                    read: false,
                    hidden: false,
                    date: new Date(),
                });
        }

        await sendMessageToBd(message, user, selectedFriend, randomUid, isJob, job);
        if (isJob) {
            memberData.forEach(email => {
                sendMessageToUser(email, user, isJob, job);
            });
        } else {
            sendMessageToUser(selectedFriend.email, user);
        }
        setMessage("");
    };

    const addAudioElement = (blob) => {
        uploadAudio(user, uuidv4(), blob, selectedFriend, seconds-1, isJob, job);
        if (isJob) {
            memberData.forEach(email => {
                sendMessageToUser(email, user, isJob, job);
            });
        } else {
            sendMessageToUser(selectedFriend.email, user);
        }
    };

    const handleAttachFile = (event) => {
        const file = event.target.files[0];
        if (file) {
            handleFileSelection(file);
        }
    };

    const handleFileSelection = (file) => {
        setSelectedFile(file);
        setShowConfirmation(true);
    };

    const handleKeyDown = (event) => {
        if (event.key === 'Enter') {
            event.preventDefault(); 
            sendMessage(); 
        }
    };
    
    const handleCloseConfirmation = () => {
        setSelectedFile(null);
        setShowConfirmation(false);
    };

    const handleConfirmUpload = async () => {
        setShowConfirmation(false);
        if (selectedFile) {
            await uploadFile(user, selectedFile, selectedFriend, uuidv4, isJob, job);
            if (isJob) {
                memberData.forEach(email => {
                    sendMessageToUser(email, user, isJob, job);
                });
            } else {
                sendMessageToUser(selectedFriend.email, user);
            }
        }
    };

    return (
        <>
        <TextField
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={!recorderControls.isRecording ? t('chat.write') : ""}
            variant="outlined"
            fullWidth
            InputProps={{
                startAdornment: !recorderControls.isRecording && (
                    <>
                        <input
                            type="file"
                            id="fileInput"
                            style={{ display: 'none' }}
                            onChange={handleAttachFile}
                        />
                        <Tooltip title={t('chat.upload')}>
                            <IconButton onClick={() => document.getElementById('fileInput').click()}>
                                <AttachFileIcon />
                            </IconButton>
                        </Tooltip>
                    </>
                ),
                endAdornment: (
                    <>
                        {!recorderControls.isRecording && (
                            <Tooltip title={t('chat.send')}>
                                <IconButton onClick={sendMessage}>
                                    <SendIcon />
                                </IconButton>
                            </Tooltip>
                        )}
                        <div>
                            <AudioRecorder 
                                onRecordingComplete={addAudioElement}
                                recorderControls={recorderControls}
                                audioTrackConstraints={{
                                    noiseSuppression: true,
                                    echoCancellation: true,
                                }} 
                                downloadOnSavePress={false}
                                downloadFileExtension="mp3"
                            /> 
                        </div>
                        
                    </>
                ),
            }}
            />
            <Dialog open={showConfirmation} onClose={handleCloseConfirmation}>
                <DialogTitle style={{ color: 'black', textAlign: 'center' }}>{t('chat.confirm_up')}</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        {t('chat.sure_file')}<strong>{selectedFile && selectedFile.name}</strong>?
                    </DialogContentText>
                </DialogContent>
                <DialogActions style={{ paddingRight: '1.7rem', paddingBottom: '1.5rem', justifyContent: 'flex-end' }}>
                    <Button variant="outlined" color="primary" onClick={handleCloseConfirmation}>{t('home_view.cancel')}</Button>
                    <Button variant="contained" color="primary" onClick={handleConfirmUpload} style={{ marginRight: '10px' }}>{t('chat.up')}</Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

WriteChat.propTypes = {
    setShowConfirmation: PropTypes.func.isRequired,
    setSelectedFile: PropTypes.func.isRequired,
    selectedFile: PropTypes.object,
    showConfirmation: PropTypes.bool.isRequired,
    user: PropTypes.string.isRequired,
    selectedFriend: PropTypes.object,
    uuidv4: PropTypes.func.isRequired,
    isJob: PropTypes.bool,
    job: PropTypes.string
};

export default WriteChat;
