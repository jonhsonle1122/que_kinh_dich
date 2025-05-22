import admin from "./firebase.js";
export const sendPushNotification = async (
  deviceToken,
  title,
  body,
  data = {}
) => {
  const message = {
    token: deviceToken,
    notification: {
      title,
      body,
    },
    data, // Optional: bạn có thể truyền thêm dữ liệu (key-value)
    android: {
      priority: "high",
    },
    apns: {
      payload: {
        aps: {
          sound: "default",
          badge: 1,
        },
      },
    },
  };

  try {
    const response = await admin.messaging().send(message);
    // console.log("Successfully sent message:", response);
  } catch (error) {
    console.error("Error sending message:", error);
  }
};
