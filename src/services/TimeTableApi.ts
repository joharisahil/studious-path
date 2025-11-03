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

interface AutoGeneratePayload {
  classId: string;
  numberOfDays: number;
  periodsPerDay: number;
}

export const autoGenerateTimetable = async (data: AutoGeneratePayload) => {
  try {
    const token = localStorage.getItem("token");
    const headers = {
      Authorization: token ? `Bearer ${token}` : "",
      "Content-Type": "application/json",
    };

    const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const days = daysOfWeek.slice(0, data.numberOfDays);

    const payload = {
      classId: data.classId,
      days,
      periodsPerDay: data.periodsPerDay,
    };

    const res = await axios.post(`${API_BASE_URL}/timetable/auto-generate`, payload, { headers });
    return res.data;
  } catch (error: any) {
    console.error("Error auto-generating timetable:", error);
    throw error.response?.data || error;
  }
};

export interface FindFreeTeachersPayload {
  day: string;
  periodNumber: number;
}

export const findFreeTeachers = async (payload: FindFreeTeachersPayload) => {
  const token = localStorage.getItem("token");
  const response = await axios.post(`${API_BASE_URL}/timetable/free-teachers`, payload, {
    headers: {
      Authorization: token ? `Bearer ${token}` : "",
      "Content-Type": "application/json",
    },
  });
  return response.data;
};

export const getClassTimetable = async (classId: string) => {
  try {
    const res = await axios.get(
      `${API_BASE_URL}/timetable/class/${classId}`,
      getAuthHeaders()
    );
    return res.data.timetable || [];
  } catch (error) {
    console.error("Error fetching class timetable:", error);
    throw error;
  }
};

// Get Teacher Timetable
export const getTeacherTimetable = async (teacherId: string) => {
  try {
    const res = await axios.get(
      `${API_BASE_URL}/timetable/teacher/${teacherId}`,
      getAuthHeaders()
    );
    return res.data.timetable || [];
  } catch (error) {
    console.error("Error fetching teacher timetable:", error);
    throw error;
  }
};

export const getPeriodByClassDayPeriod = async (classId: string, day: string, period: number) => {
  const res = await axios.get(
    `${API_BASE_URL}/timetable/getperiod/${classId}/${day}/${period}`,
    getAuthHeaders()
  );
  return res.data.period;
};

export const updatePeriod = async (periodId: string, data: any) => {
  const res = await axios.put(
    `${API_BASE_URL}/timetable/update/${periodId}`,
    data,
    getAuthHeaders()
  );
  return res.data;
};