import { Schema, model } from "mongoose";

const quaiDichSchema = new Schema({
  soHieu: Number, // 1-64
  ten: String, // Ví dụ: "Thiên Địa Bĩ"
  thuTuBatQuai: {
    thuongQuai: String, // Ví dụ: "Càn"
    haQuai: String, // Ví dụ: "Khôn"
  },
  nhiPhan: String, // Ví dụ: "111000"
  yNghia: String,
});

export default model("QuaiDich", quaiDichSchema);
