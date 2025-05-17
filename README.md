🔮 Backend Ngũ Hành & Lập Quẻ – Node.js API
Đây là hệ thống backend xây dựng bằng Node.js, dùng để hỗ trợ ứng dụng và website tra cứu quẻ, lập quẻ theo các học thuyết phương Đông như Ngũ hành tứ thời, Lục hào, Bát tự, v.v.

✅ Tính năng chính
📆 Chuyển đổi ngày dương sang âm lịch

🌿 Tra cứu trạng thái sinh vượng ngũ hành (Vượng – Tướng – Hưu – Tù – Tử)

⚙️ Cấu trúc API phục vụ frontend ứng dụng/web

🔗 Kết nối MongoDB lưu trữ bảng ngũ hành tứ thời

📤 Dễ dàng mở rộng cho tra cứu quẻ, lập quẻ, chọn ngày giờ,...

🧱 Công nghệ sử dụng
Công nghệ	Vai trò
Node.js	Nền tảng chạy backend
Express.js	Xây dựng REST API
MongoDB + Mongoose	Quản lý cơ sở dữ liệu mùa & ngũ hành
lunar-calendar	Chuyển đổi dương lịch → âm lịch

⚙️ Cài đặt
bash
Copy
Edit
git clone https://github.com/your-username/backend-tra-cuu-que.git
cd backend-tra-cuu-que
npm install
🔧 Cấu hình .env
Tạo file .env với nội dung:

env
Copy
Edit
MONGODB_URI=mongodb://localhost:27017/ngu-hanh
PORT=3000
▶️ Khởi chạy
bash
Copy
Edit
npm run dev
📡 API Endpoint
POST /api/ngu-hanh
📘 Chức năng: Tra trạng thái ngũ hành theo chi-mệnh và ngày dương lịch

json
Copy
Edit
Request:
{
  "chiMenh": "mão-mộc",
  "ngayDuongLich": "2025-04-18"
}
json
Copy
Edit
Response:
{
  "chi": "mão",
  "menh": "mộc",
  "ngayDuongLich": "2025-04-18",
  "thangAmLich": 3,
  "muaSinh": "Xuân",
  "trangThai": "Vượng",
  "menhKhop": "Mộc"
}
📌 Dữ liệu được tính toán dựa trên bảng ngũ hành tứ thời do hệ thống lưu trữ.

🗃 Cấu trúc thư mục
bash
Copy
Edit
.
├── models/
│   └── SeasonalFiveElements.js   # Schema Mongoose lưu mùa & ngũ hành
├── routes/
│   └── nguHanh.js                # Định tuyến API tra ngũ hành
├── utils/
│   └── getTrangThai.js          # Hàm xử lý logic trạng thái
├── app.js
├── .env
├── package.json
└── README.md
🧪 Dữ liệu seed mẫu (MongoDB)
json
Copy
Edit
📲 Dự kiến mở rộng
✅ API lập quẻ Lục Hào theo giờ/ngày/tháng/năm

✅ API lập Bát tự (Tứ trụ) + thiên can địa chi

✅ API gợi ý ngày tốt/xấu theo quẻ

✅ Hệ thống quản lý người dùng tra cứu (JWT)

👤 Tác giả
Tên: Thanh Nguyen

Email: jonhsonle1122@gmail.com

Dự án liên kết: Website / App Tra Cứu Quẻ - Đang phát triển
