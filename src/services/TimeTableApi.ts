import axios from "axios";
import API_BASE_URL from "@/config/api";


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
// Create a new period
export const createPeriod = async (data: {
  day: string;
  period: number;
  classId: string;
  subjectId: string;
  teacherId: string;
  room?: string;
}) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/timetable/period`,
      {
        day: data.day,
        periodNumber: data.period, 
        classId: data.classId,
        subjectId: data.subjectId,
        teacherId: data.teacherId,
        room: data.room,
      },
      getAuthHeaders()
    );
    return response.data;
  } catch (error: any) {
    console.error("Error creating period:", error);
    throw error.response?.data || { message: "Failed to create period" };
  }
};
