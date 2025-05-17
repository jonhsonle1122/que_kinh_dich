// scripts/importQue.js
import dotenv from "dotenv";
import mongoose from "mongoose";
import Que from "../models/Que.js";

dotenv.config();

// 1. Kết nối DB
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("✅ Đã kết nối MongoDB");
    importData();
  })
  .catch((err) => {
    console.error("❌ Lỗi kết nối:", err);
    process.exit(1);
  });

// 2. Danh sách quẻ (demo vài quẻ, bạn bổ sung thêm 64 quẻ sau)
const allQues = [
  {
    ma_hexagram: "111111",
    ten_que: "Thuần Càn",
    dien_giai: "Trời mạnh mẽ, cứng rắn, chủ động",
  },
  {
    ma_hexagram: "111110",
    ten_que: "Trạch Thiên Quải",
    dien_giai: "Đất mềm mại, thuận theo, hỗ trợ",
  },
  {
    ma_hexagram: "111101",
    ten_que: "Hỏa Thiên Đại Hữu",
    dien_giai: "Khó khăn ban đầu, cần kiên trì",
  },
  {
    ma_hexagram: "111011",
    ten_que: "Lôi Thiên Đại Tráng",
    dien_giai: "Giải trừ, thoát hiểm",
  },
  {
    ma_hexagram: "110100",
    ten_que: "Sơn Lôi Di",
    dien_giai: "Thêm thắt, đầy đủ",
  },
  {
    ma_hexagram: "111101",
    ten_que: "Thiên Hỏa Đồng Nhân",
    dien_giai: "Hòa hợp con người, đồng lòng",
  },
  {
    ma_hexagram: "001010",
    ten_que: "Trạch Hỏa Cách",
    dien_giai: "Cách tân, thay đổi",
  },
  {
    ma_hexagram: "010100",
    ten_que: "Thủy Lôi Truân",
    dien_giai: "Khởi đầu gian nan, cần kiên trì",
  },
  {
    ma_hexagram: "000001",
    ten_que: "Địa Sơn Khiêm",
    dien_giai: "Khiêm tốn, nhún nhường",
  },
  {
    ma_hexagram: "100100",
    ten_que: "Lôi Lôi Phệ Hạp",
    dien_giai: "Ăn hợp, hình phạt, luật lệ",
  },
  {
    ma_hexagram: "100011",
    ten_que: "Lôi Phong Hằng",
    dien_giai: "Bền vững, kiên định",
  },
  {
    ma_hexagram: "110000",
    ten_que: "Sơn Địa Bác",
    dien_giai: "Rút lui, suy yếu",
  },
  {
    ma_hexagram: "011001",
    ten_que: "Phong Trạch Trung Phu",
    dien_giai: "Trung thành, chân thành",
  },
  {
    ma_hexagram: "001100",
    ten_que: "Trạch Lôi Tùy",
    dien_giai: "Tùy thuận, theo người tốt",
  },
  {
    ma_hexagram: "011111",
    ten_que: "Phong Thiên Tiểu Súc",
    dien_giai: "Nhỏ bé, tiết chế",
  },
  {
    ma_hexagram: "111110",
    ten_que: "Thiên Sơn Độn",
    dien_giai: "Ẩn mình, tránh hiểm",
  },
  {
    ma_hexagram: "000101",
    ten_que: "Địa Hỏa Minh Di",
    dien_giai: "Ánh sáng bị che lấp",
  },
  {
    ma_hexagram: "101000",
    ten_que: "Hỏa Địa Tấn",
    dien_giai: "Tiến lên, phát triển",
  },
  {
    ma_hexagram: "000011",
    ten_que: "Địa Phong Thăng",
    dien_giai: "Tiến lên từng bước",
  },
  {
    ma_hexagram: "110111",
    ten_que: "Sơn Thiên Đại Súc",
    dien_giai: "Tích lũy lớn, chuẩn bị",
  },
  {
    ma_hexagram: "111011",
    ten_que: "Thiên Phong Cấu",
    dien_giai: "Gặp gỡ, hội ngộ",
  },
  {
    ma_hexagram: "001111",
    ten_que: "Trạch Sơn Hàm",
    dien_giai: "Giao cảm, tình cảm nảy sinh",
  },
  {
    ma_hexagram: "011010",
    ten_que: "Phong Hỏa Gia Nhân",
    dien_giai: "Gia đình, quản lý tốt",
  },
  {
    ma_hexagram: "010011",
    ten_que: "Thủy Phong Tỉnh",
    dien_giai: "Giếng nước, nuôi dưỡng",
  },
  {
    ma_hexagram: "101101",
    ten_que: "Hỏa Hỏa Phong",
    dien_giai: "Rực rỡ, phát triển",
  },
  {
    ma_hexagram: "001011",
    ten_que: "Trạch Phong Đại Quá",
    dien_giai: "Vượt quá mức, nguy hiểm",
  },
  {
    ma_hexagram: "110011",
    ten_que: "Sơn Phong Cổ",
    dien_giai: "Trị lỗi xưa, tu bổ",
  },
  {
    ma_hexagram: "011011",
    ten_que: "Phong Phong Trung Phu",
    dien_giai: "Niềm tin sâu sắc, thành tín",
  },
  {
    ma_hexagram: "101010",
    ten_que: "Hỏa Trạch Quan",
    dien_giai: "Đánh giá chính xác, đúng đắn",
  },
  {
    ma_hexagram: "010101",
    ten_que: "Thủy Trạch Biến",
    dien_giai: "Biến hóa, thay đổi liên tục",
  },
  {
    ma_hexagram: "000110",
    ten_que: "Địa Sơn Khiêm",
    dien_giai: "Khiêm nhường, vững bền",
  },
  {
    ma_hexagram: "101111",
    ten_que: "Hỏa Địa Tấn",
    dien_giai: "Tiến lên, phát triển",
  },
  {
    ma_hexagram: "000010",
    ten_que: "Địa Trạch Biến",
    dien_giai: "Biến hóa, thay đổi liên tục",
  },
];

// 3. Hàm import dữ liệu
async function importData() {
  try {
    await Que.deleteMany(); // Xoá cũ tránh trùng
    await Que.insertMany(allQues);
    console.log(`✅ Đã import ${allQues.length} quẻ`);
    process.exit(0);
  } catch (err) {
    console.error("❌ Lỗi khi import:", err);
    process.exit(1);
  }
}
