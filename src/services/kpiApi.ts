import axios from "axios";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const getKpiData = async () => {
  try {
     const token = localStorage.getItem("token");
    if (!token) throw new Error("No token found");

    const res = await axios.get(
      `${API_BASE_URL}/register/admin/kpi`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return res.data; // { totalStudents, totalTeachers, pendingFees, totalFees, etc. }
  } catch (err) {
    console.error("Error fetching KPI data:", err);
    throw err.response?.data || { message: "Failed to load KPI data" };
  }
};