import mongoose from "mongoose";

const { Schema, model } = mongoose;

const QueKepSchema = new Schema({
  tenque: { type: String, required: true },
  mahatext: { type: String, required: true, unique: true },
  dien_giai: { type: String, required: true },
  queNoi: { type: Schema.Types.ObjectId, ref: "QueDon" },
  queNgoai: { type: Schema.Types.ObjectId, ref: "QueDon" },
  thuoccung: { type: Schema.Types.ObjectId, ref: "QueDon" },
  hao_the: { type: Number, default: 6 },
});

export default model("QueKep", QueKepSchema);
