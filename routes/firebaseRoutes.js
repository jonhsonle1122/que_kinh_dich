import { Router } from "express";
import {
  saveFcmToken,
  sendNotification,
} from "../controllers/firebaseController.js";
import { protectRoute } from "../middleware/protectRoute.js";
const router = Router();

/**
 * @swagger
 * /api/firebase/send-notification:
 *   post:
 *     summary: Gửi thông báo đẩy đến thiết bị thông qua Firebase Cloud Messaging
 *     tags:
 *       - Firebase Notification
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:

 *               - title
 *               - body
 *             properties:
 *               title:
 *                 type: string
 *                 description: Tiêu đề thông báo
 *                 example: "Thông báo mới"
 *               body:
 *                 type: string
 *                 description: Nội dung thông báo
 *                 example: "Bạn có thông báo mới từ hệ thống."
 *               data:
 *                 type: object
 *                 description: Dữ liệu tùy chọn gửi kèm (key-value)
 *                 example:
 *                   key1: "value1"
 *                   key2: "value2"
 *     responses:
 *       200:
 *         description: Gửi thông báo thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Gửi thông báo thành công
 *                 result:
 *                   type: string
 *                   example: projects/myproject/messages/abc123
 *       400:
 *         description: Thiếu tham số title/body
 *       500:
 *         description: Lỗi khi gửi thông báo
 */
router.post("/send-notification", protectRoute, sendNotification);
/**
 * @swagger
 * /api/firebase/save-fcm-token:
 *   post:
 *     summary: Lưu FCM token theo userId và deviceId
 *     tags: [FCM]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [userId, deviceId, fcmToken]
 *             properties:
 *               userId:
 *                 type: string
 *               deviceId:
 *                 type: string
 *               fcmToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Token saved
 */
router.post("/save-fcm-token", saveFcmToken);
export default router;
