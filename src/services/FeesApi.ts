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
    console.error(
      "API createFeeStructure failed:",
      error.response?.data || error.message
    );
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

export const getFeeStructureByClass = async (
  classId: string
): Promise<FeeStructure> => {
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
        lateFine: m.lateFine,
      })),
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
export const collectFee = async (registrationNumber: string, data: any) => {
  try {
    const res = await axios.post(
      `${API_BASE_URL}/fees/collect`,
      { ...data, registrationNumber },
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
export const getStudentFee = async (registrationNumber: string) => {
  try {
    const res = await axios.get(
      `${API_BASE_URL}/fees/student/regno/${registrationNumber}`,
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
    console.error(
      "API getAllFeeStructures failed:",
      error.response?.data || error.message
    );
    throw error;
  }
};

//
// 2️⃣ Update Fee Structure
//
export const updateFeeStructure = async (
  structureId: string,
  monthDetails: any[]
) => {
  try {
    const res = await axios.put(
      `${API_BASE_URL}/fees/structures/${structureId}`,
      { monthDetails },
      getAuthHeaders()
    );
    return res.data;
  } catch (error: any) {
    console.error(
      "API updateFeeStructure failed:",
      error.response?.data || error.message
    );
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
    console.error(
      "API deleteFeeStructure failed:",
      error.response?.data || error.message
    );
    throw error;
  }
};
export const applyScholarship = async (
  registrationNumber: string,
  data: ScholarshipFormData
) => {
  try {
    const res = await axios.post(
      `${API_BASE_URL}/fees/${registrationNumber}/scholarship`, // registrationNumber in URL
      data,
      getAuthHeaders()
    );
    return res.data;
  } catch (error) {
    console.error("API applyScholarship failed:", error);
    throw error;
  }
};

export interface SearchFilters {
  status?: string;
  scholarship?: string;
  scholarshipType?: string;
  grade?: string;
  period?: string;
  registrationNumber?: string;
  studentName?: string;
  minAmount?: number;
  maxAmount?: number;
  overdue?: boolean;
  session?: string;
  page?: number;
  limit?: number;
}

export const fetchFilteredFees = async (filters: SearchFilters) => {
  try {
    const params: any = {};

    if (filters.status && filters.status !== "all")
      params.status = filters.status;
    if (filters.scholarship && filters.scholarship !== "all")
      params.scholarship = filters.scholarship;
    if (filters.scholarshipType && filters.scholarshipType !== "all")
      params.scholarshipType = filters.scholarshipType;
    if (filters.grade && filters.grade !== "all") params.grade = filters.grade;
    if (filters.period && filters.period !== "all")
      params.period = filters.period;
    if (filters.registrationNumber)
      params.registrationNumber = filters.registrationNumber;
    if (filters.studentName) params.studentName = filters.studentName;
    if (filters.minAmount) params.minAmount = filters.minAmount;
    if (filters.maxAmount) params.maxAmount = filters.maxAmount;
    if (filters.overdue !== undefined) params.overdue = filters.overdue;
    if (filters.session) params.session = filters.session;
    if (filters.page) params.page = filters.page;
    if (filters.limit) params.limit = filters.limit;

    const token = localStorage.getItem("token"); // Get your JWT token
    const response = await axios.get(`${API_BASE_URL}/fees/search`, {
      headers: {
        Authorization: `Bearer ${token}`, // ✅ send token in header
      },
      params, // query params
    });

    return response.data; // { fees: [...], totalStudents, totalCollected, totalPending, page, limit }
  } catch (error) {
    console.error("Error fetching filtered fees:", error);
    throw error;
  }
};
