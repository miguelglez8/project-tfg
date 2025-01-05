import React, { useEffect, useRef, useState } from "react";
import Message, { formatTime } from "../messages/Message.jsx";
import FriendsList from "./FriendsList.jsx";
import { Grid, Paper, Tooltip } from "@mui/material";
import { v4 as uuidv4 } from "uuid";
import { useTranslation } from "react-i18next";
import {
  loadMessagesFromBD,
  markDoc,
} from "../../services/firebase";
import VisibilityIcon from "@mui/icons-material/Visibility";
import TopBar from "./TopBar.jsx";
import WriteChat from "../messages/WriteChat.jsx";

const ChatBox = () => {
  const user = localStorage.getItem("userEmail");
  const { t, i18n } = useTranslation();
  const SeenIcon = VisibilityIcon;
  const scroll = useRef();

  const [showConfirmation, setShowConfirmation] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  const [messages, setMessages] = useState([]);
  const [selectedFriend, setSelectedFriend] = useState(null);
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
    const unsubscribe = selectedFriend
      ? loadMessages(selectedFriend)
      : () => {};

    return () => unsubscribe();
  }, [selectedFriend]);

  const loadMessages = (friend) => {
    return loadMessagesFromBD(user, friend, setMessages, scroll);
  };

  const handleSendMessage = (friend) => {
    setSelectedFriend(friend);
  };

  const saveScrollPosition = () => {
    const currentPosition = messagesContainer.current.scrollTop;
    setScrollPosition(currentPosition);
  };

  const restoreScrollPosition = () => {
    messagesContainer.current.scrollTop = scrollPosition;
  };

  return (
    <Grid
      container
      spacing={3}
      style={{ marginTop: "-5px", marginLeft: "10px" }}
      alignItems="flex-start"
    >
      <Grid item xs={12} md={5}>
        <FriendsList handleSendMessage={handleSendMessage} />
      </Grid>
      <Grid item xs={12} md={7}>
        {selectedFriend && (
          <>
            <Paper style={{ padding: "20px", marginBottom: "20px" }}>
              <TopBar selectedFriend={selectedFriend} />
            </Paper>
            <Paper
              style={{
                height: "60vh",
                marginBottom: "20px",
                overflowY: "auto",
              }}
              ref={messagesContainer}
            >
              <main className="chat-box" style={{ maxHeight: "70vh" }}>
                <div className="messages-wrapper">
                  {messages?.map((message, index) => (
                    <React.Fragment key={message.id}>
                      <Message
                        message={message}
                        sender={message.sender}
                        saveScrollPosition={saveScrollPosition}
                        restoreScrollPosition={restoreScrollPosition}
                        isJob={false}
                      />
                      {index === messages.length - 1 &&
                        message.isCurrentUser && (
                          <div
                            style={{
                              textAlign: "right",
                              marginRight: "15px",
                              marginBottom: "10px",
                            }}
                          >
                            {message.seenByRecipient == false ? (
                              <Tooltip title={t("chat.sent")}>
                                <span style={{ fontSize: 20 }}>✓✓</span>
                              </Tooltip>
                            ) : (
                              <Tooltip title={t("chat.seen") + " " + formatTime(message.seenAt, i18n)}>
                                <SeenIcon />
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
                selectedFriend={selectedFriend}
                uuidv4={uuidv4}
                isJob={false}
              />
            </div>
          </>
        )}
      </Grid>
    </Grid>
  );
};

export default ChatBox;

export function loadAll(querySnapshot, user, friend, setMessages, scroll) {
  const fetchedMessages = [];

  querySnapshot.forEach((doc) => {
    const messageData = doc.data();
    if (!messageData) {
      return;
    }
    
    const isSentByUser = messageData.sender === user;
    const isReceivedByUser = messageData.receiver === user;
    const isSentByFriend = messageData.sender === friend.email;
    const isReceivedByFriend = messageData.receiver === friend.email;

    if (
      (isSentByUser && isReceivedByFriend) ||
      (isSentByFriend && isReceivedByUser)
    ) {
      if (!(isSentByUser && messageData.isDeleted)) {
        fetchedMessages.push({ ...messageData, isCurrentUser: isSentByUser });
      }
    }
  });

  const sortedMessages = fetchedMessages.sort(
    (a, b) => a.createdAt - b.createdAt
  );

  markDoc(querySnapshot, user);
  setMessages(sortedMessages);
  scroll.current.scrollIntoView({ behavior: "smooth" });
}
