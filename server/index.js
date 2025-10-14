import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';
import { authenticateToken, requireAdmin } from './middleware/auth.js';
import { generateToken, JWT_SECRET } from './utils/helpers.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// Auth rate limiting
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5 // limit each IP to 5 auth requests per windowMs
});

// In-memory database (replace with MongoDB in production)
let users = [
  {
    id: '1',
    email: 'admin@company.com',
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // admin123
    role: 'admin',
    name: 'Admin User'
  }
];

let employees = [
  {
    id: '1',
    name: 'John Smith',
    email: 'john.smith@company.com',
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // employee123
    position: 'Senior Software Engineer',
    department: 'Software Department',
    salary: 85000,
    joinDate: '2023-01-15',
    phone: '+1 (555) 123-4567',
    address: '123 Main St, City, State 12345',
    status: 'active'
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@company.com',
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // employee123
    position: 'Full Stack Developer',
    department: 'Software Department',
    salary: 75000,
    joinDate: '2022-08-22',
    phone: '+1 (555) 234-5678',
    address: '456 Oak Ave, City, State 12345',
    status: 'active'
  },
  {
    id: '3',
    name: 'Mike Davis',
    email: 'mike.davis@company.com',
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // employee123
    position: 'Construction Manager',
    department: 'Construction Department',
    salary: 78000,
    joinDate: '2023-03-10',
    phone: '+1 (555) 345-6789',
    address: '789 Pine St, City, State 12345',
    status: 'active'
  },
  {
    id: '4',
    name: 'Emily Chen',
    email: 'emily.chen@company.com',
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // employee123
    position: 'Travel Coordinator',
    department: 'Travels Department',
    salary: 65000,
    joinDate: '2022-12-05',
    phone: '+1 (555) 456-7890',
    address: '321 Elm St, City, State 12345',
    status: 'active'
  },
  {
    id: '5',
    name: 'Robert Wilson',
    email: 'robert.wilson@company.com',
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // employee123
    position: 'Site Engineer',
    department: 'Construction Department',
    salary: 70000,
    joinDate: '2023-05-18',
    phone: '+1 (555) 567-8901',
    address: '654 Cedar Ave, City, State 12345',
    status: 'active'
  },
  {
    id: '6',
    name: 'Lisa Thompson',
    email: 'lisa.thompson@company.com',
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // employee123
    position: 'Travel Agent',
    department: 'Travels Department',
    salary: 55000,
    joinDate: '2023-07-12',
    phone: '+1 (555) 678-9012',
    address: '987 Maple Dr, City, State 12345',
    status: 'active'
  }
];

let departments = [
  {
    id: '1',
    name: 'Software Department',
    description: 'Software development, web applications, and technical solutions',
    manager: 'John Smith',
    employeeCount: 15
  },
  {
    id: '2',
    name: 'Construction Department',
    description: 'Construction projects, site management, and building operations',
    manager: 'Mike Davis',
    employeeCount: 12
  },
  {
    id: '3',
    name: 'Travels Department',
    description: 'Travel coordination, bookings, and tourism services',
    manager: 'Emily Chen',
    employeeCount: 8
  }
];

let leaves = [
  {
    id: '1',
    employeeId: '1',
    employeeName: 'John Smith',
    type: 'vacation',
    startDate: '2024-01-20',
    endDate: '2024-01-25',
    days: 5,
    reason: 'Family vacation',
    status: 'approved',
    appliedDate: '2024-01-10'
  },
  {
    id: '2',
    employeeId: '2',
    employeeName: 'Sarah Johnson',
    type: 'sick',
    startDate: '2024-01-18',
    endDate: '2024-01-19',
    days: 2,
    reason: 'Medical appointment',
    status: 'pending',
    appliedDate: '2024-01-17'
  },
  {
    id: '3',
    employeeId: '3',
    employeeName: 'Mike Davis',
    type: 'personal',
    startDate: '2024-01-22',
    endDate: '2024-01-22',
    days: 1,
    reason: 'Personal matters',
    status: 'rejected',
    appliedDate: '2024-01-15'
  },
  {
    id: '4',
    employeeId: '4',
    employeeName: 'Emily Chen',
    type: 'vacation',
    startDate: '2024-02-05',
    endDate: '2024-02-09',
    days: 5,
    reason: 'Travel planning workshop',
    status: 'approved',
    appliedDate: '2024-01-20'
  },
  {
    id: '5',
    employeeId: '5',
    employeeName: 'Robert Wilson',
    type: 'emergency',
    startDate: '2024-01-25',
    endDate: '2024-01-26',
    days: 2,
    reason: 'Family emergency',
    status: 'approved',
    appliedDate: '2024-01-24'
  }
];

// Routes

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Auth routes
app.post('/api/auth/login', authLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log('Login attempt for email:', email);

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Check admin users
    let user = users.find(u => u.email === email);
    
    // If not found in users, check employees
    if (!user) {
      const employee = employees.find(e => e.email === email);
      if (employee) {
        user = {
          id: employee.id,
          email: employee.email,
          password: employee.password,
          role: 'employee',
          name: employee.name
        };
      }
    }

    if (!user) {
      console.log('User not found for email:', email);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    console.log('User found, checking password...');
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      console.log('Invalid password for user:', email);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    console.log('Password valid, generating token...');
    const token = generateToken(user);
    
    console.log('Login successful for user:', email);
    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/auth/verify', authenticateToken, (req, res) => {
  res.json({ user: req.user });
});

// Employee routes
app.get('/api/employees', authenticateToken, (req, res) => {
  try {
    if (req.user.role === 'employee') {
      // Employees can only see their own data
      const employee = employees.find(e => e.id === req.user.id);
      if (!employee) {
        return res.status(404).json({ error: 'Employee not found' });
      }
      const { password, ...employeeData } = employee;
      return res.json([employeeData]);
    }
    
    // Admins can see all employees
    const employeesData = employees.map(({ password, ...employee }) => employee);
    res.json(employeesData);
  } catch (error) {
    console.error('Get employees error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/employees/:id', authenticateToken, (req, res) => {
  try {
    const { id } = req.params;
    
    // Employees can only access their own data
    if (req.user.role === 'employee' && req.user.id !== id) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const employee = employees.find(e => e.id === id);
    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }
    
    const { password, ...employeeData } = employee;
    res.json(employeeData);
  } catch (error) {
    console.error('Get employee error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/employees', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { name, email, position, department, salary, joinDate, phone, address, status } = req.body;
    
    if (!name || !email || !position || !department || !salary || !joinDate || !phone || !address) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    
    // Check if email already exists
    const existingEmployee = employees.find(e => e.email === email);
    if (existingEmployee) {
      return res.status(400).json({ error: 'Email already exists' });
    }
    
    const hashedPassword = await bcrypt.hash('employee123', 10);
    
    const newEmployee = {
      id: uuidv4(),
      name,
      email,
      password: hashedPassword,
      position,
      department,
      salary: parseInt(salary),
      joinDate,
      phone,
      address,
      status: status || 'active'
    };
    
    employees.push(newEmployee);
    
    const { password, ...employeeData } = newEmployee;
    res.status(201).json(employeeData);
  } catch (error) {
    console.error('Create employee error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/employees/:id', authenticateToken, requireAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, position, department, salary, joinDate, phone, address, status } = req.body;
    
    const employeeIndex = employees.findIndex(e => e.id === id);
    if (employeeIndex === -1) {
      return res.status(404).json({ error: 'Employee not found' });
    }
    
    // Check if email already exists (excluding current employee)
    const existingEmployee = employees.find(e => e.email === email && e.id !== id);
    if (existingEmployee) {
      return res.status(400).json({ error: 'Email already exists' });
    }
    
    employees[employeeIndex] = {
      ...employees[employeeIndex],
      name,
      email,
      position,
      department,
      salary: parseInt(salary),
      joinDate,
      phone,
      address,
      status
    };
    
    const { password, ...employeeData } = employees[employeeIndex];
    res.json(employeeData);
  } catch (error) {
    console.error('Update employee error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/api/employees/:id', authenticateToken, requireAdmin, (req, res) => {
  try {
    const { id } = req.params;
    
    const employeeIndex = employees.findIndex(e => e.id === id);
    if (employeeIndex === -1) {
      return res.status(404).json({ error: 'Employee not found' });
    }
    
    employees.splice(employeeIndex, 1);
    res.json({ message: 'Employee deleted successfully' });
  } catch (error) {
    console.error('Delete employee error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Department routes
app.get('/api/departments', authenticateToken, (req, res) => {
  try {
    res.json(departments);
  } catch (error) {
    console.error('Get departments error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/departments', authenticateToken, requireAdmin, (req, res) => {
  try {
    const { name, description, manager } = req.body;
    
    if (!name || !description || !manager) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    
    // Check if department already exists
    const existingDepartment = departments.find(d => d.name === name);
    if (existingDepartment) {
      return res.status(400).json({ error: 'Department already exists' });
    }
    
    const newDepartment = {
      id: uuidv4(),
      name,
      description,
      manager,
      employeeCount: 0
    };
    
    departments.push(newDepartment);
    res.status(201).json(newDepartment);
  } catch (error) {
    console.error('Create department error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/departments/:id', authenticateToken, requireAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, manager } = req.body;
    
    const departmentIndex = departments.findIndex(d => d.id === id);
    if (departmentIndex === -1) {
      return res.status(404).json({ error: 'Department not found' });
    }
    
    // Check if department name already exists (excluding current department)
    const existingDepartment = departments.find(d => d.name === name && d.id !== id);
    if (existingDepartment) {
      return res.status(400).json({ error: 'Department name already exists' });
    }
    
    departments[departmentIndex] = {
      ...departments[departmentIndex],
      name,
      description,
      manager
    };
    
    res.json(departments[departmentIndex]);
  } catch (error) {
    console.error('Update department error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/api/departments/:id', authenticateToken, requireAdmin, (req, res) => {
  try {
    const { id } = req.params;
    
    const departmentIndex = departments.findIndex(d => d.id === id);
    if (departmentIndex === -1) {
      return res.status(404).json({ error: 'Department not found' });
    }
    
    departments.splice(departmentIndex, 1);
    res.json({ message: 'Department deleted successfully' });
  } catch (error) {
    console.error('Delete department error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Leave routes
app.get('/api/leaves', authenticateToken, (req, res) => {
  try {
    if (req.user.role === 'employee') {
      // Employees can only see their own leaves
      const userLeaves = leaves.filter(l => l.employeeId === req.user.id);
      return res.json(userLeaves);
    }
    
    // Admins can see all leaves
    res.json(leaves);
  } catch (error) {
    console.error('Get leaves error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/leaves', authenticateToken, (req, res) => {
  try {
    const { employeeId, type, startDate, endDate, reason } = req.body;
    
    if (!type || !startDate || !endDate || !reason) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    
    // For employees, use their own ID
    const actualEmployeeId = req.user.role === 'employee' ? req.user.id : employeeId;
    
    if (!actualEmployeeId) {
      return res.status(400).json({ error: 'Employee ID is required' });
    }
    
    const employee = employees.find(e => e.id === actualEmployeeId);
    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }
    
    // Calculate days
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    
    const newLeave = {
      id: uuidv4(),
      employeeId: actualEmployeeId,
      employeeName: employee.name,
      type,
      startDate,
      endDate,
      days,
      reason,
      status: 'pending',
      appliedDate: new Date().toISOString().split('T')[0]
    };
    
    leaves.push(newLeave);
    res.status(201).json(newLeave);
  } catch (error) {
    console.error('Create leave error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/leaves/:id/status', authenticateToken, requireAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    
    const leaveIndex = leaves.findIndex(l => l.id === id);
    if (leaveIndex === -1) {
      return res.status(404).json({ error: 'Leave request not found' });
    }
    
    leaves[leaveIndex].status = status;
    res.json(leaves[leaveIndex]);
  } catch (error) {
    console.error('Update leave status error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Dashboard stats
app.get('/api/dashboard/stats', authenticateToken, (req, res) => {
  try {
    if (req.user.role === 'employee') {
      // Employee dashboard stats
      const employee = employees.find(e => e.id === req.user.id);
      const employeeLeaves = leaves.filter(l => l.employeeId === req.user.id);
      
      return res.json({
        employee,
        leaves: {
          total: employeeLeaves.length,
          approved: employeeLeaves.filter(l => l.status === 'approved').length,
          pending: employeeLeaves.filter(l => l.status === 'pending').length,
          rejected: employeeLeaves.filter(l => l.status === 'rejected').length
        }
      });
    }
    
    // Admin dashboard stats
    const totalSalary = employees.reduce((sum, emp) => sum + emp.salary, 0);
    
    const leaveStats = {
      applied: leaves.length,
      approved: leaves.filter(l => l.status === 'approved').length,
      pending: leaves.filter(l => l.status === 'pending').length,
      rejected: leaves.filter(l => l.status === 'rejected').length
    };
    
    res.json({
      totalEmployees: employees.length,
      totalDepartments: departments.length,
      monthlyPay: totalSalary,
      leaveStats,
      recentEmployees: employees.slice(-3)
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler - this must be the last route
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Server accessible at: http://0.0.0.0:${PORT}`);
  console.log(`API endpoints available at: http://0.0.0.0:${PORT}/api`);
});

export default app;