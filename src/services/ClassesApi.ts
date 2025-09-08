// import axios from "axios";

// const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// export const getAllClasses = async () => {
//   const response = await axios.get(`${API_BASE_URL}/class/getall`);
//   return response.data.classes;
// };

import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const getAllClasses = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/class/getall`); // ✅ make sure "classes"
    return response.data.classes;
  } catch (error) {
    console.error("API getAllClasses failed:", error);
    throw error;
  }
};
