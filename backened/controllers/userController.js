const ErrorHandler = require("../utils/errorHandler");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const userModel = require("../models/userModel");
const sendToken = require("../utils/jwtToken");
const sendEmail = require("../utils/sendEmail");
const crypto = require("crypto");
const productModel = require("../models/productModel");
const cloudinary = require("cloudinary");

// Register user
exports.registerUser = catchAsyncErrors(async (req, res, next) => {
  let avatar = [
    {
      url: "/Profile.png",
    },
  ]; // Default avatar URL

  if (req.body.avatar) {
    const myCloud = await cloudinary.v2.uploader.upload(req.body.avatar, {
      folder: "avatars",
      width: 150,
      crop: "scale",
    });

    avatar = [
      {
        public_id: myCloud.public_id,
        url: myCloud.secure_url, // Use the uploaded image URL
      },
    ];
  }

  const { name, email, password } = req.body;

  const user = await userModel.create({
    name,
    email,
    password,
    avatar,
  });

  sendToken(user, 201, res);
});

// Login user
exports.loginUser = catchAsyncErrors(async (req, res, next) => {
  const { email, password } = req.body;

  // checking if user has given password and email both

  if (!email || !password) {
    return next(new ErrorHandler("Please Enter Email & Password", 400));
  }

  const user = await userModel.findOne({ email }).select("+password");

  if (!user) {
    return next(new ErrorHandler("Invalid email or password", 401));
  }

  const isPasswordMatched = await user.comparePassword(password);

  if (!isPasswordMatched) {
    return next(new ErrorHandler("Invalid email or password", 401));
  }

  sendToken(user, 200, res);
});

// logout
exports.logoutUser = catchAsyncErrors(async (req, res, next) => {
  res.cookie("token", null, {
    expires: new Date(Date.now()),
    httpOnly: true,
  });
  res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
});

// Forgot password
exports.forgotPassword = catchAsyncErrors(async (req, res, next) => {
  const user = await userModel.findOne({ email: req.body.email });
  if (!user) {
    return next(new ErrorHandler("User not found", 404));
  }

  // Get resetPasswordToken
  const resetToken = user.getResetPasswordToken();

  // generated token this.resetPasswordToken m aaya h but abhi save nhi hua
  await user.save({ validateBeforeSave: false });

  // create link to sent for reset password
  const resetPasswordUrl = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/password/reset/${resetToken}`;
  // const resetPasswordUrl = `${process.env.FRONTEND_URL}/password/reset/${resetToken}`;

  // create message
  const message = `Your password rest token is :-\n\n ${resetPasswordUrl} \n\n If you have not requested this email then please ignore it`;

  try {
    await sendEmail({
      email: user.email,
      subject: `Ecommerce Password recovery`,
      message,
    });
    res.status(200).json({
      success: true,
      message: `Password reset Link sent to ${user.email} successfully, Please check your Email`,
    });
  } catch (err) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save({ validateBeforeSave: false });
    return next(new ErrorHandler(err.message, 500));
  }
});

// reset password
exports.resetPassword = catchAsyncErrors(async (req, res, next) => {
  // Hash the token comes from params
  let resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  // find user using this token
  const user = await userModel.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    return next(
      new ErrorHandler("Reset Password token is invalid or expired", 400)
    );
  }

  // if user exist but password and confirm password doesn't match
  if (req.body.password != req.body.confirmPassword) {
    return next(
      new ErrorHandler("confirmPassword doesn't match Password", 400)
    );
  }

  user.password = req.body.password;
  resetPasswordToken = undefined;
  resetPasswordExpire = undefined;

  await user.save();
  sendToken(user, 200, res);
});

// get user details
exports.getUserDetails = catchAsyncErrors(async (req, res, next) => {
  // const id =req.user.id;
  const user = await userModel.findById(req.user.id);
  console.log(req.user.id); // y empty nhi hogi ar user login krke product details find krega
  if (!user) {
    return next(new ErrorHandler("User not found", 404));
  }

  res.status(200).json({
    message: "user info fetched successfully",
    user: user,
  });
});

// update user password
exports.updateUserPassword = catchAsyncErrors(async (req, res, next) => {
  const user = await userModel.findById(req.user.id).select("+password");
  const isPasswordMatched = await user.comparePassword(req.body.oldPassword);
  if (!isPasswordMatched) {
    return next(new ErrorHandler("Old Password is incorrect", 404));
  }

  if (req.body.newPassword !== req.body.confirmPassword) {
    return next(new ErrorHandler("password and confirm password not matches"));
  }

  user.password = req.body.newPassword;
  await user.save();
  // res.status(200).json({
  //   success: true,
  //   message: "user's password updated successfully",
  // });

  sendToken(user, 200, res);
});

// update user
exports.updateUser = catchAsyncErrors(async (req, res, next) => {
  const id = req.params.id;
  const user = await userModel.findById(id);
  console.log(user);
  const dataToBeUpdated = req.body;
  if (!user) {
    return next(new ErrorHandler("User not found", 404));
  } else {
    const keys = [];
    for (let key in dataToBeUpdated) {
      keys.push(key);
    }
    for (let i = 0; i < keys.length; i++) {
      user[keys[i]] = dataToBeUpdated[keys[i]];
    }
    await user.save();
    res.json({
      message: "user updated successfully",
      data: user,
    });
  }
});

// delete user(admin)
exports.deleteUser = catchAsyncErrors(async (req, res, next) => {
  const user = await userModel.findByIdAndDelete(req.params.id);

  if (!user) {
    return next(
      new ErrorHandler(`User does not exist with Id: ${req.params.id}`, 400)
    );
  }

  // const imageId = user.avatar.public_id;

  // await cloudinary.v2.uploader.destroy(imageId);

  // await user.remove();

  res.status(200).json({
    success: true,
    message: "User Deleted Successfully",
  });
});

exports.updateProfile = catchAsyncErrors(async (req, res, next) => {
  const newUserData = {
    name: req.body.name,
    email: req.body.email,
  };

  if (req.body.avatar !== "") {
    const user = await userModel.findById(req.user.id);

    const imageId = user.avatar.public_id;

    await cloudinary.v2.uploader.destroy(imageId);
    // console.log(imageId);

    const myCloud = await cloudinary.v2.uploader.upload(req.body.avatar, {
      folder: "avatars",
      width: 150,
      crop: "scale",
    });

    newUserData.avatar = {
      public_id: myCloud.public_id,
      url: myCloud.secure_url,
    };
  }

  const user = await userModel.findByIdAndUpdate(req.user.id, newUserData, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  res.status(200).json({
    success: true,
  });
});

// // Get all user(admin)
exports.getAllUsers = catchAsyncErrors(async (req, res) => {
  const users = await userModel.find();
  if (!users) {
    res.status(200).json({
      message: "No user exist",
    });
  }
  res.status(200).json({
    success: true,
    users,
  });
});
// // Get single user(admin)
exports.getSingleUser = catchAsyncErrors(async (req, res, next) => {
  const user = await userModel.findById(req.params.id);
  // console.log(user);
  if (!user) {
    return next(new ErrorHandler(`user not found with id: ${req.params.id}`));
  }
  res.status(200).json({
    success: true,
    user,
  });
});

// update user role -->admin
exports.updateUserRole = catchAsyncErrors(async (req, res, next) => {
  const newUserData = {
    name: req.body.name,
    email: req.body.email,
    role: req.body.role,
  };
  const user = await userModel.findById(req.params.id);
  console.log(user);
  await userModel.findByIdAndUpdate(req.params.id, newUserData, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  res.status(200).json({
    success: true,
    message: "User Role updated successfully",
  });
});

// delete user
exports.deleteUser = catchAsyncErrors(async (req, res, next) => {
  const user = await userModel.findByIdAndRemove(req.params.id);

  if (!user) {
    return next(
      new ErrorHandler(`User does not exist with Id: ${req.params.id}`, 400)
    );
  }

  const imageId = user.avatar.public_id;

  if (imageId) {
    await cloudinary.v2.uploader.destroy(imageId);
  }

  res.status(200).json({
    success: true,
    message: "User Deleted Successfully",
  });
});
