

import { ZegoUIKitPrebuilt } from '@zegocloud/zego-uikit-prebuilt';
import { ZIM } from 'zego-zim-web';
import axiosInstance from './axios';
import { CALLS_API, NOTIFICATIONS_API, TOKEN_API } from '../routes/api-routes';

let zp;

const APP_ID = import.meta.env.VITE_ZEGOCLOUD_APP_ID;
const SECRET_KEY = import.meta.env.VITE_ZEGOCLOUD_SECRET_KEY;

async function generateZegoToken(userID) {
    const tokenRequest = {
        appId: APP_ID, 
        userId: userID,
        secret: SECRET_KEY, 
        effectiveTimeInSeconds: 3600, 
        payload: 'payload_' + userID
    };

    try {
        const response = await axiosInstance.post(TOKEN_API, tokenRequest);
        return response.data;
    } catch (error) {
        return null;
    }
}

function calculateDate(date1, date2) {
    const tiempo1 = date1.getTime();
    const tiempo2 = date2.getTime();

    const diferenciaMilisegundos = tiempo2 - tiempo1;

    const milisegundosPorDia = 1000 * 60 * 60 * 24;
    const milisegundosPorHora = 1000 * 60 * 60;
    const milisegundosPorMinuto = 1000 * 60;
    const milisegundosPorSegundo = 1000;

    const horas = Math.floor((diferenciaMilisegundos % milisegundosPorDia) / milisegundosPorHora);
    const minutos = Math.floor((diferenciaMilisegundos % milisegundosPorHora) / milisegundosPorMinuto);
    const segundos = Math.floor((diferenciaMilisegundos % milisegundosPorMinuto) / milisegundosPorSegundo);

    return `${horas}:${minutos}:${segundos}`;
}


export async function init() {
    const userID = localStorage.getItem('userEmail');
    const userName = userID;

    const token = await generateZegoToken(userID);
    localStorage.removeItem('tokenZegoCloud');
    localStorage.setItem('tokenZegoCloud', token);

    const KitToken = ZegoUIKitPrebuilt.generateKitTokenForProduction(
        APP_ID,
        localStorage.getItem('tokenZegoCloud'),
        null,
        userID,
        userName
    );
    
    zp = ZegoUIKitPrebuilt.create(KitToken);

    zp.addPlugins({ ZIM }); 
}

export function handleSend(type, calleeEmails, isJob, job) {    
    if (!calleeEmails || calleeEmails.length === 0) {
        alert('Email cannot be blank or empty');
        return;
    }
    
    const callType = type !== "call" ? ZegoUIKitPrebuilt.InvitationTypeVideoCall : ZegoUIKitPrebuilt.InvitationTypeVoiceCall;
    
    const callees = calleeEmails.map(calle => ({ userID: calle.email, userName: calle.email }));

    let callId;
    let users = [];
    const startDate = new Date();

    zp.sendCallInvitation({
        callees: callees,
        callType: callType,
        timeout: 60
    })

    zp.setCallInvitationConfig({
        ringtoneConfig: {
            incomingCallUrl: '/soundCall.mp3',
            outgoingCallUrl: '/soundPhone.mp3'
        },
        onCallInvitationEnded: async (reason) => {
            if (calleeEmails.length > 1 && calleeEmails.length !== users.length) {
                callees.forEach(async (callee) => {
                    if (users.includes(callee.userID) === false)
                        await axiosInstance.post(NOTIFICATIONS_API + `/push`, {
                            type: type === "call" ? "CALL" : "VIDEOCALL",
                            receiver: callee.userName,
                            sender: callId.substring(callId.indexOf('_') + 1, callId.lastIndexOf('_')),
                            read: false,
                            hidden: false,
                            date: new Date(),
                            titleTeam: isJob ? job : ""
                        });
                });
            } else if (calleeEmails.length == 1 && reason === "LeaveRoom") {
                await axiosInstance.post(CALLS_API, {
                    firstName: "",
                    lastName: "",
                    userCall: callId.substring(callId.indexOf('_') + 1, callId.lastIndexOf('_')),
                    type: "outgoing",
                    duration: calculateDate(startDate, new Date()),
                    date: new Date(),
                    callType: type,
                    userCalled: callees[0].userName
                });
                await axiosInstance.post(CALLS_API, {
                    firstName: "",
                    lastName: "",
                    userCall: callees[0].userName,
                    type: "incoming",
                    duration: calculateDate(startDate, new Date()),
                    date: new Date(),
                    callType: type,
                    userCalled: callId.substring(callId.indexOf('_') + 1, callId.lastIndexOf('_'))
                });
            }
        },
        onOutgoingCallAccepted: async (callID, callee) => {  
            callId = callID;
            users.push(callee.userID); 
        },
        onOutgoingCallDeclined: async (callID, callee) => {
            callId = callID;
            await axiosInstance.post(NOTIFICATIONS_API + `/push`, {
                type: type === "call" ? "CALL" : "VIDEOCALL",
                receiver: callee.userName,
                sender: callID.substring(callID.indexOf('_') + 1, callID.lastIndexOf('_')),
                read: false,
                hidden: false,
                date: new Date(),
                titleTeam: isJob ? job : ""
            });
            if (calleeEmails.length == 1) {
                await axiosInstance.post(CALLS_API, {
                    firstName: "",
                    lastName: "",
                    userCall: callID.substring(callID.indexOf('_') + 1, callID.lastIndexOf('_')),
                    type: "miss",
                    duration: "",
                    date: new Date(),
                    callType: type,
                    userCalled: callees[0].userName
                });
                await axiosInstance.post(CALLS_API, {
                    firstName: "",
                    lastName: "",
                    userCall: callees[0].userName,
                    type: "cancel",
                    duration: "",
                    date: new Date(),
                    callType: type,
                    userCalled: callID.substring(callID.indexOf('_') + 1, callID.lastIndexOf('_'))
                });
            }
        },
        onOutgoingCallTimeout: async (callID, callees) => {
            callId = callID;
            callees.forEach(async (callee) => {
                await axiosInstance.post(NOTIFICATIONS_API + `/push`, {
                    type: type === "call" ? "CALL" : "VIDEOCALL",
                    receiver: callee.userName,
                    sender: callID.substring(callID.indexOf('_') + 1, callID.lastIndexOf('_')),
                    read: false,
                    hidden: false,
                    date: new Date(),
                    titleTeam: isJob ? job : ""
                });
            });            
            if (calleeEmails.length == 1) {
                await axiosInstance.post(CALLS_API, {
                    firstName: "",
                    lastName: "",
                    userCall: callID.substring(callID.indexOf('_') + 1, callID.lastIndexOf('_')),
                    type: "miss",
                    duration: "",
                    date: new Date(),
                    callType: type,
                    userCalled: callees[0].userName
                });
                await axiosInstance.post(CALLS_API, {
                    firstName: "",
                    lastName: "",
                    userCall: callees[0].userName,
                    type: "cancel",
                    duration: "",
                    date: new Date(),
                    callType: type,
                    userCalled: callID.substring(callID.indexOf('_') + 1, callID.lastIndexOf('_'))
                });
            }
        }
    });
}
  