const User = require("../models/User");

//Get token from model,create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
  const token = user.getSignedJwtToken();
  const options = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };
  if (process.env.NODE_ENV == "production") {
    options.secure = true;
  }
  res.status(statusCode).cookie("token", token, options).json({
    sucess: true,
    token,
  });
};

// @desc    Register user
// @route   POST /api/v1/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  try {
    const { username, tel, email, password, role } = req.body;
    if (!username || !tel || !email || !password || !role) {
      return res
        .status(400)
        .json({ sucess: false, msg: "Please enter all fields" });
    }
    const user = await User.create({
      username: username,
      tel: tel,
      email: email,
      password: password,
      role: role,
    });

    //Create token
    // const token = user.getSignedJwtToken();
    // res.status(200).json({sucess:true,token})
    sendTokenResponse(user, 200, res);
  } catch (err) {
    res.status(400).json({ sucess: false });
    console.log(err.stack);
  }
};

// @desc    Login user
// @route   POST /api/v1/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  const { username, password } = req.body;

  //Validate username & password
  if (!username || !password) {
    return res
      .status(400)
      .json({ sucess: false, msg: "Please provide an email and password" });
  }

  //Check for user
  const user = await User.findOne({ username }).select("+password");

  if (!user) {
    return res.status(400).json({ sucess: false, msg: "Invalid credentials" });
  }

  //Check if password matches
  const isMatch = await user.matchPassword(password);

  if (!isMatch) {
    return res.status(400).json({ sucess: false, msg: "Invalid credentials" });
  }

  //Create token
  // const token = user.getSignedJwtToken();
  // res.status(200).json({ sucess: true, token });
  sendTokenResponse(user, 200, res);
};

//At the end of file
// @desc    Get current Logged in user
// @route   Get /api/v1/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  const user = await User.findById(req.user.id);
  res.status(200).json({ success: true, data: user });
};
