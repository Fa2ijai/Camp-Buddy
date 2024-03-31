const Camp = require("../models/Camp");

// @desc    Get all camps
// @route   GET /api/v1/camps
// @access  Public
exports.getCamps = async (req, res, next) => {
  try {
    let query;

    //Copy req.query
    const reqQuery = { ...req.query };

    //Fields to exclude
    const removeFields = ["selecet", "sort", "page", "limit"];

    //Loop over remove fields and delete them from reqQuery
    removeFields.forEach((param) => delete reqQuery[param]);
    console.log(reqQuery);

    //Create query string
    let queryStr = JSON.stringify(reqQuery);
    queryStr = queryStr.replace(
      /\b(gt|gte|lt|lte|in)\b/g,
      (match) => `$${match}`
    );

    //finding resource
    query = Camp.find(JSON.parse(queryStr)).populate("bookings");

    //Select Fields
    if (req.query.select) {
      const fields = req.query.select.split(",").join(" ");
      query = query.select(fields);
    }

    //Sort
    if (req.query.sort) {
      const sortBy = req.query.sort.split(",").join(" ");
      query = query.sort(sortBy);
    } else {
      query = query.sort("name");
    }

    //Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 25;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await Camp.countDocuments();

    query = query.skip(startIndex).limit(limit);
    //Executing query
    const camps = await query;
    //Pagination result
    const pagination = {};
    if (endIndex < total) {
      pagination.next = {
        page: page + 1,
        limit,
      };
    }
    if (startIndex > 0) {
      pagination.prev = {
        page: page - 1,
        limit,
      };
    }
    res.status(200).json({
      success: true,
      count: camps.length,
      pagination,
      data: camps,
    });
  } catch (err) {
    console.log(err);
    res.status(400).json({ success: false });
  }
};

// @desc    Get single camp
// @route   GET /api/v1/camps/:id
// @access  Public
exports.getCamp = async (req, res, next) => {
  try {
    const camp = await Camp.findById(req.params.id);
    if (!camp) {
      return res.status(400).json({ success: false });
    }
    res.status(200).json({ sucess: true, data: camp });
  } catch (err) {
    res.status(400).json({ success: false });
  }
};

// @desc    Create new camp
// @route   POST /api/v1/camps
// @access  Private
exports.createCamp = async (req, res, next) => {
  const camp = await Camp.create(req.body);
  res.status(201).json({ sucess: true, data: camp });
};

// @desc    Update camp
// @route   PUT /api/v1/camps/:id
// @access  Private
exports.updateCamp = async (req, res, next) => {
  try {
    const camp = await Camp.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!camp) {
      return res.status(400).json({ sucess: false });
    }
    res.status(200).json({ sucess: true, data: camp });
  } catch (err) {
    res.status(400).json({ success: false });
  }
};

// @desc    Delete camp
// @route   DELETE /api/v1/camps/:id
// @access  Privete
exports.deleteCamp = async (req, res, next) => {
  try {
    const camp = await Camp.findById(req.params.id);
    if (!camp) {
      return res.status(400).json({ sucess: false });
    }
    await camp.deleteOne();
    res.status(200).json({ sucess: true, data: {} });
  } catch (err) {
    res.status(400).json({ success: false });
  }
};
