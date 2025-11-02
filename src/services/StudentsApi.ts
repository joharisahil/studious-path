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
  try {
    const payload = {
      firstName: studentData.firstName,
      lastName: studentData.lastName,
      dob: studentData.dob,
      classId: studentData.classId,
      session: studentData.session,

      address: studentData.address,
      phone: studentData.phone,

      // Father
      fatherName: studentData.fatherName || "",
      fatherphone: studentData.fatherphone || "",
      fatherEmail: studentData.fatherEmail || "",
      fatherOccupation: studentData.fatherOccupation || "",

      // Mother
      motherName: studentData.motherName || "",
      motherphone: studentData.motherphone || "",
      motherEmail: studentData.motherEmail || "",
      motherOccupation: studentData.motherOccupation || "",

      // Emergency Contact ✅ FIXED HERE
      contactName: studentData.contactName || "",
      contactphone: studentData.contactPhone || "", // ✅ FIXED NAME
      relation: studentData.relation || "",
      contactEmail: studentData.contactEmail || "",
    };

    const res = await axios.post(`${API_BASE_URL}/students/create`, payload, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
        "Content-Type": "application/json",
      },
      withCredentials: true,
    });

    return res.data;
  } catch (error: any) {
    console.error("CreateStudent API Error:", error.response?.data || error);

    throw new Error(
      error.response?.data?.error ||
        error.response?.data?.message ||
        "Failed to register student."
    );
  }
};

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
    console.error(
      "UpdateStudentService Error:",
      error.response?.data || error.message
    );
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
    const response = await axios.delete(
      `${API_BASE_URL}/students/delete/${id}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        withCredentials: true, // if using cookies/session
      }
    );

    return response.data; // { message: "Student deleted" }
  } catch (error: any) {
    console.error(
      "DeleteStudent API Error:",
      error.response?.data || error.message
    );
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
    const response = await axios.get(`${API_BASE_URL}/fees/with-scholarships`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      withCredentials: true, // only if your backend expects cookies
    });

    return response.data; // { students: [...], count: number }
  } catch (error: any) {
    console.error(
      "Error fetching scholarship students:",
      error.response?.data || error.message
    );
    const msg =
      error.response?.data?.error ||
      error.response?.data?.message ||
      "Failed to fetch scholarship students";
    throw new Error(msg);
  }
};
