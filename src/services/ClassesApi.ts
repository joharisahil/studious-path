
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const getAllClasses = async (page = 1, limit = 10) => {
  try {
    const token = localStorage.getItem("token");
    const response = await axios.get(
      `${API_BASE_URL}/class/getall?page=${page}&limit=${limit}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      }
    );
    return {
      classes: response.data.classes || [],
      pagination: response.data.pagination || { page, limit, totalPages: 1, totalResults: 0 },
      data: response.data.data || [],
    };
  } catch (error) {
    console.error("API getAllClasses failed:", error);
    throw error;
  }
};


export const createClass = async (classData: { grade: string; section: string }) => {
  try {
    const token = localStorage.getItem("token"); 

    const res = await axios.post(
      `${API_BASE_URL}/class/create`,
      classData,
      {
        headers: {
          Authorization: `Bearer ${token}`, 
        },
        withCredentials: true, 
      }
    );

    return res.data; 
  } catch (error: any) {
    throw error.response?.data || { error: "Something went wrong" };
  }
};

export const uploadStudentsExcelApi = async (file: File, classId: string, session: string) => {
  try {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("classId", classId);
    formData.append("session", session);

    const token = localStorage.getItem("token");

    const response = await axios.post(
      `${API_BASE_URL}/students/upload-excel/forStudent`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data;
  } catch (error: any) {
    console.error("❌ Error uploading Excel:", error.response || error.message);
    throw error;
  }
};