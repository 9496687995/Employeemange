import React, { createContext, useContext, useState, useEffect } from 'react';
import apiService from '../services/api';
import { notificationService } from '../services/notificationService';

export interface Employee {
  id: string;
  name: string;
  email: string;
  profilePicture?: string;
  position: string;
  department: string;
  salary: number;
  joinDate: string;
  phone: string;
  address: string;
  status: 'active' | 'inactive';
  dateOfBirth: string;
  achievements?: Achievement[];
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  date: string;
  category: 'performance' | 'leadership' | 'innovation' | 'teamwork' | 'certification' | 'other';
}

export interface Department {
  id: string;
  name: string;
  description: string;
  manager: string;
  employeeCount: number;
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  type: 'sick' | 'vacation' | 'personal' | 'emergency';
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  appliedDate: string;
}

interface EmployeeContextType {
  employees: Employee[];
  departments: Department[];
  leaves: LeaveRequest[];
  loading: boolean;
  addEmployee: (employee: Omit<Employee, 'id'>) => void;
  updateEmployee: (id: string, employee: Partial<Employee>) => void;
  deleteEmployee: (id: string) => void;
  addDepartment: (department: Omit<Department, 'id' | 'employeeCount'>) => void;
  updateDepartment: (id: string, department: Partial<Department>) => void;
  deleteDepartment: (id: string) => void;
  addLeaveRequest: (leave: Omit<LeaveRequest, 'id' | 'appliedDate'>) => void;
  updateLeaveStatus: (id: string, status: 'approved' | 'rejected') => void;
  addAchievement: (employeeId: string, achievement: Omit<Achievement, 'id'>) => void;
  deleteAchievement: (employeeId: string, achievementId: string) => void;
  refreshData: () => void;
}

const EmployeeContext = createContext<EmployeeContextType | undefined>(undefined);

export const useEmployee = () => {
  const context = useContext(EmployeeContext);
  if (context === undefined) {
    throw new Error('useEmployee must be used within an EmployeeProvider');
  }
  return context;
};

export const EmployeeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshData = async () => {
    try {
      setLoading(true);
      const [employeesData, departmentsData, leavesData] = await Promise.all([
        apiService.getEmployees(),
        apiService.getDepartments(),
        apiService.getLeaves()
      ]);
      
      setEmployees(employeesData);
      setDepartments(departmentsData);
      setLeaves(leavesData);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  const addEmployee = async (employeeData: Omit<Employee, 'id'>) => {
    try {
      const newEmployee = await apiService.createEmployee(employeeData);
      setEmployees(prev => [...prev, newEmployee]);
    } catch (error) {
      console.error('Failed to add employee:', error);
      throw error;
    }
  };

  const updateEmployee = async (id: string, employeeData: Partial<Employee>) => {
    try {
      const updatedEmployee = await apiService.updateEmployee(id, employeeData);
      setEmployees(prev => prev.map(emp => 
        emp.id === id ? updatedEmployee : emp
      ));
    } catch (error) {
      console.error('Failed to update employee:', error);
      throw error;
    }
  };

  const deleteEmployee = async (id: string) => {
    try {
      await apiService.deleteEmployee(id);
      setEmployees(prev => prev.filter(emp => emp.id !== id));
    } catch (error) {
      console.error('Failed to delete employee:', error);
      throw error;
    }
  };

  const addDepartment = async (departmentData: Omit<Department, 'id' | 'employeeCount'>) => {
    try {
      const newDepartment = await apiService.createDepartment(departmentData);
      setDepartments(prev => [...prev, newDepartment]);
    } catch (error) {
      console.error('Failed to add department:', error);
      throw error;
    }
  };

  const updateDepartment = async (id: string, departmentData: Partial<Department>) => {
    try {
      const updatedDepartment = await apiService.updateDepartment(id, departmentData);
      setDepartments(prev => prev.map(dept => 
        dept.id === id ? updatedDepartment : dept
      ));
    } catch (error) {
      console.error('Failed to update department:', error);
      throw error;
    }
  };

  const deleteDepartment = async (id: string) => {
    try {
      await apiService.deleteDepartment(id);
      setDepartments(prev => prev.filter(dept => dept.id !== id));
    } catch (error) {
      console.error('Failed to delete department:', error);
      throw error;
    }
  };

  const addLeaveRequest = async (leaveData: Omit<LeaveRequest, 'id' | 'appliedDate'>) => {
    try {
      const newLeave = await apiService.createLeave(leaveData);
      setLeaves(prev => [...prev, newLeave]);

      try {
        await notificationService.createNotification({
          type: 'leave_applied',
          title: 'New Leave Application',
          message: `${leaveData.employeeName} has applied for ${leaveData.type} leave from ${new Date(leaveData.startDate).toLocaleDateString()} to ${new Date(leaveData.endDate).toLocaleDateString()} (${leaveData.days} days)`,
          employee_id: leaveData.employeeId,
          employee_name: leaveData.employeeName,
          related_id: newLeave.id,
          metadata: {
            leave_type: leaveData.type,
            start_date: leaveData.startDate,
            end_date: leaveData.endDate,
            days: leaveData.days,
            reason: leaveData.reason
          }
        });
      } catch (notifError) {
        console.error('Failed to create notification:', notifError);
      }
    } catch (error) {
      console.error('Failed to add leave request:', error);
      throw error;
    }
  };

  const updateLeaveStatus = async (id: string, status: 'approved' | 'rejected') => {
    try {
      const updatedLeave = await apiService.updateLeaveStatus(id, status);
      setLeaves(prev => prev.map(leave => 
        leave.id === id ? updatedLeave : leave
      ));
      return updatedLeave;
    } catch (error) {
      console.error('Failed to update leave status:', error);
      throw error;
    }
  };

  const addAchievement = (employeeId: string, achievementData: Omit<Achievement, 'id'>) => {
    const newAchievement: Achievement = {
      ...achievementData,
      id: Date.now().toString()
    };

    setEmployees(prev => prev.map(emp => 
      emp.id === employeeId 
        ? { ...emp, achievements: [...(emp.achievements || []), newAchievement] }
        : emp
    ));
  };

  const deleteAchievement = (employeeId: string, achievementId: string) => {
    setEmployees(prev => prev.map(emp => 
      emp.id === employeeId 
        ? { ...emp, achievements: (emp.achievements || []).filter(a => a.id !== achievementId) }
        : emp
    ));
  };
  const value = {
    employees,
    departments,
    leaves,
    loading,
    addEmployee,
    updateEmployee,
    deleteEmployee,
    addDepartment,
    updateDepartment,
    deleteDepartment,
    addLeaveRequest,
    updateLeaveStatus,
    addAchievement,
    deleteAchievement,
    refreshData
  };

  return (
    <EmployeeContext.Provider value={value}>
      {children}
    </EmployeeContext.Provider>
  );
};