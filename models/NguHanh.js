import { model, Schema } from "mongoose";
const nguHanhSchema = Schema({
  ten: String, // Ví dụ: "Càn", "Tý", "Mão"

  sinh: [String], // Hành nó sinh
  khac: [String], // Hành nó khắc
});

export default model("NguHanh", nguHanhSchema);
