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

export const updateStudentService = async (studentId: string, payload: any) => {
  try {
    const response = await axios.put(
      `${API_BASE_URL}/students/${studentId}`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
        withCredentials: true,
      }
    );

    return response.data; // { message, student }
  } catch (error: any) {
    console.error("UpdateStudentService Error:", error.response?.data || error.message);
    const msg =
      error.response?.data?.error ||
      error.response?.data?.message ||
      "Failed to update student. Please try again.";
    throw new Error(msg);
  }
};

// Delete a student by ID
export const deleteStudent = async (id: string) => {
  if (!id) throw new Error("Student ID is required");

  try {
    const response = await axios.delete(`${API_BASE_URL}/students/delete/${id}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      withCredentials: true, // if using cookies/session
    });

    return response.data; // { message: "Student deleted" }
  } catch (error: any) {
    console.error("DeleteStudent API Error:", error.response?.data || error.message);
    const msg =
      error.response?.data?.error ||
      error.response?.data?.message ||
      "Failed to delete student. Please try again.";
    throw new Error(msg);
  }
};

// Fetch scholarship students with pagination, grade filter, and search
export const getStudentsWithScholarships = async () => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/fees/with-scholarships`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        withCredentials: true, // only if your backend expects cookies
      }
    );

    return response.data; // { students: [...], count: number }
  } catch (error: any) {
    console.error("Error fetching scholarship students:", error.response?.data || error.message);
    const msg =
      error.response?.data?.error ||
      error.response?.data?.message ||
      "Failed to fetch scholarship students";
    throw new Error(msg);
  }
};
