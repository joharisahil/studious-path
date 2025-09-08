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
