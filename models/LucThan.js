import { model, Schema } from "mongoose";
const lucThanSchema = new Schema({
  ten: String, // Ví dụ: "Phụ mẫu"
});

export default model("LucThan", lucThanSchema);
