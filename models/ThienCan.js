import mongoose from "mongoose";

const { Schema, model } = mongoose;

const ThienCanSchema = new Schema({
  ten: { type: String, required: true, unique: true },
  lucThu: [{ type: Schema.Types.ObjectId, ref: "LucThu" }],
});

export default model("ThienCan", ThienCanSchema);
