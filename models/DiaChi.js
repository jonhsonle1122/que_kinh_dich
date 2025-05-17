import mongoose from "mongoose";

const { Schema, model } = mongoose;

const DiaChiSchema = new Schema({
  ten: { type: String, required: true, unique: true },
  nguhanh: { type: Schema.Types.ObjectId, ref: "NguHanh", required: true },
});

export default model("DiaChi", DiaChiSchema);
