import express from 'express';
import {
  createOrder,
  getOrders,
  getOrderById,
  getOrderByOrderId,
  updateOrder,
  updateOrderStatus,
  deleteOrder,
  getOrderStats,
  getOrdersByUser,
  exportOrders
} from '../controllers/order.controller.js';

const router = express.Router();

// Create new order
router.post('/create', createOrder);

// Get all orders with filtering and pagination
router.get('/', getOrders);

// Get order statistics
router.get('/stats', getOrderStats);

// Export orders to CSV
router.get('/export', exportOrders);

// Get orders by user ID
router.get('/user/:userId', getOrdersByUser);

// Get single order by MongoDB ID
router.get('/:id', getOrderById);

// Get order by order ID (ORD-xxx format)
router.get('/order-id/:orderId', getOrderByOrderId);

// Update order
router.put('/:id', updateOrder);

// Update order status only
router.patch('/:id/status', updateOrderStatus);

// Delete order
router.delete('/:id', deleteOrder);

export default router;
