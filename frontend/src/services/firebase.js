import { initializeApp } from "https://www.gstatic.com/firebasejs/9.1.1/firebase-app.js";
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject, listAll, getMetadata } from "https://www.gstatic.com/firebasejs/9.1.1/firebase-storage.js";
import { getFirestore, updateDoc, getDocs, query, collection, where, orderBy, limit, onSnapshot, addDoc, serverTimestamp, deleteDoc } from "https://www.gstatic.com/firebasejs/9.1.1/firebase-firestore.js";
import { getDatabase, ref as databaseRef, push, set, query as queryDatabase, onValue, orderByChild, equalTo, remove } from "https://www.gstatic.com/firebasejs/9.1.1/firebase-database.js";
import { AUDIOS_PATH, FILES_PATH, IMAGES_PATH } from "../routes/app-routes";
import { loadAll } from "../components/chat/ChatBox";
import { loadAllJob } from "../components/jobs/JobChatBox";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
}

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

export const uploadImageToStorage = async (file, name) => {
  const storage = getStorage();

  const storageRef = ref(storage, IMAGES_PATH + `/image_account_${name}`);

  try {
    await uploadBytes(storageRef, file);
  } catch (error) {
    console.error("Error uploading image:", error);
  }
}

export const uploadFileToStorage = async (file, title, isCalendar) => {
  const storage = getStorage();

  const storageRef = ref(storage, isCalendar ? (FILES_PATH + `/events/${title}/${file.name}`) : (FILES_PATH + `/tasks/${title}/${file.name}`));

  try {
    await uploadBytes(storageRef, file);
  } catch (error) {
    console.error("Error uploading file:", error);
  }
}

export const checkImageExists = async (name) => {
  const storage = getStorage();
  const storageRef = ref(storage, IMAGES_PATH + `/image_account_${name}`);

  try {
    const url = await getDownloadURL(storageRef);
    return url;
  } catch (error) {
    return null;
  }
}

export const getFileDownloadURL = async (userEmail, fileName, isCalendar) => {
  const storage = getStorage();
  
  const filePath = isCalendar ? `${FILES_PATH}/events/${userEmail}/${fileName}` : `${FILES_PATH}/tasks/${userEmail}/${fileName}`;
  
  const fileRef = ref(storage, filePath);

  try {
    const downloadURL = await getDownloadURL(fileRef);
    return downloadURL;
  } catch (error) {
    console.error("Error get download url:", error);
  }
}

export const deleteImageFromStorage = async (name) => {
  const storage = getStorage();
  const storageRef = ref(storage, IMAGES_PATH + `/image_account_${name}`);

  try {
    await deleteObject(storageRef);
  } catch (error) {
    console.error("Error deleting image:", error);
  }
}

export const deleteFileFromStorage = async (userEmail, fileName, isCalendar) => {
  const storage = getStorage();

  const filePath = isCalendar ? `${FILES_PATH}/events/${userEmail}/${fileName}` : `${FILES_PATH}/tasks/${userEmail}/${fileName}`;

  const storageRef = ref(storage, filePath);

  try {
    await deleteObject(storageRef);
  } catch (error) {
    console.error("Error deleting file:", error);
  }
}

export const deleteMessagesFromStorage = async (userEmail, isJob) => {
  try { 
    const querySnapshot = await getQuerySnapShotByUser(userEmail, isJob);

    querySnapshot.forEach(async (doc) => {
      try {
        await deleteDoc(doc.ref);
      } catch (error) {
        console.error('Error deleting message:', error);
      }
    });
  } catch (error) {
    console.error('Error getting messages:', error);
  }
}

export const deleteMessagesFromGroupStorage = async (title) => {
  try { 
    const querySnapshot = await getQuerySnapShotByJob(title);

    querySnapshot.forEach(async (doc) => {
      try {
        await deleteDoc(doc.ref);
      } catch (error) {
        console.error('Error deleting message group:', error);
      }
    });
  } catch (error) {
    console.error('Error getting messages group:', error);
  }
}

export async function deleteFilesFromStorage(userEmail) {
  await deleteFolder(getStorage(), AUDIOS_PATH + `/messages/${userEmail}`);
  await deleteFolder(getStorage(), FILES_PATH + `/messages/${userEmail}`);
}
export async function deleteFilesFromGroupStorage(title) {
  await deleteFolder(getStorage(), AUDIOS_PATH + `/messagesJob/${title}`);
  await deleteFolder(getStorage(), FILES_PATH + `/messagesJob/${title}`);
  await deleteFolder(getStorage(), FILES_PATH + `/tasks/${title}`);
  await deleteFolder(getStorage(), FILES_PATH + `/events/${title}`);
}

async function deleteFolder(storage, path) {
  const listRef = ref(storage, path);
  try {
    const listResult = await listAll(listRef);
    const promises = listResult.items.map(async (item) => {
      await deleteObject(item);
    });
    await Promise.all(promises);
    if (listResult.prefixes.length > 0) {
      await Promise.all(listResult.prefixes.map(async (prefix) => {
        await deleteFolder(storage, prefix.fullPath);
      }));
    }
  } catch (error) {
    console.error("Error deleting folder:", error);
  }
}

export async function deleteForMe(querySnapshot, user) {
  await Promise.all(querySnapshot.docs.map(async (doc) => {
    const messageData = doc.data();
    if (messageData.sender === user) {
      await updateDoc(doc.ref, { isDeleted: true });
    }
  }));
}

export async function deleteAudio(user, uid, isJob, job) {
  const storage = getStorage();
  const fileRef = ref(storage, AUDIOS_PATH + (isJob ? "/messagesJob" : "/messages") + `/${isJob ? job : user}/${uid}.mp3`);

  await deleteObject(fileRef);
}

export async function deleteFile(user, fileName, isJob, job) {
  const storage = getStorage();
  const PATH = isJob ? '/messagesJob/' + job + "/" + fileName : '/messages/' + user + "/" + fileName;
  const fileRef = ref(storage, FILES_PATH + PATH);

  await deleteObject(fileRef);
}

export async function deleteDocs(senderQuerySnapshot) {
  await Promise.all(senderQuerySnapshot.docs.map(async (doc) => {
    await deleteDoc(doc.ref);
  }));
}

export async function getQuerySnapShot(uid, isJob) {
  return await getDocs(query(collection(db, isJob ? "messagesJob" : "messages"), where("uid", "==", uid)));
}

export async function getQuerySnapShotByUser(user, isJob) {
  return await getDocs(query(collection(db, isJob ? "messagesJob" : "messages"), where("sender", "==", user)));
}
export async function getQuerySnapShotByJob(job) {
  return await getDocs(query(collection(db, "messagesJob"), where("receiver", "==", job)));
}

export function getDocsReceiver(receiverQuery) {
  return getDocs(receiverQuery);
}

export function getDocsSender(senderQuery) {
  return getDocs(senderQuery);
}

export function getReceiver(contact, user) {
  return query(collection(db, 'messages'),
    where('sender', '==', contact.email),
    where('receiver', '==', user),
    orderBy('createdAt', 'desc'),
    limit(1)
  );
}

export function getLast(user, friend, isJob, job) {
  return query(collection(db, isJob ? 'messagesJob' : 'messages'),
    where('sender', '==', user),
    where('receiver', '==', isJob ? job : friend),
    orderBy('createdAt', 'desc'),
    limit(1)
  );
}

export function getLastMessageJob(user, job) {
  return query(collection(db, 'messagesJob'),
    where('receiver', '==', job),
    where('sender', '!=', user), 
    orderBy('sender'),
    orderBy('createdAt', 'desc'),
    limit(1)
  );
}

export function getSender(user, contact) {
  return query(collection(db, 'messages'),
    where('sender', '==', user),
    where('receiver', '==', contact.email),
    where('isDeleted', '==', false),
    orderBy('createdAt', 'desc'),
    limit(1)
  );
}

export async function updateDocs(senderQuerySnapshot, user) {
  await Promise.all(senderQuerySnapshot.docs.map(async (doc) => {
    const messageData = doc.data();
    if (messageData.sender === user) {
      await updateDoc(doc.ref, { isDeleted: true });
    }
  }));
}

export async function getQuerySnapShotByEmail(user, contactEmail, isJob, job) {
  return await getDocs(query(collection(db, isJob ? 'messagesJob' : 'messages'),
    where('sender', '==', user),
    where('receiver', '==', isJob ? job : contactEmail)
  ));
}

export async function sendMessageToBd(message, user, selectedFriend, randomUid, isJob, job) {
  await addDoc(collection(db, isJob ? 'messagesJob' : 'messages'), {
    text: message,
    sender: user,
    receiver: isJob ? job : selectedFriend.email,
    createdAt: serverTimestamp(),
    uid: randomUid,
    seenByRecipient: false,
    isDeleted: false
  });
}

export async function markDoc(querySnapshot, user) {
  await Promise.all(querySnapshot.docs.map(async (doc) => {
    const messageData = doc.data();
    if (messageData.receiver === user && messageData.seenByRecipient == false) {
      await updateDoc(doc.ref, { seenByRecipient: true, seenAt: new Date().toString() });
    }
  }));
}

export async function markJobDoc(querySnapshot, user) {
  await Promise.all(querySnapshot.docs.map(async (doc) => {
    const messageData = doc.data();
    const timestamp = new Date().toString();

    if ((!messageData.seenAt || !messageData.seenAt[user]) && messageData.sender != user) {
      await updateDoc(doc.ref, { [`seenAt.${user.split("@")[0]}`]: timestamp } );
    }
    
  }));
}

export function loadMessageByUsers(user, friend, isJob, job) {
  return query(
    collection(db, isJob ? 'messagesJob' : 'messages'),
    where('sender', '==', user),
    where('receiver', '==', isJob ? job : friend.email),
    orderBy('createdAt', 'desc'),
    limit(1)
  );
}

export async function uploadFile(user, file, selectedFriend, uuidv4, isJob, job) {
  const storage = getStorage();
  
  const PATH = isJob ? '/messagesJob/' + job + "/" + file.name : '/messages/' + user + "/" + file.name;

  const fileRef = ref(storage, FILES_PATH + PATH);
  await uploadBytes(fileRef, file);
  const downloadURL = await getDownloadURL(fileRef);

  await addDoc(collection(db, isJob ? 'messagesJob' : 'messages'), {
    fileURL: downloadURL,
    fileName: file.name,
    createdAt: serverTimestamp(),
    sender: user,
    receiver: isJob ? job : selectedFriend.email,
    uid: uuidv4(),
    seenByRecipient: false,
    isDeleted: false
  });
}

export async function uploadFileJob(file, job) {
  const storage = getStorage();
  
  const PATH = '/messagesJob/' + job + "/" + file.name;

  const fileRef = ref(storage, FILES_PATH + PATH);
  await uploadBytes(fileRef, file);
}

export async function uploadAudio(user, id, blob, selectedFriend, audioDuration, isJob, job) {
  const storage = getStorage();

  const PATH = isJob ? '/messagesJob/' + job + "/" + id + ".mp3" : '/messages/' + user + "/" + id + ".mp3";

  const audioRef = ref(storage, AUDIOS_PATH + PATH);

  try {
    await uploadBytes(audioRef, blob, { contentType: 'audio/mp3' });
    const downloadURL = await getDownloadURL(audioRef);

    await addDoc(collection(db, isJob ? 'messagesJob' : 'messages'), {
      audioURL: downloadURL,
      createdAt: serverTimestamp(),
      sender: user,
      receiver: isJob ? job : selectedFriend.email,
      duration: audioDuration,
      uid: id,
      seenByRecipient: false,
      isDeleted: false
    });
  } catch (error) {
    console.error("Error uploading audio:", error);
  }
}

export async function getAudioDownloadURL(user, uid, isJob, job) {
  const storage = getStorage();

  const PATH = isJob ? '/messagesJob/' + job + "/" + uid + ".mp3" : '/messages/' + user + "/" + uid + ".mp3";

  const audioRef = ref(storage, AUDIOS_PATH + PATH);

  try {
    const downloadURL = await getDownloadURL(audioRef);
    return downloadURL;
  } catch (error) {
    console.error("Error getting audio download URL:", error);
  }
}

export function loadMessagesFromBD(user, friend, setMessages, scroll) {
  const q = query(
    collection(db, 'messages'),
    orderBy("createdAt", "desc"),
    limit(50)
  );

  return onSnapshot(q, (querySnapshot) => {
    loadAll(querySnapshot, user, friend, setMessages, scroll);
  });
}

export function loadGroupMessagesFromBD(user, setMessages, scroll, job) {
  const q = query(
    collection(db, 'messagesJob'),
    where('receiver', '==', job),
    orderBy("createdAt", "desc"),
    limit(50)
  );

  return onSnapshot(q, (querySnapshot) => {
    loadAllJob(querySnapshot, user, setMessages, scroll);
  });
}

export async function deleteMessage(uid, isJob) {
  try {
    const q = query(collection(db, isJob ? 'messagesJob' : 'messages'), where("uid", "==", uid));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      querySnapshot.forEach(async (doc) => {
        await deleteDoc(doc.ref);
      });
    }

  } catch (error) {
    console.error("Error delete message for all:", error);
  }
}

export async function listFilesInFolder(job) {
  const storage = getStorage();
  const folderPath = FILES_PATH + '/messagesJob/' + job;  
  const folderRef = ref(storage, folderPath);

  try {
    const listResult = await listAll(folderRef);
    const filesInfo = await Promise.all(listResult.items.map(async (item) => {
      const metadata = await getMetadata(item);
      const downloadURL = await getDownloadURL(item);
      
      return {
        name: item.name,
        size: metadata.size,
        timeCreated: metadata.timeCreated,
        downloadURL: downloadURL,
        mimeType: metadata.contentType
      }
      }));
    return filesInfo;
  } catch (error) {
    console.error("Error listing files in folder:", error);
    return [];
  }
}

export function sendMessageToUser(friend, user, isJob, job) {
  const database = getDatabase();
  const messagesRef = databaseRef(database, 'messages');
  const newMessageRef = push(messagesRef);

  set(newMessageRef, {
    friend: friend,
    user: isJob ? job : user
  }).catch((error) => {
    console.error('Error to send message:', error);
  });
}

export function listenForNotifications(user, setMessages) {
  const db = getDatabase();
  const userRef = queryDatabase(databaseRef(db, 'messages'), orderByChild('friend'), equalTo(user));
  const unsubscribe = onValue(userRef, async (snapshot) => {
    const data = snapshot.val();
    if (data) {
      const dataArray = Object.values(data);
      const lastMessage = dataArray[dataArray.length - 1];
      const userSend = lastMessage.user;

      const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      
      if (regex.test(userSend)) {
        const senderQuery = getLast(lastMessage.user, user);
    
        const [senderSnapshot] = await Promise.all([
          getDocsSender(senderQuery),
        ]);
    
        const senderMessage = senderSnapshot.empty ? null : senderSnapshot.docs[senderSnapshot.docs.length - 1].data();

        if (!senderMessage?.seenByRecipient && userSend != undefined) {
          setMessages({
            dataArray: dataArray.length,
            user: userSend
          });
        }
      } else {
        const query = getLastMessageJob(user, lastMessage.user);

        const [querySnapshot] = await Promise.all([
          getDocsSender(query)
        ]);

        const senderMessage = querySnapshot.empty ? null : querySnapshot.docs[0].data();

        if ((senderMessage?.seenAt === undefined || senderMessage?.seenAt[user.split("@")[0]] === undefined) && userSend !== undefined) {
          setMessages({
            dataArray: dataArray.length,
            user: userSend
          });
        }
      }
    }
  });

  return unsubscribe;
}

export const removeNotificationsByUser = (user, isSender) => {
  const db = getDatabase();
  const userRef = queryDatabase(databaseRef(db, 'messages'), orderByChild(isSender ? 'user' : 'friend'), equalTo(user));

  return remove(userRef)
    .catch((error) => {
      console.error("Error remove notifications:", error);
  });
};
