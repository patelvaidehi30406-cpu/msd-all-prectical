require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const Employee = require('./models/Employee');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware to parse JSON request bodies
app.use(express.json());

// Connect to MongoDB Atlas
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB Atlas successfully');
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error.message);
  });

// Root health-check route
app.get('/', (req, res) => {
  res.json({ message: 'Employee CRUD API is running' });
});

// CREATE: Add a new employee
app.post('/api/employees', async (req, res) => {
  try {
    const { name, email, department, salary } = req.body;
    const employee = await Employee.create({ name, email, department, salary });
    res.status(201).json(employee);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// READ ALL: Get all employees
app.get('/api/employees', async (req, res) => {
  try {
    const employees = await Employee.find().sort({ createdAt: -1 });
    res.status(200).json(employees);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// READ ONE: Get a single employee by ID
app.get('/api/employees/:id', async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }
    res.status(200).json(employee);
  } catch (error) {
    res.status(400).json({ error: 'Invalid employee ID' });
  }
});

// UPDATE: Update an employee by ID
app.put('/api/employees/:id', async (req, res) => {
  try {
    const { name, email, department, salary } = req.body;
    const employee = await Employee.findByIdAndUpdate(
      req.params.id,
      { name, email, department, salary },
      { new: true, runValidators: true }
    );
    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }
    res.status(200).json(employee);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// DELETE: Delete an employee by ID
app.delete('/api/employees/:id', async (req, res) => {
  try {
    const employee = await Employee.findByIdAndDelete(req.params.id);
    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }
    res.status(200).json({ message: 'Employee deleted successfully', employee });
  } catch (error) {
    res.status(400).json({ error: 'Invalid employee ID' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
