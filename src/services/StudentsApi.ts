import axios from 'axios';
import { Student } from '@/types';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:4000/api/v1';

export const getAllStudents = async (): Promise<Student[]> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/students/getall`);
    // Backend response: { success: true, students: [...] }
    return response.data.students;
  } catch (error: any) {
    console.error('Error fetching students:', error);
    throw error;
  }
};
