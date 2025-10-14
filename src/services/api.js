// Mock API service for WebContainer environment
class ApiService {
  constructor() {
    this.token = localStorage.getItem('authToken');
    this.initializeMockData();
  }

  initializeMockData() {
    // Only initialize mock data if it doesn't already exist
    if (localStorage.getItem('mockEmployees') && 
        localStorage.getItem('mockDepartments') && 
        localStorage.getItem('mockLeaves')) {
      return; // Data already exists, don't reinitialize
    }

    const employees = [
      {
        id: '1',
        name: 'Abiya Sajan',
        email: 'abiya.sajan@company.com',
        profilePicture: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&h=150&fit=crop&crop=face',
        position: 'Software Engineer',
        department: 'Software Department',
        salary: 85000,
        joinDate: '2023-01-15',
        phone: '+1 (555) 123-4567',
        address: '123 Main St, City, State 12345',
        status: 'active',
        dateOfBirth: '1995-03-15',
        achievements: [
          {
            id: '1',
            title: 'Employee of the Month',
            description: 'Outstanding performance in Q4 2023',
            date: '2023-12-15',
            category: 'performance'
          },
          {
            id: '2',
            title: 'AWS Certified Developer',
            description: 'Successfully completed AWS Developer certification',
            date: '2023-08-20',
            category: 'certification'
          }
        ]
      },
      {
        id: '2',
        name: 'Sandra Sivan',
        email: 'sandra.sivan@company.com',
        profilePicture: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
        position: 'Senior Developer',
        department: 'Software Department',
        salary: 75000,
        joinDate: '2022-08-22',
        phone: '+1 (555) 234-5678',
        address: '456 Oak Ave, City, State 12345',
        status: 'active',
        dateOfBirth: '1993-07-22',
        achievements: [
          {
            id: '3',
            title: 'Team Leadership Award',
            description: 'Led successful project delivery ahead of schedule',
            date: '2023-10-10',
            category: 'leadership'
          }
        ]
      },
      {
        id: '3',
        name: 'Abin Jirshad',
        email: 'abin.jirshad@company.com',
        profilePicture: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
        position: 'Project Manager',
        department: 'Software Department',
        salary: 78000,
        joinDate: '2023-03-10',
        phone: '+1 (555) 345-6789',
        address: '789 Pine St, City, State 12345',
        status: 'active',
        dateOfBirth: '1991-11-08',
        achievements: [
          {
            id: '4',
            title: 'Innovation Excellence',
            description: 'Implemented new project management methodology',
            date: '2023-09-05',
            category: 'innovation'
          }
        ]
      },
      {
        id: '4',
        name: 'Emily Chen',
        email: 'emily.chen@company.com',
        profilePicture: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
        position: 'Travel Coordinator',
        department: 'Travels Department',
        salary: 65000,
        joinDate: '2022-12-05',
        phone: '+1 (555) 456-7890',
        address: '321 Elm St, City, State 12345',
        status: 'active',
        dateOfBirth: '1994-05-12'
      },
      {
        id: '5',
        name: 'Robert Wilson',
        email: 'robert.wilson@company.com',
        profilePicture: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
        position: 'Site Engineer',
        department: 'Construction Department',
        salary: 70000,
        joinDate: '2023-05-18',
        phone: '+1 (555) 567-8901',
        address: '654 Cedar Ave, City, State 12345',
        status: 'active',
        dateOfBirth: '1989-09-25'
      },
      {
        id: '6',
        name: 'Lisa Thompson',
        email: 'lisa.thompson@company.com',
        profilePicture: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face',
        position: 'Travel Agent',
        department: 'Travels Department',
        salary: 55000,
        joinDate: '2023-07-12',
        phone: '+1 (555) 678-9012',
        address: '987 Maple Dr, City, State 12345',
        status: 'active',
        dateOfBirth: '1996-01-18'
      },
      {
        id: '7',
        name: 'Michael Rodriguez',
        email: 'michael.rodriguez@company.com',
        profilePicture: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
        position: 'Full Stack Developer',
        department: 'Software Department',
        salary: 82000,
        joinDate: '2023-02-20',
        phone: '+1 (555) 789-0123',
        address: '159 Birch Ln, City, State 12345',
        status: 'active',
        dateOfBirth: '1992-12-03'
      },
      {
        id: '8',
        name: 'Sarah Johnson',
        email: 'sarah.johnson@company.com',
        profilePicture: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=150&h=150&fit=crop&crop=face',
        position: 'Construction Manager',
        department: 'Construction Department',
        salary: 88000,
        joinDate: '2022-09-15',
        phone: '+1 (555) 890-1234',
        address: '753 Spruce St, City, State 12345',
        status: 'active',
        dateOfBirth: '1988-04-14'
      },
      {
        id: '9',
        name: 'David Kim',
        email: 'david.kim@company.com',
        profilePicture: 'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=150&h=150&fit=crop&crop=face',
        position: 'UI/UX Designer',
        department: 'Software Department',
        salary: 72000,
        joinDate: '2023-04-10',
        phone: '+1 (555) 901-2345',
        address: '246 Willow Ave, City, State 12345',
        status: 'active',
        dateOfBirth: '1994-08-27'
      },
      {
        id: '10',
        name: 'Jessica Martinez',
        email: 'jessica.martinez@company.com',
        profilePicture: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face',
        position: 'Travel Specialist',
        department: 'Travels Department',
        salary: 58000,
        joinDate: '2023-06-01',
        phone: '+1 (555) 012-3456',
        address: '864 Poplar Dr, City, State 12345',
        status: 'active',
        dateOfBirth: '1995-10-09'
      },
      {
        id: '11',
        name: 'James Anderson',
        email: 'james.anderson@company.com',
        profilePicture: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face',
        position: 'Senior Construction Engineer',
        department: 'Construction Department',
        salary: 85000,
        joinDate: '2022-11-20',
        phone: '+1 (555) 123-4567',
        address: '135 Maple St, City, State 12345',
        status: 'active',
        dateOfBirth: '1987-06-30'
      },
      {
        id: '12',
        name: 'Amanda Taylor',
        email: 'amanda.taylor@company.com',
        profilePicture: 'https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=150&h=150&fit=crop&crop=face',
        position: 'DevOps Engineer',
        department: 'Software Department',
        salary: 90000,
        joinDate: '2023-01-30',
        phone: '+1 (555) 234-5678',
        address: '579 Oak Ridge Rd, City, State 12345',
        status: 'active',
        dateOfBirth: '1990-02-16'
      }
    ];

    const departments = [
      {
        id: '1',
        name: 'Software Department',
        description: 'Software development, web applications, and technical solutions',
        manager: 'Abiya Sajan',
        employeeCount: 6
      },
      {
        id: '2',
        name: 'Construction Department',
        description: 'Construction projects, site management, and building operations',
        manager: 'Sarah Johnson',
        employeeCount: 3
      },
      {
        id: '3',
        name: 'Travels Department',
        description: 'Travel coordination, bookings, and tourism services',
        manager: 'Emily Chen',
        employeeCount: 3
      }
    ];

    const leaves = [
      {
        id: '1',
        employeeId: '1',
        employeeName: 'Abiya Sajan',
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
        employeeName: 'Sandra Sivan',
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
        employeeName: 'Abin Jirshad',
        type: 'personal',
        startDate: '2024-01-22',
        endDate: '2024-01-22',
        days: 1,
        reason: 'Personal matters',
        status: 'approved',
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
      },
      {
        id: '6',
        employeeId: '8',
        employeeName: 'Sarah Johnson',
        type: 'sick',
        startDate: '2024-01-30',
        endDate: '2024-01-31',
        days: 2,
        reason: 'Medical checkup',
        status: 'pending',
        appliedDate: '2024-01-28'
      },
      {
        id: '7',
        employeeId: '9',
        employeeName: 'David Kim',
        type: 'personal',
        startDate: '2024-02-12',
        endDate: '2024-02-12',
        days: 1,
        reason: 'Personal appointment',
        status: 'pending',
        appliedDate: '2024-02-01'
      },
      {
        id: '8',
        employeeId: '12',
        employeeName: 'Amanda Taylor',
        type: 'vacation',
        startDate: '2024-02-20',
        endDate: '2024-02-23',
        days: 4,
        reason: 'Weekend getaway',
        status: 'approved',
        appliedDate: '2024-02-05'
      }
    ];

    // Always set the data to ensure it's available
    localStorage.setItem('mockEmployees', JSON.stringify(employees));
    localStorage.setItem('mockDepartments', JSON.stringify(departments));
    localStorage.setItem('mockLeaves', JSON.stringify(leaves));
  }

  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('authToken', token);
    } else {
      localStorage.removeItem('authToken');
    }
  }

  delay() {
    return new Promise(resolve => setTimeout(resolve, 500));
  }

  generateId() {
    return Date.now().toString();
  }

  async login(email, password) {
    await this.delay();
    
    // Admin login
    if (email === 'admin@company.com' && password === 'admin123') {
      const token = 'mock-admin-token-' + Date.now();
      this.setToken(token);
      const userData = {
        id: 'admin',
        email: 'admin@company.com',
        role: 'admin',
        name: 'Admin User'
      };
      localStorage.setItem('userData', JSON.stringify(userData));
      return { token, user: userData };
    }

    // Employee login - hardcoded for reliability
    const validEmployees = [
      { id: '1', email: 'abiya.sajan@company.com', name: 'Abiya Sajan' },
      { id: '2', email: 'sandra.sivan@company.com', name: 'Sandra Sivan' },
      { id: '3', email: 'abin.jirshad@company.com', name: 'Abin Jirshad' },
      { id: '4', email: 'emily.chen@company.com', name: 'Emily Chen' },
      { id: '5', email: 'robert.wilson@company.com', name: 'Robert Wilson' },
      { id: '6', email: 'lisa.thompson@company.com', name: 'Lisa Thompson' },
      { id: '7', email: 'michael.rodriguez@company.com', name: 'Michael Rodriguez' },
      { id: '8', email: 'sarah.johnson@company.com', name: 'Sarah Johnson' },
      { id: '9', email: 'david.kim@company.com', name: 'David Kim' },
      { id: '10', email: 'jessica.martinez@company.com', name: 'Jessica Martinez' },
      { id: '11', email: 'james.anderson@company.com', name: 'James Anderson' },
      { id: '12', email: 'amanda.taylor@company.com', name: 'Amanda Taylor' }
    ];
    
    const employee = validEmployees.find(e => e.email.toLowerCase() === email.toLowerCase());
    
    if (employee && password === 'employee123') {
      const token = 'mock-employee-token-' + Date.now();
      this.setToken(token);
      const userData = {
        id: employee.id,
        email: employee.email,
        role: 'employee',
        name: employee.name
      };
      localStorage.setItem('userData', JSON.stringify(userData));
      return { token, user: userData };
    }

    throw new Error('Invalid credentials');
  }

  async verifyToken() {
    await this.delay();
    
    if (!this.token) {
      throw new Error('No token provided');
    }

    const userData = localStorage.getItem('userData');
    if (userData) {
      return { user: JSON.parse(userData) };
    }

    throw new Error('Invalid token');
  }

  logout() {
    this.setToken(null);
    localStorage.removeItem('userData');
  }

  // Employee methods
  async getEmployees() {
    await this.delay();
    const employees = JSON.parse(localStorage.getItem('mockEmployees') || '[]');
    return employees;
  }

  async getEmployee(id) {
    await this.delay();
    const employees = JSON.parse(localStorage.getItem('mockEmployees') || '[]');
    const employee = employees.find(e => e.id === id);
    if (!employee) {
      throw new Error('Employee not found');
    }
    return employee;
  }

  async createEmployee(employeeData) {
    await this.delay();
    const employees = JSON.parse(localStorage.getItem('mockEmployees') || '[]');
    
    // Check if email already exists
    if (employees.find(e => e.email === employeeData.email)) {
      throw new Error('Email already exists');
    }

    const newEmployee = {
      ...employeeData,
      id: this.generateId(),
      salary: parseInt(employeeData.salary)
    };

    employees.push(newEmployee);
    localStorage.setItem('mockEmployees', JSON.stringify(employees));
    return newEmployee;
  }

  async updateEmployee(id, employeeData) {
    await this.delay();
    const employees = JSON.parse(localStorage.getItem('mockEmployees') || '[]');
    const index = employees.findIndex(e => e.id === id);
    
    if (index === -1) {
      throw new Error('Employee not found');
    }

    // Check if email already exists (excluding current employee)
    if (employees.find(e => e.email === employeeData.email && e.id !== id)) {
      throw new Error('Email already exists');
    }

    employees[index] = {
      ...employees[index],
      ...employeeData,
      salary: parseInt(employeeData.salary)
    };

    localStorage.setItem('mockEmployees', JSON.stringify(employees));
    return employees[index];
  }

  async deleteEmployee(id) {
    await this.delay();
    const employees = JSON.parse(localStorage.getItem('mockEmployees') || '[]');
    const filteredEmployees = employees.filter(e => e.id !== id);
    
    if (filteredEmployees.length === employees.length) {
      throw new Error('Employee not found');
    }

    localStorage.setItem('mockEmployees', JSON.stringify(filteredEmployees));
    return { message: 'Employee deleted successfully' };
  }

  // Department methods
  async getDepartments() {
    await this.delay();
    const departments = JSON.parse(localStorage.getItem('mockDepartments') || '[]');
    return departments;
  }

  async createDepartment(departmentData) {
    await this.delay();
    const departments = JSON.parse(localStorage.getItem('mockDepartments') || '[]');
    
    // Check if department already exists
    if (departments.find(d => d.name === departmentData.name)) {
      throw new Error('Department already exists');
    }

    const newDepartment = {
      ...departmentData,
      id: this.generateId(),
      employeeCount: 0
    };

    departments.push(newDepartment);
    localStorage.setItem('mockDepartments', JSON.stringify(departments));
    return newDepartment;
  }

  async updateDepartment(id, departmentData) {
    await this.delay();
    const departments = JSON.parse(localStorage.getItem('mockDepartments') || '[]');
    const index = departments.findIndex(d => d.id === id);
    
    if (index === -1) {
      throw new Error('Department not found');
    }

    // Check if department name already exists (excluding current department)
    if (departments.find(d => d.name === departmentData.name && d.id !== id)) {
      throw new Error('Department name already exists');
    }

    departments[index] = {
      ...departments[index],
      ...departmentData
    };

    localStorage.setItem('mockDepartments', JSON.stringify(departments));
    return departments[index];
  }

  async deleteDepartment(id) {
    await this.delay();
    const departments = JSON.parse(localStorage.getItem('mockDepartments') || '[]');
    const filteredDepartments = departments.filter(d => d.id !== id);
    
    if (filteredDepartments.length === departments.length) {
      throw new Error('Department not found');
    }

    localStorage.setItem('mockDepartments', JSON.stringify(filteredDepartments));
    return { message: 'Department deleted successfully' };
  }

  // Leave methods
  async getLeaves() {
    await this.delay();
    const leaves = JSON.parse(localStorage.getItem('mockLeaves') || '[]');
    return leaves;
  }

  async createLeave(leaveData) {
    await this.delay();
    const leaves = JSON.parse(localStorage.getItem('mockLeaves') || '[]');
    
    // Calculate days
    const start = new Date(leaveData.startDate);
    const end = new Date(leaveData.endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    const newLeave = {
      ...leaveData,
      id: this.generateId(),
      days,
      status: 'pending',
      appliedDate: new Date().toISOString().split('T')[0]
    };

    leaves.push(newLeave);
    localStorage.setItem('mockLeaves', JSON.stringify(leaves));
    return newLeave;
  }

  async updateLeaveStatus(id, status) {
    await this.delay();
    
    const leaves = JSON.parse(localStorage.getItem('mockLeaves') || '[]');
    
    const index = leaves.findIndex(l => l.id === id);
    
    if (index === -1) {
      throw new Error('Leave request not found');
    }

    if (!['approved', 'rejected'].includes(status)) {
      throw new Error('Invalid status');
    }

    leaves[index].status = status;
    
    localStorage.setItem('mockLeaves', JSON.stringify(leaves));
    
    return leaves[index];
  }

  // Dashboard methods
  async getDashboardStats() {
    await this.delay();
    const employees = JSON.parse(localStorage.getItem('mockEmployees') || '[]');
    const departments = JSON.parse(localStorage.getItem('mockDepartments') || '[]');
    const leaves = JSON.parse(localStorage.getItem('mockLeaves') || '[]');
    
    const totalSalary = employees.reduce((sum, emp) => sum + emp.salary, 0);
    
    const leaveStats = {
      applied: leaves.length,
      approved: leaves.filter(l => l.status === 'approved').length,
      pending: leaves.filter(l => l.status === 'pending').length,
      rejected: leaves.filter(l => l.status === 'rejected').length
    };
    
    return {
      totalEmployees: employees.length,
      totalDepartments: departments.length,
      monthlyPay: totalSalary,
      leaveStats,
      recentEmployees: employees.slice(-3)
    };
  }
}

export default new ApiService();