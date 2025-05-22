// models/FcmToken.js
import { Schema, model } from "mongoose";
const fcmTokenSchema = new Schema({
  userId: { type: String, required: true },
  deviceId: { type: String, required: true },
  fcmToken: { type: String, required: true },
  updatedAt: { type: Date, default: Date.now },
});

fcmTokenSchema.index({ userId: 1, deviceId: 1 }, { unique: true });

export default model("FcmToken", fcmTokenSchema);
