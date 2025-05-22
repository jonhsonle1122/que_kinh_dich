import { Router } from "express";
import {
  getUser,
  login,
  loginGoogle,
  loginWithFacebook,
  logout,
  refreshToken,
  resendOtp,
  sendMail,
  signup,
  verifyOtp,
} from "../controllers/authController.js";
import { protectRoute } from "../middleware/protectRoute.js";
const router = Router();
/**
 * @swagger
 * /api/auth/signup:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Đăng ký tài khoản mới
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - fullName
 *               - email
 *               - password
 *               - username
 *             properties:
 *               fullName:
 *                 type: string
 *                 example: Nguyễn Văn A
 *               username:
 *                 type: string
 *                 example: nguyenvana
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: yourStrongPassword123
 *     responses:
 *       201:
 *         description: Tạo tài khoản thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User created successfully
 *                 token:
 *                   type: string
 *                   example: eyJhbGciOiJIUzI1NiIsInR...
 *       400:
 *         description: Dữ liệu đầu vào không hợp lệ
 *       409:
 *         description: Email hoặc username đã tồn tại
 */
router.post("/signup", signup);
/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Đăng nhập tài khoản
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 example: nguyenvana
 *               password:
 *                 type: string
 *                 format: password
 *                 example: yourStrongPassword123
 *     responses:
 *       200:
 *         description: Đăng nhập thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Login successful
 *                 token:
 *                   type: string
 *                   example: eyJhbGciOiJIUzI1NiIsInR...
 *       400:
 *         description: Dữ liệu đầu vào không hợp lệ
 *       401:
 *         description: Sai tên đăng nhập hoặc mật khẩu
 */

router.post("/login", login);
/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Đăng xuất tài khoản
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 example: eyJhbGciOiJIUzI1NiIsInR...
 *     responses:
 *       200:
 *         description: Đăng xuất thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Logout successful
 *       400:
 *         description: Refresh token không được để trống
 *       500:
 *         description: Lỗi server
 */
router.post("/logout", protectRoute, logout);
/**
 * @swagger
 * /api/auth/refresh-token:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Lấy access token mới bằng refresh token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 example: eyJhbGciOiJIUzI1NiIsInR...
 *     responses:
 *       200:
 *         description: Lấy access token thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *                   example: eyJhbGciOiJIUzI1NiIsInR...
 *       401:
 *         description: Refresh token không hợp lệ hoặc hết hạn
 */
router.post("/refresh-token", refreshToken);
/**
 * @swagger
 * /api/auth/user:
 *   get:
 *     tags:
 *       - Auth
 *     summary: Lấy thông tin tài khoản
 *     responses:
 *       200:
 *         description: Lấy thông tin tài khoản thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Get user successful
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       USER_ID:
 *                         type: string
 *                         example: 123e4567-e89b-12d3-a456-426614174000
 *                       username:
 *                         type: string
 *                         example: nguyenvana
 *                       email:
 *                         type: string
 *                         example: user@example.com
 *                       fullName:
 *                         type: string
 *                         example: Nguyễn Văn A
 */
router.post("/user", protectRoute, getUser);
/**
 * @swagger
 * /api/auth/send-mail:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Gửi email
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - to
 *               - subject
 *               - text
 *               - html
 *             properties:
 *               to:
 *                 type: string
 *                 example: user@example.com
 *               subject:
 *                 type: string
 *                 example : Test email
 *               text:
 *                 type: string
 *                 example: This is a test email
 *               html:
 *                 type: string
 *                 example: <p>This is a test email</p>
 *     responses:
 *       200:
 *         description: Gửi email thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Email sent successfully
 *       500:
 *         description: Lỗi server
 */
router.post("/send-mail", protectRoute, sendMail);
/**
 * @swagger
 * /api/auth/verify-otp:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Xác thực OTP
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - otp
 *             properties:
 *               userId:
 *                 type: string
 *                 example: 123e4567-e89b-12d3-a456-426614174000
 *               otp:
 *                 type: string
 *                 example: 123456
 *     responses:
 *       200:
 *         description: Xác thực OTP thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: OTP verified successfully
 *       400:
 *         description: Dữ liệu đầu vào không hợp lệ
 *       404:
 *         description: User không tồn tại
 *       401:
 *         description: OTP không hợp lệ hoặc hết hạn
 */
router.post("/verify-otp", verifyOtp);
/**
 * @swagger
 * /api/auth/resend-otp:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Gửi lại OTP
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 example: user@example.com
 *     responses:
 *       200:
 *         description: Gửi lại OTP thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: OTP resent successfully
 *       500:
 *         description: Lỗi server
 */
router.post("/resend-otp", resendOtp);
/**
 * @swagger
 * /api/auth/login-google:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Đăng nhập bằng Google
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - idToken
 *             properties:
 *               idToken:
 *                 type: string
 *                 example: eyJhbGciOiJIUzI1NiIsInR...
 *     responses:
 *       200:
 *         description: Đăng nhập bằng Google thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Login successful
 *                 token:
 *                   type: string
 *                   example: eyJhbGciOiJIUzI1NiIsInR...
 *       400:
 *         description: Dữ liệu đầu vào không hợp lệ
 *       401:
 *         description: Google token không hợp lệ
 *       500:
 *         description: Lỗi server
 */
router.post("/login-google", loginGoogle);
/**
 * @swagger
 * /api/auth/login-facebook:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Đăng nhập bằng Facebook
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - accessToken
 *             properties:
 *               accessToken:
 *                 type: string
 *                 example: eyJhbGciOiJIUzI1NiIsInR...
 *     responses:
 *       200:
 *         description: Đăng nhập bằng Facebook thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Login successful
 *                 token:
 *                   type: string
 *                   example: eyJhbGciOiJIUzI1NiIsInR...
 *       400:
 *         description: Dữ liệu đầu vào không hợp lệ
 *       401:
 *         description: Facebook token không hợp lệ
 *       500:
 *         description: Lỗi server
 */
router.post("/login-facebook", loginWithFacebook);
export default router;
