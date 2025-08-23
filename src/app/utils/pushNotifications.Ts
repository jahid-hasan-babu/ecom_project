import admin from "../lib/firebaseAdmin";
const sendSinglePushNotification = async (payload: {
    body: any;
    fcmToken: string

}) => {
  const message = {
    notification: {
      title: payload.body.title,
      body: payload.body.body,
    },
    token: payload.fcmToken,
  };
   const response = await admin.messaging().send(message);
return response;
};

export const firebasePushNotificationServices = {
sendSinglePushNotification
}