import axios from "axios";

const API_URL = "http://localhost:4000/api/v1"; // adjust if different

// Fetch all students
export const getAllStudents = async () => {
  try {
    const response = await axios.get(`${API_URL}/students/getall`);
    return response.data.students; // because your backend sends { success, students }
  } catch (error: any) {
    console.error("Error fetching students:", error);
    throw error;
  }
};
