const Booking = require("../models/Booking.js");
const User = require("../models/user.js");
const nodemailer = require("nodemailer");
const Mailgen = require("mailgen");

const { EMAIL, PASSWORD } = require("../env.js");
const e = require("express");
// Send email to users with bookings for the next day
exports.sendEmail = async (req, res, next) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: EMAIL,
        pass: PASSWORD,
      },
    });
    const bookings = await Booking.find({
      bookingDate: {
        $gte: new Date(),
        $lt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    })
      .populate("camp")
      .populate("user")
      .exec();
    if (bookings.length === 0) {
      return res.status(404).json({ success: false, msg: "No bookings found" });
    }

    for (const booking of bookings) {
      let MailGenerator = new Mailgen({
        theme: "default",
        product: {
          name: "Camp Buddy",
          link: "http://maligen.js/",
        },
      });

      // Prepare email contents
      const date = booking.bookingDate;
      date.setHours(date.getHours() - 7);
      const formattedDateString =
        date.toDateString() + " " + date.toTimeString().split(" ")[0] + " GMT";
      let response = {
        body: {
          name: booking.user.name,
          intro: "You have a booking tomorrow",
          table: {
            data: [
              {
                Camp: booking.camp.name,
                Date: formattedDateString,
              },
            ],
          },
          outro: "Thank you for using Camp Buddy",
        },
      };
      let emailBody = MailGenerator.generate(response);
      const mailOptions = {
        from: EMAIL,
        to: booking.user.email,
        subject: "Booking Reminder",
        html: emailBody,
      };
      await transporter.sendMail(mailOptions);
    }
    return res
      .status(201)
      .json({ success: true, msg: "Emails sent successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, msg: error.message });
  }
};
