const API_BASE_URL = 'http://localhost:3000/api/order';

// Helper function to handle API responses
const handleResponse = async (response) => {
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Something went wrong');
  }
  return response.json();
};

// Create new order
export const createOrder = async (orderData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData),
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
};

// Get all orders with filtering and pagination
export const getOrders = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams();
    
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== '') {
        queryParams.append(key, params[key]);
      }
    });

    const response = await fetch(`${API_BASE_URL}?${queryParams}`);
    return await handleResponse(response);
  } catch (error) {
    console.error('Error fetching orders:', error);
    throw error;
  }
};

// Get single order by ID
export const getOrderById = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/${id}`);
    return await handleResponse(response);
  } catch (error) {
    console.error('Error fetching order:', error);
    throw error;
  }
};

// Get order by order ID
export const getOrderByOrderId = async (orderId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/order-id/${orderId}`);
    return await handleResponse(response);
  } catch (error) {
    console.error('Error fetching order:', error);
    throw error;
  }
};

// Update order
export const updateOrder = async (id, orderData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData),
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('Error updating order:', error);
    throw error;
  }
};

// Update order status
export const updateOrderStatus = async (id, status) => {
  try {
    const response = await fetch(`${API_BASE_URL}/${id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status }),
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('Error updating order status:', error);
    throw error;
  }
};

// Delete order
export const deleteOrder = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'DELETE',
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('Error deleting order:', error);
    throw error;
  }
};

// Get order statistics
export const getOrderStats = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/stats`);
    return await handleResponse(response);
  } catch (error) {
    console.error('Error fetching order stats:', error);
    throw error;
  }
};

// Get orders by user ID
export const getOrdersByUser = async (userId, params = {}) => {
  try {
    const queryParams = new URLSearchParams();
    
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== '') {
        queryParams.append(key, params[key]);
      }
    });

    const response = await fetch(`${API_BASE_URL}/user/${userId}?${queryParams}`);
    return await handleResponse(response);
  } catch (error) {
    console.error('Error fetching user orders:', error);
    throw error;
  }
};

// Export orders to PDF
export const exportOrders = async (params = {}) => {
  try {
    // First get the orders data
    const response = await getOrders(params);
    
    if (!response.success) {
      throw new Error('Failed to fetch orders');
    }

    // Import jsPDF dynamically
    const { jsPDF } = await import('jspdf');
    
    // Create new PDF document
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(20);
    doc.text('E-GAS Order Management Report', 20, 20);
    
    // Add date
    doc.setFontSize(12);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 30);
    
    // Add table headers
    const headers = ['Order ID', 'Customer', 'Product', 'Quantity', 'Total', 'Status', 'Date'];
    const columnWidths = [25, 30, 35, 20, 25, 25, 30];
    
    let yPosition = 50;
    
    // Add headers
    doc.setFontSize(10);
    doc.setFont(undefined, 'bold');
    let xPosition = 20;
    headers.forEach((header, index) => {
      doc.text(header, xPosition, yPosition);
      xPosition += columnWidths[index];
    });
    
    // Add line under headers
    yPosition += 5;
    doc.line(20, yPosition, 200, yPosition);
    yPosition += 10;
    
    // Add order data
    doc.setFont(undefined, 'normal');
    response.orders.forEach((order, index) => {
      if (yPosition > 280) { // Check if we need a new page
        doc.addPage();
        yPosition = 20;
      }
      
      const rowData = [
        order.orderId || 'N/A',
        order.customerName || 'N/A',
        order.cylinder?.name || 'N/A',
        order.quantity?.toString() || 'N/A',
        `Rs. ${order.totalAmount?.toLocaleString() || '0'}`,
        order.status || 'N/A',
        new Date(order.orderDate).toLocaleDateString()
      ];
      
      xPosition = 20;
      rowData.forEach((data, colIndex) => {
        // Truncate long text
        const text = data.length > 15 ? data.substring(0, 15) + '...' : data;
        doc.text(text, xPosition, yPosition);
        xPosition += columnWidths[colIndex];
      });
      
      yPosition += 8;
    });
    
    // Add summary
    yPosition += 10;
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text(`Total Orders: ${response.orders.length}`, 20, yPosition);
    
    // Calculate total revenue
    const totalRevenue = response.orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
    yPosition += 10;
    doc.text(`Total Revenue: Rs. ${totalRevenue.toLocaleString()}`, 20, yPosition);
    
    // Save the PDF
    const fileName = `orders-report-${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
    
    return { success: true, message: 'Orders exported as PDF successfully!' };
  } catch (error) {
    console.error('Error exporting orders:', error);
    throw error;
  }
};
