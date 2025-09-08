import axios from "axios";
import API_BASE_URL from "@/config/api";

// Create Subject API
export const createSubject = async (data: { name: string; code: string }) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/subject/create`, 
      {
        name: data.name,
        code: data.code,
      },
      {
        withCredentials: true, // ensures HttpOnly cookie is sent
      }
    );

    return response.data;
  } catch (error: any) {
    throw (
      error.response?.data || { message: "Failed to create subject" }
    );
  }
};
