import { Router } from "express";
import {
  createQueKep,
  getDiaChi,
  getQueDon,
  getQueKep,
  getThienCan,
  lichSu,
  traQue,
  traQueKep,
  updateQueDon,
  updateQueKep,
} from "../controllers/queController.js";
import { protectRoute } from "../middleware/protectRoute.js";
const router = Router();
router.use(protectRoute);

/**
 * @swagger
 * components:
 *   schemas:
 *     QueDon:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: ID của quẻ đơn
 *         tenque:
 *           type: string
 *           description: Tên của quẻ đơn
 *         ynghia:
 *           type: string
 *           description: Ý nghĩa của quẻ đơn
 *     QueKep:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: ID của quẻ kép
 *         tenque:
 *           type: string
 *           description: Tên của quẻ kép
 *         mahatext:
 *           type: string
 *           description: Mã hóa của quẻ kép
 *         dien_giai:
 *           type: string
 *           description: Diễn giải quẻ kép
 *         queNoi:
 *           $ref: '#/components/schemas/QueDon'
 *           description: Quẻ đơn nội
 *         queNgoai:
 *           $ref: '#/components/schemas/QueDon'
 *           description: Quẻ đơn ngoại
 */
/**
 * @swagger
 * /api/que/tra:
 *   post:
 *     summary: Tra cứu Quẻ Kép từ 6 hào và danh sách hào động (để tra Quẻ Biến)
 *     tags:
 *       - Quẻ Kép
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - haos
 *             properties:
 *               haos:
 *                 type: array
 *                 items:
 *                   type: integer
 *                   enum: [0, 1]
 *                 minItems: 6
 *                 maxItems: 6
 *                 example: [1, 0, 1, 1, 0, 0]
 *               hao_dong:
 *                 type: array
 *                 description: Danh sách vị trí hào động (1–6)
 *                 items:
 *                   type: integer
 *                   minimum: 1
 *                   maximum: 6
 *                 example: [2, 5]
 *               ngaylapque:
 *                 type: string
 *                 example: "2025-05-15T08:30:00Z"
 *     responses:
 *       200:
 *         description: Quẻ kép và quẻ biến nếu có
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 queKep:
 *                   $ref: '#/components/schemas/QueKep'
 *                 queKepBien:
 *                   $ref: '#/components/schemas/QueKep'
 *                 lunarInfo:
 *                   type: object
 *                   properties:
 *                     solarDate:
 *                       type: string
 *                     lunarDate:
 *                       type: string
 *                     year:
 *                       type: string
 *                     month:
 *                       type: string
 *                     day:
 *                       type: string
 *                     hour:
 *                       type: object
 *                     tietKhi:
 *                       type: string
 *                     nguyetLenh:
 *                       type: string
 *                     nhatThan:
 *                       type: string
 *       400:
 *         description: Dữ liệu không hợp lệ (phải nhập đúng 6 hào)
 *       404:
 *         description: Không tìm thấy Quẻ Đơn hoặc Quẻ Kép tương ứng
 */
router.post("/tra", traQueKep);
/**
 * @swagger
 * /api/que/que-don:
 *   get:
 *     summary: Lấy danh sách Quẻ Đơn
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Danh sách quẻ đơn
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                   tenque:
 *                     type: string
 *                   mahatext:
 *                     type: string
 *                   thiencanquenoi:
 *                     type: string
 *                   thiencanquengoai:
 *                     type: string
 *                   diachiquenoi:
 *                     type: array
 *                     items:
 *                       type: string
 *                   diachiquengoai:
 *                     type: array
 *                     items:
 *                       type: string
 */
router.get("/que-don", getQueDon);

/**
 * @swagger
 * /api/que/que-kep:
 *   get:
 *     summary: Lấy danh sách Quẻ Kép
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Danh sách quẻ kép
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                   queDon1:
 *                     type: string
 *                   queDon2:
 *                     type: string
 */
router.get("/que-kep", getQueKep);

/**
 * @swagger
 * /api/que/que-kep:
 *   post:
 *     summary: Thêm Quẻ Kép
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               queNoi:
 *                 type: string
 *                 example: "ID của Quẻ Đơn 1"
 *               queNgoai:
 *                 type: string
 *                 example: "ID của Quẻ Đơn 2"
 *               thuoccung:
 *                 type: string
 *                 example: "ID của Quẻ Đơn 3"
 *               hao_the:
 *                 type: number
 *                 example: 6
 *               dac_diem_que:
 *                 type: string
 *                 example: "Đặc điểm của quẻ kép"
 *               ten_bieu_tuong:
 *                 type: string
 *                 example: "Biểu tượng của quẻ kép"
 *               tenque:
 *                 type: string
 *                 example: "Tên quẻ kép"
 *               mahatext:
 *                 type: string
 *                 example: "Mã hào text"
 *               dien_giai:
 *                 type: string
 *                 example: "Giải thích quẻ kép"
 *     responses:
 *       201:
 *         description: Đã thêm quẻ kép thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                 queNoi:
 *                   type: string
 *                 queNgoai:
 *                   type: string
 *                 thuoccung:
 *                   type: string
 *                 hao_the:
 *                   type: number
 *                 dac_diem_que:
 *                   type: string
 *                 ten_bieu_tuong:
 *                   type: string
 *                 tenque:
 *                   type: string
 *                 mahatext:
 *                   type: string
 *                 dien_giai:
 *                   type: string
 *       500:
 *         description: Lỗi server
 */
router.post("/que-kep", createQueKep);

// API Update Quẻ Kép
/**
 * @swagger
 * /api/que/que-kep/{id}:
 *   put:
 *     summary: Cập nhật thông tin Quẻ Kép
 *     security:
 *       - bearerAuth: []
 *     description: API này cho phép cập nhật thông tin của một Quẻ Kép dựa trên ID.
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID của Quẻ Kép cần cập nhật
 *         schema:
 *           type: string
 *           example: "60b7d2a6f8d5f44d788f29b5"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               queDon1:
 *                 type: string
 *                 description: ID của Quẻ Đơn 1
 *                 example: "60b7d2a6f8d5f44d788f29b3"
 *               queDon2:
 *                 type: string
 *                 description: ID của Quẻ Đơn 2
 *                 example: "60b7d2a6f8d5f44d788f29b4"
 *               thuoccung:
 *                 type: string
 *                 description: ID của Quẻ Đơn 3
 *                 example: "60b7d2a6f8d5f44d788f29b5"
 *               hao_the:
 *                 type: number
 *                 example: 6
 *               dac_diem_que:
 *                 type: string
 *                 example: "Đặc điểm của quẻ kép"
 *               ten_bieu_tuong:
 *                 type: string
 *                 example: "Biểu tượng của quẻ kép"
 *               tenque:
 *                 type: string
 *                 description: Tên của Quẻ Kép
 *                 example: "Càn - Đoài"
 *               mahatext:
 *                 type: string
 *                 description: Mã Hào của Quẻ Kép
 *                 example: "111 - 011"
 *               dien_giai:
 *                 type: string
 *                 description: Giải thích chi tiết về Quẻ Kép
 *                 example: "Giải nghĩa của Quẻ Kép Càn - Đoài"
 *     responses:
 *       200:
 *         description: Quẻ Kép đã được cập nhật thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   description: ID của Quẻ Kép
 *                   example: "60b7d2a6f8d5f44d788f29b5"
 *                 queDon1:
 *                   type: string
 *                   description: ID của Quẻ Đơn 1
 *                   example: "60b7d2a6f8d5f44d788f29b3"
 *                 queDon2:
 *                   type: string
 *                   description: ID của Quẻ Đơn 2
 *                   example: "60b7d2a6f8d5f44d788f29b4"
 *                 thuoccung:
 *                   type: string
 *                   description: ID của Quẻ Đơn 3
 *                   example: "60b7d2a6f8d5f44d788f29b5"
 *                 hao_the:
 *                   type: number
 *                   example: 6
 *                 dac_diem_que:
 *                   type: string
 *                   example: "Đặc điểm của quẻ kép"
 *                 ten_bieu_tuong:
 *                   type: string
 *                   example: "Biểu tượng của quẻ kép"
 *                 tenque:
 *                   type: string
 *                   description: Tên của Quẻ Kép
 *                   example: "Càn - Đoài"
 *                 mahatext:
 *                   type: string
 *                   description: Mã Hào của Quẻ Kép
 *                   example: "111 - 011"
 *                 dien_giai:
 *                   type: string
 *                   description: Giải thích chi tiết về Quẻ Kép
 *                   example: "Giải nghĩa của Quẻ Kép Càn - Đoài"
 *       400:
 *         description: Dữ liệu không hợp lệ hoặc thiếu thông tin cần thiết
 *       404:
 *         description: Quẻ Kép không tồn tại
 *       500:
 *         description: Lỗi hệ thống khi cập nhật Quẻ Kép
 */
router.put("/que-kep/:id", updateQueKep);
/**
 * @swagger
 * /api/que/thien-can:
 *   get:
 *     summary: Lấy danh sách Thiên Can
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Danh sách thiên can
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                   ten:
 *                     type: string
 *       500:
 *         description: Lỗi server
 */
router.get("/thien-can", getThienCan);

/**
 * @swagger
 * /api/que/dia-chi:
 *   get:
 *     summary: Lấy danh sách Địa Chi
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Danh sách địa chi
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                   ten:
 *                     type: string
 *       500:
 *         description: Lỗi server
 */
router.get("/dia-chi", getDiaChi);
/**
 * @swagger
 * /api/que/tra-que:
 *   post:
 *     summary: Tra cứu quẻ từ 6 hào âm dương
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               haos:
 *                 type: array
 *                 items:
 *                   type: number
 *                 example: [1, 0, 1, 0, 1, 1]
 *     responses:
 *       200:
 *         description: Thông tin quẻ tương ứng
 *       400:
 *         description: Dữ liệu không hợp lệ
 */
router.post("/tra-que", traQue);
/**
 * @swagger
 * /api/que/lich-su:
 *   get:
 *     summary: Lấy lịch sử tra quẻ
 *     responses:
 *       200:
 *         description: Danh sách các quẻ đã tra
 */
router.get("/lich-su", lichSu);

/**
 * @swagger
 * /api/que/{id}:
 *   put:
 *     summary: Cập nhật thiên can và địa chi cho một quẻ đơn
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của quẻ đơn cần cập nhật
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               thiencanquenoi:
 *                 type: string
 *                 example: "64fa9bcf...id"
 *               thiencanquengoai:
 *                 type: string
 *                 example: "64fa9bd4...id"
 *               diachiquenoi:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["64fa9bdf...id", "64fa9be1...id", "64fa9be3...id"]
 *               diachiquengoai:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["64fa9be6...id", "64fa9be8...id", "64fa9bea...id"]
 *     responses:
 *       200:
 *         description: Đã cập nhật thành công quẻ đơn
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "✅ Đã cập nhật quẻ đơn"
 *                 que:
 *                   type: object
 *       400:
 *         description: Dữ liệu không hợp lệ
 *       404:
 *         description: Không tìm thấy quẻ đơn
 *       500:
 *         description: Lỗi máy chủ
 */

router.put("/:id", updateQueDon);

export default router;
