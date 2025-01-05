import React, { useEffect, useRef, useState } from "react";
import { Grid, Paper, Tooltip } from "@mui/material";
import { v4 as uuidv4 } from 'uuid';
import { useTranslation } from 'react-i18next';
import { loadGroupMessagesFromBD, markJobDoc } from "../../services/firebase.js";
import VisibilityIcon from '@mui/icons-material/Visibility';
import PropTypes from 'prop-types';
import WriteChat from "../messages/WriteChat.jsx";
import JobTopBar from "./JobTopBar.jsx";
import Message, { formatTime } from "../messages/Message.jsx";

const JobChatBox = ( { job } ) => {
  const user = localStorage.getItem('userEmail');
  const { t, i18n } = useTranslation();
  const SeenIcon = VisibilityIcon;
  const scroll = useRef();

  const [showConfirmation, setShowConfirmation] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  const [messages, setMessages] = useState([]);
  
  const [scrollPosition, setScrollPosition] = useState(0);

  const [prevMessagesLength, setPrevMessagesLength] = useState(0);

  const messagesContainer = useRef(); 

  useEffect(() => {
    if (messages.length > prevMessagesLength) {
      messagesContainer.current.scrollTop = messagesContainer.current.scrollHeight;
    } else if (messages.length < prevMessagesLength) {
      messagesContainer.current.scrollTop = scrollPosition;
    }

    setPrevMessagesLength(messages.length);
  }, [messages.length, prevMessagesLength, scrollPosition]);
  
  useEffect(() => {
    const unsubscribe = loadMessages();

    return () => unsubscribe();
  }, []);

  const loadMessages = () => {
    return loadGroupMessagesFromBD(user, setMessages, scroll, job);
  };

  const saveScrollPosition = () => {
    const currentPosition = messagesContainer.current.scrollTop;
    setScrollPosition(currentPosition);
  };

  const restoreScrollPosition = () => {
    messagesContainer.current.scrollTop = scrollPosition;
  };

  const getSeenTooltip = (message) => {
    const seenByEntries = message.seenAt ? Object.entries(message.seenAt) : [];
  
    const seenDetails = seenByEntries.map(([username, timestamp]) => {
      const time = formatTime(timestamp, i18n);
      return `${username} (${time})`;
    });
  
    return t("chat.seen") + ": " + seenDetails.join(", ");
  };
  
  return (
    <Grid container spacing={3} style={{ width: '90vw', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
      <Grid item xs={11}>
        {job && (
          <>
            <Paper style={{ padding: "20px", marginBottom: "20px" }}>
              <JobTopBar job={job} />
            </Paper>
            <Paper style={{ height: "50vh", marginBottom: "20px", overflowY: "auto" }} ref={messagesContainer}>
              <main className="chat-box" style={{ maxHeight: "70vh" }}>
                <div className="messages-wrapper">
                  {messages?.map((message, index) => (
                    <React.Fragment key={message.id}>
                      <Message message={message} sender={message.sender} saveScrollPosition={saveScrollPosition} restoreScrollPosition={restoreScrollPosition} isJob={true}/>
                      {index === messages.length - 1 && message.isCurrentUser && (
                        <div style={{ textAlign: "right", marginRight: '15px', marginBottom: '10px' }}>
                          {message.seenAt === undefined ? (
                            <Tooltip title={t('chat.sent')}>
                              <span style={{ fontSize: 20 }}>✓✓</span>
                            </Tooltip>
                          ) : (
                            <Tooltip title={getSeenTooltip(message)}>
                              {message.seenAt && <SeenIcon />} {Object.keys(message.seenAt).length}
                            </Tooltip>
                          )}
                        </div>
                      )}
                    </React.Fragment>
                  ))}
                  <span ref={scroll}></span>
                </div>
              </main>
            </Paper>
            <div style={{ overflowY: "auto" }}>
              <WriteChat 
                setShowConfirmation={setShowConfirmation}
                setSelectedFile={setSelectedFile}
                selectedFile={selectedFile}
                showConfirmation={showConfirmation}
                user={user}
                uuidv4={uuidv4}
                isJob={true}
                job={job}
              />
            </div>
          </>
        )}
      </Grid>
    </Grid>
  );
};

export default JobChatBox;

JobChatBox.propTypes = {
  job: PropTypes.string.isRequired
};

export function loadAllJob(querySnapshot, user, setMessages, scroll) {
  const fetchedMessages = [];

  querySnapshot.forEach((doc) => {
    const messageData = doc.data();
    if (!messageData) {
      return;
    }

    const isSentByUser = messageData.sender === user;

    if (!(isSentByUser && messageData.isDeleted)) {
      fetchedMessages.push({ ...messageData, isCurrentUser: isSentByUser });
    }
    
  });

  const sortedMessages = fetchedMessages.sort((a, b) => a.createdAt - b.createdAt);
  markJobDoc(querySnapshot, user);
  setMessages(sortedMessages);
  scroll.current.scrollIntoView({ behavior: "smooth" });
}