const catchAsync = require("../middlewares/catchAsync");
const Student = require("../models/student");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const Token = require("../models/tokenModel");
const crypto = require("crypto");
const sendEmail = require("../utils/sendEmail");
const axios = require("axios");
const Otp = require("../models/otp");
const Exam = require("../models/exam");
// const twilio = require('twilio');
const accountSid = "AC2dfb7b3e275f71424e5634b9c0ed0b57";
const authToken = "149b9a11980bff1861f0957a8da966fc";
const client = require("twilio")(accountSid, authToken);

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "1d" });
};

module.exports.sendOtp = catchAsync(async (req, res, next) => {
  const { phoneNumber } = req.body;
  if (!phoneNumber) {
    return res.status(400).res.json({ message: "phone number required" });
  }
  const studentExists = await Student.findOne({ phoneNumber });

  if (studentExists) {
    res.status(400);
    throw new Error("phone number has already been used");
  }
  const verificationCode = Math.floor(1000 + Math.random() * 9000);
  const otp = new Otp({ verificationCode });
  await otp.save();
  const message = `Your verification code is: ${verificationCode}.`;
  try {
    await client.messages.create({
      body: message,
      from: "+13344542155",
      to: phoneNumber,
    });

    res
      .status(200)
      .json({ success: true, message: "Verification code sent via SMS" });
  } catch (e) {
    console.log(e);
    return res.status(500).json({
      success: false,
      message: "Failed to send verification code via SMS",
    });
  }
});
module.exports.registerStudent = catchAsync(async (req, res, next) => {
  const { name, phoneNumber, password, otp } = req.body;
  try {
    if (!name || !phoneNumber || !password || !otp) {
      res.status(400);
      throw new Error("please fill all the required fields");
    }
    if (password.length < 6) {
      res.status(400);
      throw new Error("password must be at least 6 characters");
    }

    const studentExists = await Student.findOne({ phoneNumber });

    if (studentExists) {
      res.status(400);
      throw new Error("phone number has already been used");
    }
    const otpIsCorrect = await Otp.findOne({ verificationCode: otp });
    if (!otpIsCorrect) {
      return res.status(401).json({ message: "Invalid OTP" });
    }
    await Otp.deleteOne({ verificationCode: otp });
    const student = new Student({
      name,
      phoneNumber,
      password,
    });
    await student.save();
    const token = generateToken(student._id);
    res.cookie("token", token, {
      path: "/",
      httpOnly: true,
      expires: new Date(Date.now() + 86400 * 30),
      sameSite: "none",
      secure: true,
    });
    if (student) {
      const { _id, name, phoneNumber } = student;
      res.status(201).json({
        _id,
        name,
        phoneNumber,
        token,
      });
    }
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

module.exports.loginStudent = catchAsync(async (req, res) => {
  const { phoneNumber, password } = req.body;
  if (!phoneNumber || !password) {
    res.status(400);
    throw new Error("please add phoneNumber and password");
  }
  const student = await Student.findOne({ phoneNumber });

  if (!student) {
    res.status(400);
    throw new Error("Invalid phone or password");
  }
  const passwordIsCorrect = await bcrypt.compare(password, student.password);
  const token = generateToken(student._id);

  res.cookie("token", token, {
    path: "/",
    httpOnly: true,
    expires: new Date(Date.now() + 86400*30),
    sameSite: "none",
    secure: true,
  });
  if (student && passwordIsCorrect) {
    const { _id, name, phoneNumber } = student;
    res.status(200).json({
      _id,
      name,
      phoneNumber,
      token,
    });
  } else {
    res.status(400);
    throw new Error("Invalid email or password");
  }
});

module.exports.logoutStudent = catchAsync(async (req, res, next) => {
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

module.exports.getStudent = catchAsync(async (req, res, next) => {
  const student = await Student.findById(req.user._id);
  if (student) {
    const { _id, name, phoneNumber } = student;
    res.status(200).json({
      _id,
      name,
      phoneNumber,
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
  const { phoneNumber } = req.body;
  const student = await Student.findOne({ phoneNumber });
  if (!student) {
    res.status(404);
    throw new Error("Student does not exist");
  }
  let token = await Token.findOne({ studentId: student._id });
  if (token) {
    await token.deleteOne();
  }
  let resetToken = crypto.randomBytes(32).toString("hex") + student._id;

  const hashedToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  await new Token({
    studentId: student._id,
    token: hashedToken,
    createdAt: Date.now(),
    expiresAt: Date.now() + 30 * 60 * 1000, //30 minutes
  }).save();
  // console.log(hashedToken)

  const resetUrl = `${process.env.FRONTEND_URL}/resetpasswprd/${resetToken}`;

  const from = process.env.SMS_ID;
  const sender = process.env.SMS_SENDER;
  const to = phoneNumber;
  const message = `Hello ${student.name}! Use the following link to reset your password: ${resetUrl}. This link is valid for 30 minutes. Regards, Team`;

  try {
    // Sending SMS using AfroMessage API
    const response = await axios.get("https://api.afromessage.com/api/send", {
      params: {
        // from: 'e80ad9d8-adf3-463f-80f4-7c4b39f7f164',
        sender: "tekle",
        to: phoneNumber,
        message: message,
      },
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });
    console.log(response);
    res.status(200).json({
      success: true,
      message: "Reset link sent via SMS",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Failed to send reset link via SMS",
    });
  }

  // try{
  //     await sendEmail(subject,message,send_to,sent_from)
  //     res.status(200).json({
  //         success:true,
  //         message:"Reset email sent"})
  // }catch(e){
  //     res.status(500)
  //     throw new Error("Email not sent,please try again")
  // }
  // console.log(resetToken)
});
module.exports.resetPassword = catchAsync(async (req, res) => {
  const { password } = req.body;
  const { resetToken } = req.params;
  const hashedToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex"); //hash token before comparison

  const studentToken = await Token.findOne({
    token: hashedToken,
    expiresAt: { $gt: Date.now() },
  });

  if (!studentToken) {
    res.status(404);
    throw new Error("invalid or expired token");
  }
  const student = await Student.findOne({ _id: studentToken.studentId });
  student.password = password;
  await student.save();
  res.status(200).json({
    message: "password reset successful,please login",
  });
});

module.exports.getExam = catchAsync(async (req, res) => {
  const {title} = req.body;
  try {
    const exam = await Exam.findOne({title});
    if (!exam) {
      return res.status(404).json({ message: "exam notfound" });
    }
    res.status(200).json({ exam });
  } catch (e) {
    res
      .status(500)
      .json({ message: "Failed to fetch exam", error: err.message });
  }
});

module.exports.takeExam = catchAsync(async (req, res) => {
  // const { examId } = req.params;
  const { answers,title } = req.body;
  try {
    const exam = await Exam.findOne({title});
    if (!exam) {
      return res.status(404).json({ message: "Exam not found" });
    }
    const student = await Student.findById(req.user._id);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }
    // if (student.examsTaken.includes(examId)) {
    //   return res
    //     .status(400)
    //     .json({ message: "Student has already taken this exam" });
    // }
    const results = [];
    let score = 0;
    for (let i = 0; i < answers.length; i++) {
      const question = exam.questions[i];
      if (!question) {
        return res
          .status(400)
          .json({ message: `Question at index ${i} not found in the exam` });
      }
      const selectedAnswersIndex = answers[i];
      if (selectedAnswersIndex === question.correctAnswer) {
        score++;
        results.push({ question: question.questionText, result: "Correct" });
      } else {
        results.push({ question: question.questionText, result: "Incorrect" });
      }
    }
    const percentageScore = (score / exam.questions.length) * 100;
    student.examsTaken.push({
      exam: exam._id,
      answers: results,
      score: percentageScore.toFixed(2),
    });
    await student.save();

    res.status(200).json({
      message: "Student successfully completed the exam",
      results,
      score: percentageScore,
    });
  } catch (err) {
    console.log(err);
    res
      .status(500)
      .json({ message: "Failed to take the exam", error: err.message });
  }
});
