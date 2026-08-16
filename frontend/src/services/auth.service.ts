import { api } from "./api";
import type { AuthResponse } from "../types/auth";

interface LoginInput {
  email: string;
  password: string;
}

export async function login(data: LoginInput): Promise<AuthResponse> {
  const response = await api.post<AuthResponse>("/auth/login", data);
  return response.data;
}