const Charm = require("../models/Charm");

const getCharms = async (req, res, next) => {
  try {
    let query;

    const reqQuery = { ...req.query };
    const removeFields = ["select", "sort", "page", "limit", "search"];

    removeFields.forEach((param) => delete reqQuery[param]);

    let queryStr = JSON.stringify(reqQuery);

    queryStr = queryStr.replace(
      /\b(gt|gte|lt|lte|in)\b/g,
      (match) => `$${match}`,
    );

    query = Charm.find(JSON.parse(queryStr)).populate("category");

    if (req.query.search) {
      query = query.find({ name: { $regex: req.query.search, $options: "i" } });
    }

    if (req.query.select) {
      const fields = req.query.select.split(",").join(" ");
      query = query.select(fields);
    }

    if (req.query.sort) {
      const sortBy = req.query.sort.split(",").join(" ");
      query = query.sort(sortBy);
    } else {
      query = query.sort("-createdAt");
    }

    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await Charm.countDocuments(JSON.parse(queryStr));

    query = query.skip(startIndex).limit(limit);

    const charms = await query;

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
      count: charms.length,
      pagination,
      total,
      data: charms,
    });
  } catch (error) {
    next(error);
  }
};

const getCharm = async (req, res, next) => {
  try {
    const charm = await Charm.findById(req.params.id).populate("category");

    if (!charm) {
      res.status(404);
      throw new Error(`Charm not found with id of ${req.params.id}`);
    }

    res.status(200).json({
      success: true,
      data: charm,
    });
  } catch (error) {
    next(error);
  }
};

const createCharm = async (req, res, next) => {
  try {
    const charm = await Charm.create(req.body);

    res.status(201).json({
      success: true,
      data: charm,
    });
  } catch (error) {
    next(error);
  }
};

const updateCharm = async (req, res, next) => {
  try {
    const charm = await Charm.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!charm) {
      res.status(404);
      throw new Error(`Charm not found with id of ${req.params.id}`);
    }

    res.status(200).json({
      success: true,
      data: charm,
    });
  } catch (error) {
    next(error);
  }
};

const deleteCharm = async (req, res, next) => {
  try {
    const charm = await Charm.findByIdAndDelete(req.params.id);

    if (!charm) {
      res.status(404);
      throw new Error(`Charm not found with id of ${req.params.id}`);
    }

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCharms,
  getCharm,
  createCharm,
  updateCharm,
  deleteCharm,
};
