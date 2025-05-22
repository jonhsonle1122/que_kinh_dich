import { sendPushNotification } from "../lib/fcm.js";
import FcmToken from "../models/FcmToken.js";

export const saveFcmToken = async (req, res) => {
  try {
    const { userId, deviceId, fcmToken } = req.body;

    if (!userId || !deviceId || !fcmToken) {
      return res.error("Missing required fields", 400, 400);
    }

    const filter = { userId, deviceId };
    const update = { fcmToken, updatedAt: new Date() };
    const options = { upsert: true, new: true };

    const tokenRecord = await FcmToken.findOneAndUpdate(
      filter,
      update,
      options
    );
    return res.success("FCM token saved");
  } catch (error) {
    console.error("Error saving FCM token:", error);
    return res.error("Server error", 500, 500);
  }
};
export const sendNotification = async (req, res) => {
  try {
    const user = req.user; // user đã được xác thực qua middleware auth
    const { title, body, data } = req.body;

    if (!title || !body) {
      return res.error("Missing title or body", 400, 400);
    }

    // Tìm tất cả FCM token của user (mỗi thiết bị có thể 1 token)
    const tokens = await FcmToken.find({ userId: user.id });

    if (!tokens.length) {
      return res.error("No FCM tokens found for user", 404, 404);
    }

    // Gửi noti đến tất cả token của user
    for (const tokenDoc of tokens) {
      await sendPushNotification(tokenDoc.fcmToken, title, body, data);
    }

    return res.success("Notification sent to user devices");
  } catch (error) {
    console.error("Error sending notification:", error);
    return res.error("Internal server error", 500, 500);
  }
};
