import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// ✅ Attach token for authenticated requests
const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  if (!token) {
    throw new Error("No auth token found");
  }

  return {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  };
};


//
// 1. Fee Structures
export const createFeeStructure = async (payload: {
  classIds: string[];
  session: string;
  monthDetails: {
    month: string;
    startDate: string;
    dueDate: string;
    amount: number;
    lateFine?: number;
  }[];
}) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/fees/structures`,
      payload,
      getAuthHeaders()
    );
    return response.data;
  } catch (error: any) {
    console.error("API createFeeStructure failed:", error.response?.data || error.message);
    throw error.response?.data || error;
  }
};


export const getFeeStructures = async () => {
  try {
    const res = await axios.get(
      `${API_BASE_URL}/fees/structures`,
      getAuthHeaders()
    );
    return res.data;
  } catch (error) {
    console.error("API getFeeStructures failed:", error);
    throw error;
  }
};

export const getFeeStructureByClass = async (classId: string): Promise<FeeStructure> => {
  try {
    const res = await axios.get(
      `${API_BASE_URL}/fees/structures/${classId}`,
      getAuthHeaders()
    );

    const raw = res.data;

    // Transform response
    return {
      id: raw._id,
      classId: raw.classId?._id,
      session: raw.session,
      status: raw.status,
      totalAmount: raw.totalAmount,
      months: raw.monthDetails.map((m: any) => ({
        month: m.month,
        startDate: m.startDate,
        dueDate: m.dueDate,
        amount: m.amount,
        lateFine: m.lateFine
      }))
    };
  } catch (error) {
    console.error("API getFeeStructureByClass failed:", error);
    throw error;
  }
};


//
// 2. Assign Fee to Student
//
export const assignFeeToStudent = async (data: any) => {
  try {
    const res = await axios.post(
      `${API_BASE_URL}/fees/assign`,
      data,
      getAuthHeaders()
    );
    return res.data;
  } catch (error) {
    console.error("API assignFeeToStudent failed:", error);
    throw error;
  }
};

//
// 3. Collect Fee
//
export const collectFee = async (studentFeeId: string, data: any) => {
  try {
    const res = await axios.post(
      `${API_BASE_URL}/fees/${studentFeeId}/pay`,
      data,
      getAuthHeaders()
    );
    return res.data;
  } catch (error) {
    console.error("API collectFee failed:", error);
    throw error;
  }
};

//
// 4. Student Fee Records
//
export const getStudentFee = async (studentId: string) => {
  try {
    const res = await axios.get(
      `${API_BASE_URL}/fees/student/${studentId}`,
      getAuthHeaders()
    );
    return res.data;
  } catch (error) {
    console.error("API getStudentFee failed:", error);
    throw error;
  }
};

//
// 1️⃣ Get All Fee Structures
//
export const getAllFeeStructures = async () => {
  try {
    const res = await axios.get(
      `${API_BASE_URL}/fees/structures`,
      getAuthHeaders()
    );
    return res.data;
  } catch (error: any) {
    console.error("API getAllFeeStructures failed:", error.response?.data || error.message);
    throw error;
  }
};


//
// 2️⃣ Update Fee Structure
//
export const updateFeeStructure = async (structureId: string, monthDetails: any[]) => {
  try {
    const res = await axios.put(
      `${API_BASE_URL}/fees/structures/${structureId}`,
      { monthDetails },
      getAuthHeaders()
    );
    return res.data;
  } catch (error: any) {
    console.error("API updateFeeStructure failed:", error.response?.data || error.message);
    throw error;
  }
};

//
// 3️⃣ Delete Fee Structure
//
export const deleteFeeStructure = async (structureId: string) => {
  try {
    const res = await axios.delete(
      `${API_BASE_URL}/fees/delete/${structureId}`,
      getAuthHeaders()
    );
    return res.data;
  } catch (error: any) {
    console.error("API deleteFeeStructure failed:", error.response?.data || error.message);
    throw error;
  }
}