export interface ValidateTicketInput {
  qrCode: string;
  eventId: string;
}

export type ValidationResult =
  | { status: "VALID"; ticket: any }
  | { status: "INVALID"; reason: string }
  | { status: "ALREADY_USED"; usedAt: Date }
  | { status: "WRONG_EVENT"; reason: string };