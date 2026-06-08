const Charm = require("../models/Charm");
const Order = require("../models/Order");

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

    const isAll = req.query.limit === 'all';
    const page = parseInt(req.query.page, 10) || 1;
    const limit = isAll ? 0 : (parseInt(req.query.limit, 10) || 10);
    const total = await Charm.countDocuments(JSON.parse(queryStr));

    let charms;
    if (isAll) {
      charms = await query;
    } else {
      const startIndex = (page - 1) * limit;
      query = query.skip(startIndex).limit(limit);
      charms = await query;
    }

    const pagination = {};
    if (!isAll) {
      const startIndex = (page - 1) * limit;
      const endIndex = page * limit;
      if (endIndex < total) {
        pagination.next = { page: page + 1, limit };
      }
      if (startIndex > 0) {
        pagination.prev = { page: page - 1, limit };
      }
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

const getPopularCharms = async (req, res, next) => {
  try {
    const limit = Math.max(1, parseInt(req.query.limit, 10) || 3);
    const orders = await Order.find({}, { items: 1 }).lean();
    const countMap = new Map();

    orders.forEach((order) => {
      (order.items || []).forEach((item) => {
        const quantity = Math.max(1, Number(item?.quantity) || 1);

        if (item?.productType === 'BraceletDesign' && Array.isArray(item?.designCharms)) {
          item.designCharms.forEach((charmId) => {
            if (!charmId) return;
            countMap.set(charmId, (countMap.get(charmId) || 0) + quantity);
          });
          return;
        }

        if (item?.productType === 'Charm' && item?.product) {
          const charmId = String(item.product);
          countMap.set(charmId, (countMap.get(charmId) || 0) + quantity);
        }
      });
    });

    if (countMap.size === 0) {
      const latestCharms = await Charm.find({})
        .populate('category')
        .sort('-createdAt')
        .limit(limit)
        .lean();

      const fallbackData = latestCharms.map((charm, index) => ({
        ...charm,
        count: 0,
        rank: index + 1,
        badge: index === 0 ? 'NEW' : index === 1 ? 'TRENDING' : 'POPULAR'
      }));

      res.status(200).json({
        success: true,
        count: fallbackData.length,
        data: fallbackData
      });
      return;
    }

    const topEntries = [...countMap.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit);

    const charmIds = topEntries.map(([id]) => id);
    const charms = await Charm.find({ _id: { $in: charmIds } }).populate('category').lean();
    const charmMap = new Map(charms.map((charm) => [String(charm._id), charm]));

    const data = topEntries
      .map(([charmId, count], index) => {
        const charm = charmMap.get(charmId);
        if (!charm) return null;

        return {
          ...charm,
          count,
          rank: index + 1,
          badge: index === 0 ? 'HOT' : index === 1 ? 'TRENDING' : 'POPULAR'
        };
      })
      .filter(Boolean);

    res.status(200).json({
      success: true,
      count: data.length,
      data
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
  getPopularCharms,
};
