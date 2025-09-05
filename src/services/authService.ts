// src/services/authService.ts
import httpClient from "./httpClient";

export const register = async (data: { email: string; password: string; role: string }) => {
  const response = await httpClient.post("/register/admin", data);
  return response.data;
};

export const login = async (data: { email: string; password: string }) => {
  const response = await httpClient.post("/register/signin", data);
  return response.data;
};

export const logout = async () => {
  const response = await httpClient.post("/register/logout");
  return response.data;
};
