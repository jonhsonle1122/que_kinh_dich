import mongoose from "mongoose";

const { Schema, model } = mongoose;

const QueDonSchema = new Schema({
  tenque: { type: String, required: true, unique: true },
  mahatext: { type: String, required: true, unique: true },

  thiencanquenoi: { type: Schema.Types.ObjectId, ref: "ThienCan" },
  thiencanquengoai: { type: Schema.Types.ObjectId, ref: "ThienCan" },

  diachiquenoi: [{ type: Schema.Types.ObjectId, ref: "DiaChi" }],
  diachiquengoai: [{ type: Schema.Types.ObjectId, ref: "DiaChi" }],
  nguhanh: { type: Schema.Types.ObjectId, ref: "NguHanh", required: true },
});

export default model("QueDon", QueDonSchema);
