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
    const token = localStorage.getItem("token"); 
    const response = await axios.get(`${API_BASE_URL}/class/getall`,
      {
        headers: {
          Authorization: `Bearer ${token}`, // verify token in backend
        },
        withCredentials: true, // optional, if you use cookies
      }
    ); // ✅ make sure "classes"
    return response.data.classes;
  } catch (error) {
    console.error("API getAllClasses failed:", error);
    throw error;
  }
};


export const createClass = async (classData: { grade: string; section: string }) => {
  try {
    const token = localStorage.getItem("token"); // token stored after login

    const res = await axios.post(
      `${API_BASE_URL}/class/create`,
      classData,
      {
        headers: {
          Authorization: `Bearer ${token}`, // verify token in backend
        },
        withCredentials: true, // optional, if you use cookies
      }
    );

    return res.data; // returns { success, message, class }
  } catch (error: any) {
    throw error.response?.data || { error: "Something went wrong" };
  }
};

