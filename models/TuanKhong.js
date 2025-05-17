import { Schema, model } from "mongoose";

const TuanKhongSchema = new Schema({
  tuangiap: {
    type: [String], // Mảng các chuỗi ví dụ: ["Giáp Tý", "Ất Sửu", ...]
    required: true,
  },
  tuankhong: {
    type: [String], // Mảng gồm 1 chuỗi như: ["Tuất,Hợi"]
    required: true,
  },
});

const TuanKhong = model("TuanKhong", TuanKhongSchema);

export default TuanKhong;
