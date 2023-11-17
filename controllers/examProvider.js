const catchAsync = require("../middlewares/catchAsync");
// const Provider=require('../models/examProvider')
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const ExamProvider = require("../models/examProvider");
const Token = require("../models/tokenModel");
const crypto = require("crypto");
const sendEmail = require("../utils/sendEmail");
const Exam = require("../models/exam");

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "1d" });
};

module.exports.registerProvider = catchAsync(async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    res.status(400);
    throw new Error("please fill all the required fields");
  }
  if (password.length < 6) {
    res.status(400);
    throw new Error("password must be at least 6 characters");
  }
  const providerExists = await ExamProvider.findOne({ email });
  if (providerExists) {
    res.status(400);
    throw new Error("email has already been used");
  }
  const provider = new ExamProvider({
    name,
    email,
    password,
  });
  await provider.save();
  const token = generateToken(provider._id);
  res.cookie("token", token, {
    path: "/",
    httpOnly: true,
    expires: new Date(Date.now() + 86400 * 30),
    sameSite: "none",
    secure: true,
  });
  if (provider) {
    const { _id, name, email } = provider;
    res.status(201).json({
      _id,
      name,
      email,
      token,
    });
  } else {
    res.status(400);
    throw new Error("invalid  data");
  }
});

module.exports.loginProvider = catchAsync(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400);
    throw new Error("please add email and password");
  }
  const provider = await ExamProvider.findOne({ email });
  if (!provider) {
    res.status(404);
    throw new Error("exam provider not found");
  }
  const passwordIsCorrect = await bcrypt.compare(password, provider.password);
  const token = generateToken(provider._id);
  res.cookie("token", token, {
    path: "/",
    httpOnly: true,
    expires: new Date(Date.now() + 86400 * 30),
    sameSite: "none",
    secure: true,
  });
  if (provider && passwordIsCorrect) {
    const { _id, name, email } = provider;
    res.status(200).json({
      _id,
      name,
      email,
      token,
    });
  } else {
    res.status(400);
    throw new Error("Invalid email or password");
  }
});

module.exports.logoutProvider = catchAsync(async (req, res) => {
  res.cookie("token", "", {
    path: "/",
    httpOnly: true,
    expires: new Date(0),
    sameSite: "none",
    secure: true,
  });
  return res.status(200).json({
    message: "successfully logged out",
  });
});

module.exports.getProvider = catchAsync(async (req, res) => {
  const provider = await ExamProvider.findById(req.user._id);
  if (provider) {
    const { _id, name, email } = provider;
    res.status(200).json({
      _id,
      name,
      email,
    });
  } else {
    res.status(404);
    throw new Error("student not found");
  }
});

module.exports.loginStatus = catchAsync(async (req, res) => {
  const token = req.cookies.token;
  if (!token) {
    return res.json(false);
  }
  const verified = jwt.verify(token, process.env.JWT_SECRET);
  if (verified) {
    return res.json(true);
  }
  return res.json(false);
});

module.exports.forgotPassword = catchAsync(async (req, res) => {
  const { email } = req.body;
  const provider = await ExamProvider.findOne({ email });
  if (!provider) {
    res.status(404);
    throw new Error("Exam Provider does not exist");
  }
  let token = await Token.findOne({ providerId: provider._id });
  if (token) {
    await token.deleteOne();
  }
  let resetToken = crypto.randomBytes(32).toString("hex") + student._id;

  const hashedToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  await new Token({
    providerId: provider._id,
    token: hashedToken,
    createdAt: Date.now(),
    expiresAt: Date.now() + 30 * 60 * 1000, //30 minutes
  }).save();
  // console.log(hashedToken)

  const resetUrl = `${process.env.FRONTEND_URL}/resetpasswprd/${resetToken}`;

  const message = `
    <h2>Hello ${provider.name}</h2>
    <p>please use the url below to reset your password</p>
    <p>This link is only valid for 30 minutes.</p>
    <a href=${resetUrl}clicktracking=off>${resetUrl}</a>
    <p>Regards...</p>
    <p>team</p>
    `;
  const subject = "password reset request";
  const send_to = provider.email;
  const sent_from = process.env.EMAIL_USER;

  try {
    await sendEmail(subject, message, send_to, sent_from);
    res.status(200).json({
      success: true,
      message: "Reset email sent",
    });
  } catch (e) {
    res.status(500);
    throw new Error("Email not sent,please try again");
  }
  // console.log(resetToken)
});
module.exports.resetPassword = catchAsync(async (req, res) => {
  const { password } = req.body;
  const { resetToken } = req.params;
  const hashedToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex"); //hash token before comparison

  const providerToken = await Token.findOne({
    token: hashedToken,
    expiresAt: { $gt: Date.now() },
  });

  if (!providerToken) {
    res.status(404);
    throw new Error("invalid or expired token");
  }
  const provider = await ExamProvider.findOne({
    _id: providerToken.providerId,
  });
  provider.password = password;
  await provider.save();
  res.status(200).json({
    message: "password reset successful,please login",
  });
});

//EXAM RELATED ROUTES


module.exports.createExam = catchAsync(async (req, res) => {
  const { title, description, subject, questions } = req.body;
  if (!title || !description || !subject || !questions) {
    return res
      .status(400)
      .json({
        success: false,
        message: "Please provide all necessary details",
      });
  }
  try {
    const exam = new Exam({
      title,
      description,
      subject,
      questions,
    });
    exam.providerId = req.user._id;
    await exam.save();
    res.status(201).json({
      success: true,
      exam,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports.getExams = catchAsync(async (req, res) => {
  const exams = await Exam.find({ providerId: req.user._id });
  if (!exams || exams.length === 0) {
    return res
      .status(404)
      .json({ success: false, message: "No exams found for this provider" });
  }

  res.status(200).json({
    success: true,
    exams,
  });
});


module.exports.deleteExam = catchAsync(async (req, res) => {
  const { examId } = req.params;
  const deletedExam = await Exam.findByIdAndDelete(examId);
  if (!deletedExam) {
    res.status(404);
    throw new Error("Exam not found");
  }
  res.status(200).json({ success: true, message: "Exam deleted successfully" });
});
