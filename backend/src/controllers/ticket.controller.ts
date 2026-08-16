import { Request, Response } from "express";
import { validateTicket, getTicketForShare } from "../services/ticket.service";

export async function validate(req: Request, res: Response) {
  try {
    const { qrCode, eventId } = req.body;

    if (!qrCode || !eventId) {
      return res.status(400).json({ message: "qrCode e eventId são obrigatórios" });
    }

    const result = await validateTicket({ qrCode, eventId });

    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ message: "Erro ao validar ingresso" });
  }
}

export async function share(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const ticket = await getTicketForShare(id as string);
    return res.status(200).json(ticket);
  } catch (error) {
    return res.status(404).json({ message: (error as Error).message });
  }
}