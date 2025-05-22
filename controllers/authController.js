import axios from "axios";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { verifyGoogleToken } from "../lib/google.js";
import transporter from "../lib/mailConfig.js";
import FcmToken from "../models/FcmToken.js";
import Token from "../models/Token.js";
import User from "../models/User.js";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../utils/generateToken.js";
export const signup = async (req, res) => {
  try {
    const { fullName, email, password, username } = req.body;

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.error("Invalid email format", 400, 400);
    }

    // Check if username already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      if (!existingUser.isActive) {
        return res.error(
          "Username is already reserved but not activated. Please choose a different one or wait.",
          400,
          400
        );
      }

      return res.error("Username already exists", 400, 400);
    }

    // Check if email already exists
    const existingEmail = await User.findOne({ email });

    if (existingEmail) {
      if (!existingEmail.isActive) {
        // If user exists but not active, resend OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpires = new Date(Date.now() + 2 * 60 * 1000); // 2 minutes

        existingEmail.otp = otp;
        existingEmail.otpExpires = otpExpires;
        await existingEmail.save();

        // Send OTP email again
        const mailOptions = {
          from: process.env.MAIL_USER,
          to: email,
          subject: "Your new OTP Code",
          text: `Your OTP code is: ${otp}. It will expire in 2 minutes.`,
          html: `<p>Your OTP code is: <b>${otp}</b>. It will expire in 2 minutes.</p>`,
        };

        await transporter.sendMail(mailOptions);

        return res.success({
          message:
            "Account already exists but is not activated. A new OTP has been sent to your email.",
          userId: existingEmail._id,
        });
      }

      return res.error("Email already exists", 400, 400);
    }

    // Validate password length
    if (password.length < 6) {
      return res.error("Password must be at least 6 characters long", 400, 400);
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 2 * 60 * 1000); // 2 minutes

    // Create new user
    const newUser = new User({
      fullName,
      email,
      password: hashedPassword,
      username,
      isActive: false,
      otp,
      otpExpires,
    });

    await newUser.save();

    // Send OTP email
    const mailOptions = {
      from: process.env.MAIL_USER,
      to: email,
      subject: "Your OTP Code",
      text: `Your OTP code is: ${otp}. It will expire in 2 minutes.`,
      html: `<p>Your OTP code is: <b>${otp}</b>. It will expire in 2 minutes.</p>`,
    };

    await transporter.sendMail(mailOptions);

    return res.success({
      message:
        "User created successfully. Please check your email for the OTP to activate your account.",
      userId: newUser._id,
    });
  } catch (error) {
    console.error("Error in signup controller:", error.message);
    return res.error("Internal Server Error during signup", 500, 500);
  }
};

export const resendOtp = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.error("User ID is required", 400, 400);
    }

    // Tìm người dùng chưa active
    const user = await User.findOne({ _id: userId, isActive: false });

    if (!user) {
      return res.error("User not found or already activated", 404, 404);
    }

    // Tạo OTP mới và thời gian hết hạn (2 phút)
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 2 * 60 * 1000);

    // Cập nhật OTP và thời gian hết hạn
    user.otp = otp;
    user.otpExpires = otpExpires;
    await user.save();

    // Gửi mail OTP
    const mailOptions = {
      from: process.env.MAIL_USER,
      to: user.email,
      subject: "Your new OTP Code",
      text: `Your new OTP code is: ${otp}. It will expire in 2 minutes.`,
      html: `<p>Your new OTP code is: <b>${otp}</b>. It will expire in 2 minutes.</p>`,
    };

    await transporter.sendMail(mailOptions);

    return res.success({
      message: "OTP has been resent successfully. Please check your email.",
    });
  } catch (error) {
    console.error("Error in resendOtp controller", error.message);
    return res.error("Internal Server Error resendOtp", 500, 500);
  }
};
export const loginGoogle = async (req, res) => {
  try {
    const { idToken } = req.body;

    const payload = await verifyGoogleToken(idToken);
    const { email, name, picture, sub: googleId } = payload;

    // Tìm user theo googleId hoặc email
    let user = await User.findOne({
      $or: [{ googleId }, { email }],
    });

    if (!user) {
      // Tạo mới nếu không có user
      user = new User({
        email,
        fullName: name,
        googleId,
        profileImg: picture,
        isActive: true,
      });
      await user.save();
    } else {
      // Nếu user có email mà chưa có googleId thì cập nhật googleId
      if (!user.googleId) {
        user.googleId = googleId;
        await user.save();
      }
    }

    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    await Token.findOneAndDelete({ userId: user._id });
    await Token.create({ userId: user._id, refreshToken });

    return res.success([
      {
        USER_ID: user._id,
        accessToken,
        refreshToken,
      },
    ]);
  } catch (error) {
    console.error("Error in loginGoogle controller", error.message);
    return res.error("Internal Server Error loginGoogle", 500, 500);
  }
};

export const loginWithFacebook = async (req, res) => {
  const { accessToken } = req.body;

  try {
    const response = await axios.get(`https://graph.facebook.com/me`, {
      params: {
        access_token: accessToken,
        fields: "id,name,email,picture",
      },
    });
    const { id, name, email, picture } = response.data;

    // Tìm user theo facebookId hoặc email
    let user = await User.findOne({
      $or: [{ facebookId: id }, { email: email }],
    });

    const username = name.toLowerCase().replace(/\s+/g, "") || undefined;

    if (!user) {
      // Chưa có user thì tạo mới
      user = new User({
        username,
        fullName: name,
        email,
        facebookId: id,
        profileImg: picture.data.url,
        coverImg: picture.data.url,
        isActive: true,
      });
      await user.save();
    } else {
      // Nếu có user rồi nhưng chưa có facebookId thì cập nhật
      if (!user.facebookId) {
        user.facebookId = id;
        user.profileImg = picture.data.url;
        user.coverImg = picture.data.url;
        await user.save();
      }
    }

    // Tạo token cho user
    const accessTokenLocal = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    await Token.findOneAndDelete({ userId: user._id });
    await Token.create({ userId: user._id, refreshToken });

    return res.success([
      {
        USER_ID: user._id,
        accessToken: accessTokenLocal,
        refreshToken,
      },
    ]);
  } catch (error) {
    console.error("Facebook login error:", error.message);
    return res.status(500).json({ message: "Facebook login failed" });
  }
};

export const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });
    const isPasswordCorrect = await bcrypt.compare(password, user?.password);

    if (!user || !isPasswordCorrect) {
      return res.error("Invalid username or password", 400, 400);
    }

    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    await Token.findOneAndDelete({ userId: user._id });
    await Token.create({ userId: user._id, refreshToken });

    return res.success([
      {
        USER_ID: user._id,
        accessToken,
        refreshToken,
      },
    ]);
  } catch (error) {
    console.error("Error in login controller", error.message);
    return res.error(`Internal Server Error ${error.message}`, 500, 500);
  }
};
export const verifyOtp = async (req, res) => {
  try {
    const { userId, otp } = req.body;

    if (!userId || !otp) {
      return res.error("User ID and OTP are required.", 400, 400);
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.error("User not found.", 404, 404);
    }

    if (user.isActive) {
      return res.error("Account already activated.", 400, 400);
    }

    if (!user.otp || !user.otpExpires) {
      return res.error("No OTP found for this user.", 400, 400);
    }

    if (user.otp !== otp) {
      return res.error("Invalid OTP.", 400, 400);
    }

    if (user.otpExpires < new Date()) {
      return res.error("OTP has expired.", 400, 400);
    }

    user.isActive = true;
    user.otp = null;
    user.otpExpires = null;

    await user.save();
    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);
    await Token.findOneAndDelete({ userId: user._id });
    await Token.create({ userId: user._id, refreshToken });
    return res.success([
      {
        USER_ID: user._id,
        accessToken,
        refreshToken,
      },
    ]);
  } catch (error) {
    console.error("Error in verifyOtp controller:", error);
    return res.error("Internal server error.", 500, 500);
  }
};
export const getUser = async (req, res) => {
  try {
    const user = req.user;
    // const fcmData = await FcmToken.findOne({ userId: user._id });
    // if (fcmData?.fcmToken) {
    //   await sendPushNotification(
    //     fcmData.fcmToken,
    //     "Đăng nhập thành công",
    //     `Xin chào ${user.username}!`,
    //     { type: "login_success" }
    //   );
    // }

    return res.success([
      {
        USER_ID: user._id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
      },
    ]);
  } catch (error) {
    console.error("Error in getUser controller", error.message);
    return res.error(`Internal Server Error ${error.message}`, 500, 500);
  }
};

export const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.error("Refresh token is required", 400, 400);

    const storedToken = await Token.findOne({ refreshToken });
    if (!storedToken) return res.error("Invalid refresh token", 403, 403);

    jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET,
      async (err, decoded) => {
        if (err) return res.error("Expired or invalid refresh token", 403, 403);

        const user = await User.findById(decoded.userId);
        if (!user)
          return res.error("User not found in refresh token", 401, 401);

        const newAccessToken = generateAccessToken(user._id);

        return res.success({ accessToken: newAccessToken });
      }
    );
  } catch (error) {
    console.error("Error in refreshToken controller:", error.message);
    return res.error("Server error JWT refresh token", 500, 500);
  }
};

export const logout = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.error("Refresh token is required", 400, 400);
    const user = req.user;
    await FcmToken.findOneAndDelete({ userId: user._id });
    await Token.findOneAndDelete({ refreshToken });

    return res.success({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Error in logout controller", error.message);
    return res.error(`Internal Server Error ${error.message}`, 500, 500);
  }
};
export const sendMail = async (req, res) => {
  try {
    const { to, subject, text, html } = req.body;
    console.log(to);
    let info = await transporter.sendMail({
      from: process.env.MAIL_USER,
      to,
      subject,
      text,
      html,
    });
    return res.success({ message: "Email sent successfully" });
  } catch (error) {
    console.error("Error in sendMail controller", error.message);
    return res.error(`Internal Server Error ${error.message}`, 500, 500);
  }
};
