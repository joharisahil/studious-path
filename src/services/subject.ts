import axios from "axios";
import API_BASE_URL from "@/config/api";

// 🔹 Helper to get auth headers with token
const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    headers: {
      Authorization: token ? `Bearer ${token}` : "",
      "Content-Type": "application/json",
    },
    withCredentials: true,
  };
};

export interface CreateSubjectData {
  name: string;
  code?: string;
  classIds: string[]; // allow multiple classes
  teacherIds?: string[]; // optional multiple teachers
}

export interface SubjectResponse {
  success: boolean;
  message: string;
  subject: {
    _id: string;
    name: string;
    code: string;
    admin: string;
    classes: string[];
    teachers: string[];
  };
}

export const createSubject = async (
  data: CreateSubjectData
): Promise<SubjectResponse> => {
  try {
    // prepare payload cleanly
    const payload = {
      name: data.name.trim(),
      code: data.code?.trim() || undefined,
      classIds: data.classIds,
      teacherIds: data.teacherIds || [],
    };

    const response = await axios.post<SubjectResponse>(
      `${API_BASE_URL}/subject/create`,
      payload,
      getAuthHeaders()
    );

    return response.data;
  } catch (error: any) {
    // centralized, user-friendly error handling
    console.error("Create Subject Error:", error);
    const errMsg =
      error.response?.data?.error ||
      error.response?.data?.message ||
      error.message ||
      "Failed to create subject";
    throw new Error(errMsg);
  }
};

// 🔹 Get All Subjects (paginated)
export const getSubjects = async (params?: {
  page?: number;
  limit?: number;
}): Promise<{ subjects: SubjectResponse["subject"][]; pagination: any }> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/subject/all`, {
      ...getAuthHeaders(),
      params,
    });

    return {
      subjects: response.data.subjects || [],
      pagination: response.data.pagination || {
        currentPage: 1,
        totalPages: 1,
        total: 0,
      },
    };
  } catch (error: any) {
    throw error.response?.data || { message: "Failed to fetch subjects" };
  }
};

// 🔹 Delete Subject by ID
export const deleteSubject = async (subjectId: string) => {
  try {
    const response = await axios.delete(
      `${API_BASE_URL}/subject/${subjectId}`,
      getAuthHeaders()
    );
    return response.data; // { success, message }
  } catch (error: any) {
    throw error.response?.data || { message: "Failed to delete subject" };
  }
};

//✅ GET all teachers
export const getAllTeachers = async () => {
  try {
    // Make sure the endpoint points to /teachers/getall
    const response = await axios.get(`${API_BASE_URL}/teachers/getall`);

    // Assuming your backend returns { success: true, teachers: [...] }
    return response.data.teachers || [];
  } catch (error: any) {
    console.error("Error fetching teachers:", error);
    throw error.response?.data || error;
  }
};

// ✳️ UPDATE SUBJECT
export const updateSubject = async (subjectId: string, updatedData: any) => {
  try {
    const response = await axios.put(
      `${API_BASE_URL}/${subjectId}`,
      updatedData
    );
    return response.data;
  } catch (error: any) {
    console.error("Error updating subject:", error);
    throw error.response?.data || error;
  }
};

/* ==========================================================
   SUBJECT ASSIGNMENTS
   ========================================================== */

// 🔹 Assign Teacher to Subject
export const assignTeacher = async (data: {
  teacherId: string;
  subjectId: string;
}) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/subject/assign/teacher`,
      data, // { teacherId, subjectId }
      getAuthHeaders()
    );
    return response.data; // { success, message, subject }
  } catch (error: any) {
    throw error.response?.data || { message: "Failed to assign teacher" };
  }
};

// 🔹 Assign Class to Subject
export const assignClass = async (data: {
  classId: string;
  subjectId: string;
}) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/subject/assign/class`,
      data, // { classId, subjectId }
      getAuthHeaders()
    );
    return response.data; // { success, message, subject }
  } catch (error: any) {
    throw error.response?.data || { message: "Failed to assign class" };
  }
};

// 🔹 Toggle Assign/Unassign Teacher for a Subject
export const toggleSubjectTeacherAssignment = async (data: {
  subjectId: string;
  teacherId: string;
}) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/subject/subjects/toggle-teacher`, // matches your backend controller
      data,
      getAuthHeaders()
    );
    return response.data; // { success, message, subject }
  } catch (error: any) {
    throw (
      error.response?.data || { message: "Failed to assign/unassign teacher" }
    );
  }
};

/* ==========================================================
   SUBJECT FILTERS
   ========================================================== */

// 🔹 Get Subjects by Teacher
export const getSubjectsByTeacher = async (teacherId: string) => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/subject/teacher/${teacherId}`,
      getAuthHeaders()
    );
    return response.data; // { success, subjects }
  } catch (error: any) {
    throw (
      error.response?.data || {
        message: "Failed to fetch subjects for teacher",
      }
    );
  }
};

// 🔹 Get Subjects by Class
export const getSubjectsByClass = async (classId: string) => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/subject/class/${classId}`,
      getAuthHeaders()
    );
    return response.data; // { success, subjects }
  } catch (error: any) {
    throw (
      error.response?.data || { message: "Failed to fetch subjects for class" }
    );
  }
};
