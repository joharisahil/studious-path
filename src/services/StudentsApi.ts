import axios from 'axios';
import { Student, StudentFormData } from '@/types';

// Base API URL from Vite environment
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Fetch all students
export const getAllStudents = async (): Promise<Student[]> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/students/getall`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`, // optional
      },
    });
    return response.data.students;
  } catch (error: any) {
    console.error('Error fetching students:', error);
    throw error;
  }
};


// Create a new student
export const createStudentApi = async (studentData: StudentFormData) => {
  const res = await axios.post(`${API_BASE_URL}/students/create`, studentData, {
    withCredentials: true, // if you’re using cookies/session
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`, // if using JWT
    },
  });
  return res.data;
};