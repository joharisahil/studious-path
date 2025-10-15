import axios from "axios";
import { Student, StudentFormData } from "@/types";

// Base API URL from Vite environment
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Fetch all students
export const getAllStudents = async (
  page = 1,
  limit = 10
): Promise<{
  students: Student[];
  pagination: {
    currentPage: number;
    totalPages: number;
    total: number;
  };
}> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/students/getall`, {
      params: { page, limit },
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

    return {
      students: response.data.students,
      pagination: response.data.pagination,
    };
  } catch (error: any) {
    console.error("Error fetching students:", error);
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

export interface UpdateStudentPayload {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  dateOfBirth?: string;
  address?: string;
  grade?: string;
  section?: string;
  rollNumber?: string;
  admissionDate?: string;
  guardian?: {
    name?: string;
    phone?: string;
    relation?: string;
  };
  fatherName?: string;
  fatherContact?: string;
  fatherOccupation?: string;
  fatherEmail?: string;
  motherName?: string;
  motherContact?: string;
  motherOccupation?: string;
  motherEmail?: string;
  registrationNumber?: string;
  classId?: { grade: string; section: string };
  contactName?: string;
  contactPhone?: string;
  relation?: string;
  fatherphone?: string;
  motherphone?: string;
}

export const updateStudentService = async (
  studentId: string,
  payload: UpdateStudentPayload
) => {
  try {
    const response = await axios.put(`/api/students/${studentId}`, payload);
    return response.data; // { message, student }
  } catch (error: any) {
    // Optional: extract backend error message
    const msg =
      error.response?.data?.error ||
      "Failed to update student. Please try again.";
    throw new Error(msg);
  }
};

interface Pagination {
  total: number;
  currentPage: number;
  totalPages: number;
  limit: number;
}

interface GetStudentsResponse {
  success: boolean;
  students: Student[];
  pagination: Pagination;
}

// Renamed function to avoid confusion
export const fetchPaginatedStudents = async (
  page: number = 1,
  limit: number = 10
): Promise<GetStudentsResponse> => {
  const { data } = await axios.get("/api/students", {
    params: { page, limit },
  });
  return data;
};
