import axios from "axios";
import API_BASE_URL from "@/config/api";

export const getAllTeachers = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/teachers/getall`);
    return response.data.teachers;
  } catch (error: any) {
    console.error("Error fetching teachers:", error);
    throw error;
  }
};

export const createTeacher = async (teacherData) => {
  try {
    const res = await axios.post(`${API_BASE_URL}/teachers/create`, teacherData, {
      withCredentials: true, // 🔹 ensures cookies (JWT/session) are sent
    });
    return res.data;
  } catch (error) {
    throw error.response?.data || { error: "Something went wrong" };
  }
};


export const updateTeacher = async (id: string, teacherData: any) => {
  try {
    const res = await axios.put(`${API_BASE_URL}/teachers/${id}`, teacherData, {
      withCredentials: true, // ✅ if you are using cookies for auth
    });
    return res.data;
  } catch (error: any) {
    throw error.response?.data || { error: "Something went wrong" };
  }
};