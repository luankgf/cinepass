export type Role = "ORGANIZER" | "CUSTOMER" | "GATEKEEPER";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export interface AuthResponse {
  user: User;
  token: string;
}