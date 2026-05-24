const express = require('express');
const router = express.Router();
const { jwtAuth, requireRole } = require('../middleware/authMiddleware');
const { getStats, getOrders, updateOrderStatus } = require('../controllers/adminController');
const { login } = require('../controllers/adminAuthController');
const {
  getCharms,
  createCharm,
  updateCharm,
  deleteCharm,
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory
} = require('../controllers/adminResourceController');

// public route: login
router.post('/login', login);

// protect admin APIs with JWT and require admin role
router.get('/stats', jwtAuth, requireRole('admin', 'manager'), getStats);
router.get('/orders', jwtAuth, requireRole('admin', 'manager'), getOrders);
router.put('/orders/:id/status', jwtAuth, requireRole('admin', 'manager'), updateOrderStatus);

// Charms management
router.get('/charms', jwtAuth, requireRole('admin', 'manager'), getCharms);
router.post('/charms', jwtAuth, requireRole('admin', 'manager'), createCharm);
router.put('/charms/:id', jwtAuth, requireRole('admin', 'manager'), updateCharm);
router.delete('/charms/:id', jwtAuth, requireRole('admin', 'manager'), deleteCharm);

// Categories management
router.get('/categories', jwtAuth, requireRole('admin', 'manager'), getCategories);
router.post('/categories', jwtAuth, requireRole('admin', 'manager'), createCategory);
router.put('/categories/:id', jwtAuth, requireRole('admin', 'manager'), updateCategory);
router.delete('/categories/:id', jwtAuth, requireRole('admin', 'manager'), deleteCategory);

module.exports = router;
