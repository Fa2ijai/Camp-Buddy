const mongoose = require("mongoose");

const CampSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please add a name"],
      unique: true,
      trim: true,
      maxlength: [50, "Name can not be more than 50 characters"],
    },
    address: {
      type: String,
      required: [true, "Plese add an address"],
    },
    district: {
      type: String,
      require: [true, "Please add district"],
    },
    province: {
      type: String,
      required: [true, "Please add a province"],
    },
    postalcode: {
      type: String,
      required: [true, "Please add a postalcode"],
      maxlength: [5, "Postal Code can not be more than 5 digits"],
    },
    tel: {
      type: String,
      required: [true, "Please add a telephone number"],
      match: [
        /^(02\d{7}|0\d{9})$/,
        "Please enter a valid telephone number starting with 0 and consisting of 10 digits",
      ],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);
// Cascade delete appiontments when a hospital is deleted
CampSchema.pre(
  `deleteOne`,
  { document: true, query: false },
  async function (next) {
    console.log(`Bookings being removed from camp ${this._id}`);
    await this.model("Booking").deleteMany({ camp: this._id });
    next();
  }
);

//Reverse populate with virtuals
CampSchema.virtual(`bookings`, {
  ref: "Booking",
  localField: "_id",
  foreignField: "camp",
  justOne: false,
});

module.exports = mongoose.model("Camp", CampSchema);
