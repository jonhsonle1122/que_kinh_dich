// models/seasonalFiveElements.model.ts
import mongoose from "mongoose";

const { Schema, model } = mongoose;
const SeasonalFiveElementsSchema = new Schema({
  season: {
    type: String,
    required: true, // Ví dụ: Xuân, Hạ, Thu, Đông, Tháng Tứ Quý
  },
  lunarMonths: {
    type: [Number], // Tháng âm lịch tương ứng, ví dụ: [1, 2]
    required: true,
  },
  daysRange: {
    type: String, // Khoảng ngày dương lịch, ví dụ: "Từ 01/01 đến 12/03"
    required: true,
  },
  durationDays: {
    type: Number, // Thời lượng mùa, ví dụ: 72
    required: true,
  },
  elements: {
    vuong: { type: String, required: true }, // Mộc, Hỏa, Kim, v.v.
    tuong: { type: String, required: true },
    huu: { type: String, required: true },
    tu: { type: String, required: true },
    tuTu: { type: String, required: true }, // "Tử" - thêm vì bảng này có thêm cột Tử
  },
});

export default model("SeasonalFiveElements", SeasonalFiveElementsSchema);
