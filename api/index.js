const express = require('express');
const cors = require('cors');

const app = express();

app.use(express.json());
app.use(cors());

let orders = [];

// 1. New Order
app.post('/orders', (req, res) => {
  try {
    const newOrder = {
      _id: Date.now().toString(),
      name: req.body.name || 'N/A',
      email: req.body.email || 'N/A',
      phone: req.body.phone || 'N/A',
      address: req.body.address || 'N/A',
      items: req.body.items || [],
      total: req.body.total || 0,
      status: req.body.status || 'Pending',
      date: req.body.date || new Date().toLocaleDateString(),
      time: req.body.time || new Date().toLocaleTimeString()
    };
    
    orders.push(newOrder);
    res.status(201).json(newOrder);
  } catch (error) {
    res.status(500).json({ error: "Failed to create order" });
  }
});

// 2. Get All Orders
app.get('/orders', (req, res) => {
  res.status(200).json(orders);
});

// 3. Update Status
app.patch('/orders/:id', (req, res) => {
  const order = orders.find(o => o._id === req.params.id);
  if (order) {
    order.status = req.body.status;
    res.status(200).json(order);
  } else {
    res.status(404).json({ error: "Order not found" });
  }
});

// 4. Delete Order
app.delete('/orders/:id', (req, res) => {
  orders = orders.filter(o => o._id !== req.params.id);
  res.status(200).json({ message: "Order deleted successfully" });
});

module.exports = app;
