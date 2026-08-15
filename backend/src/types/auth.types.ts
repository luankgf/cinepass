export interface RegisterInput {
  name: string;
  email: string;
  password: string;
  role: "ORGANIZER" | "CUSTOMER" | "GATEKEEPER";
}

export interface LoginInput {
  email: string;
  password: string;
}