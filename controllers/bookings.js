const Booking = require("../models/Booking");
const Camp = require("../models/Camp");

//@desc Get all bookings
//@route GET /api/v1/bookings
//@access Private
exports.getBookings = async (req, res, next) => {
  let query;
  //   General users can see only their bookings
  if (req.user.role !== "admin") {
    query = await Booking.find({ user: req.user.id });
  } else {
    if (req.params.campId) {
      console.log(req.params.campId);
      query = Booking.find({ camp: req.params.campId });
    } else {
      query = Booking.find();
    }
  }
  try {
    const bookings = await query;
    res
      .status(200)
      .json({ success: true, count: bookings.length, data: bookings });
  } catch (err) {
    console.log(err.stack);
    res.status(500).json({ success: false, message: "Cannot find Booking" });
  }
};

//@desc Get single booking
//@route GET /api/v1/bookings/:id
//@access Public
exports.getBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: `No Booking with the id of ${req.params.id}`,
      });
    }
    res.status(200).json({ success: true, data: booking });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, message: "Cannot find Booking" });
  }
};

//@desc Add single booking
//@route POST /api/v1/camps/:campId/booking
//@access Private
exports.addBooking = async (req, res, next) => {
  try {
    req.body.camp = req.params.campId;
    const camp = await Camp.findById(req.params.campId);
    if (!camp) {
      return res.status(404).json({
        success: false,
        message: `No camp with the id of ${req.params.campId}`,
      });
    }
    req.body.user = req.user.id;
    //Check if user is banned
    if (req.user.ban >= Date.now()) {
      return res.status(400).json({
        success: false,
        message: `User with the id of ${req.user.id} is banned until ${req.user.ban}`,
      });
    }
    //Check for existed Booking
    const existedBookings = await Booking.find({ user: req.user.id });
    //If the user is not an admin,they can only create 3 booking.
    if (existedBookings.length >= 3 && req.user.role !== "admin") {
      return res.status(400).json({
        success: false,
        message: `User with the id of ${req.user.id} has already made 3 bookings`,
      });
    }
    const booking = await Booking.create(req.body);
    res.status(200).json({ success: true, data: booking });
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ success: false, message: "Cannot add Booking" });
  }
};

//@desc Update booking
//@route PUT /api/v1/booking/:id
//@access Private
exports.updateBooking = async (req, res, next) => {
  try {
    let booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: `No booking with the id of ${req.params.id}`,
      });
    }
    //Make sure user is booking owner
    if (booking.user.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(401).json({
        success: false,
        message: `User ${req.user.id} is not authorized to update this booking`,
      });
    }
    booking = await Booking.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    res.status(200).json({ success: true, data: booking });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, message: "Cannot update Booking" });
  }
};

//@desc Delete booking
//@route DELETE /api/v1/booking/:id
//@access Private
exports.deleteBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: `No booking with the id of ${req.params.id}`,
      });
    }
    //Make sure user is booking owner
    if (booking.user.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(401).json({
        success: false,
        message: `User ${req.user.id} is not authorized to delete this booking`,
      });
    }
    await booking.deleteOne();
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, message: "Cannot delete Booking" });
  }
};
