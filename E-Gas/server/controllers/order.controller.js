import Order from '../models/order.model.js';
import { errorHandler } from '../utils/error.js';

// Generate unique order ID
const generateOrderId = () => {
  const timestamp = Date.now().toString().slice(-8); // Last 8 digits of timestamp
  const random = Math.floor(Math.random() * 100).toString().padStart(2, '0'); // 2-digit random
  return `EG${timestamp}${random}`;
};

// Create new order
export const createOrder = async (req, res, next) => {
  try {
    const {
      customerName,
      email,
      phone,
      address,
      city,
      postalCode,
      deliveryDate,
      specialInstructions,
      quantity,
      cylinder,
      userId
    } = req.body;

    // Validate required fields
    if (!customerName || !email || !phone || !address || !city || !postalCode || !deliveryDate || !quantity || !cylinder) {
      return res.status(400).json({
        success: false,
        message: 'All required fields must be provided'
      });
    }

    // Calculate total amount
    const totalAmount = cylinder.price * quantity;

    // Create order
    const order = new Order({
      orderId: generateOrderId(),
      customerName,
      email,
      phone,
      address,
      city,
      postalCode,
      deliveryDate: new Date(deliveryDate),
      specialInstructions: specialInstructions || '',
      quantity,
      cylinder,
      totalAmount,
      userId: userId || null,
    });

    const savedOrder = await order.save();

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      order: savedOrder
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

// Get all orders with filtering and pagination
export const getOrders = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      status = '',
      sortBy = 'orderDate',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object
    const filter = {};
    
    if (search) {
      filter.$or = [
        { customerName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { orderId: { $regex: search, $options: 'i' } }
      ];
    }

    if (status) {
      filter.status = status;
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get orders with pagination
    const orders = await Order.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .populate('userId', 'username email');

    // Get total count for pagination
    const totalOrders = await Order.countDocuments(filter);

    res.status(200).json({
      success: true,
      orders,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalOrders / parseInt(limit)),
        totalOrders,
        hasNext: skip + orders.length < totalOrders,
        hasPrev: parseInt(page) > 1
      }
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

// Get single order by ID
export const getOrderById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id).populate('userId', 'username email');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.status(200).json({
      success: true,
      order
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

// Get order by order ID
export const getOrderByOrderId = async (req, res, next) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findOne({ orderId }).populate('userId', 'username email');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.status(200).json({
      success: true,
      order
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

// Update order
export const updateOrder = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // If quantity is being updated, recalculate total amount
    if (updateData.quantity && updateData.cylinder) {
      updateData.totalAmount = updateData.cylinder.price * updateData.quantity;
    }

    const order = await Order.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).populate('userId', 'username email');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Order updated successfully',
      order
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

// Update order status
export const updateOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status value'
      });
    }

    const order = await Order.findByIdAndUpdate(
      id,
      { $set: { status } },
      { new: true, runValidators: true }
    ).populate('userId', 'username email');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Order status updated successfully',
      order
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

// Delete order
export const deleteOrder = async (req, res, next) => {
  try {
    const { id } = req.params;

    const order = await Order.findByIdAndDelete(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Order deleted successfully'
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

// Get order statistics
export const getOrderStats = async (req, res, next) => {
  try {
    const stats = await Order.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$totalAmount' }
        }
      }
    ]);

    const totalOrders = await Order.countDocuments();
    const totalRevenue = await Order.aggregate([
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);

    res.status(200).json({
      success: true,
      stats: {
        byStatus: stats,
        totalOrders,
        totalRevenue: totalRevenue[0]?.total || 0
      }
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

// Get orders by user ID
export const getOrdersByUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const orders = await Order.find({ userId })
      .sort({ orderDate: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalOrders = await Order.countDocuments({ userId });

    res.status(200).json({
      success: true,
      orders,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalOrders / parseInt(limit)),
        totalOrders,
        hasNext: skip + orders.length < totalOrders,
        hasPrev: parseInt(page) > 1
      }
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

// Export orders to CSV
export const exportOrders = async (req, res, next) => {
  try {
    const { status, startDate, endDate } = req.query;

    // Build filter object
    const filter = {};
    
    if (status) {
      filter.status = status;
    }

    if (startDate && endDate) {
      filter.orderDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const orders = await Order.find(filter).sort({ orderDate: -1 });

    // Convert to CSV format
    const csvHeader = 'Order ID,Customer Name,Email,Phone,Address,City,Postal Code,Product,Quantity,Total Amount,Status,Order Date,Delivery Date\n';
    
    const csvData = orders.map(order => {
      return [
        order.orderId,
        order.customerName,
        order.email,
        order.phone,
        `"${order.address}"`,
        order.city,
        order.postalCode,
        order.cylinder.name,
        order.quantity,
        order.totalAmount,
        order.status,
        order.orderDate.toISOString().split('T')[0],
        order.deliveryDate.toISOString().split('T')[0]
      ].join(',');
    }).join('\n');

    const csvContent = csvHeader + csvData;

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=orders-${new Date().toISOString().split('T')[0]}.csv`);
    res.send(csvContent);
  } catch (error) {
    console.log(error);
    next(error);
  }
};
