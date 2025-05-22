import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,

      unique: true,
      sparse: true, // thêm sparse để không bắt buộc phải có username cho user Google
    },
    fullName: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      minLength: 6,
      // Có thể không required nếu user đăng nhập bằng Google (password không cần)
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },

    profileImg: {
      type: String,
      default: "",
    },
    coverImg: {
      type: String,
      default: "",
    },
    bio: {
      type: String,
      default: "",
    },
    link: {
      type: String,
      default: "",
    },
    otp: {
      type: String,
      default: null,
    },
    otpExpires: {
      type: Date,
      default: null,
    },

    // Trường mới cho Google login
    googleId: {
      type: String,
      unique: true,
      sparse: true, // để không bắt buộc với user thường
      default: null,
    },
    facebookId: {
      type: String,
      unique: true,
      sparse: true,
      default: null,
    },
    isActive: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);
export default User;
