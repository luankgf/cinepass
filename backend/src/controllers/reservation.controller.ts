import { Request, Response } from "express";
import { createReservation } from "../services/reservation.service";

export async function create(req: Request, res: Response) {
  try {
    const { eventId, seatIds } = req.body;

    if (!eventId || !seatIds || !Array.isArray(seatIds)) {
      return res.status(400).json({ message: "eventId e seatIds (array) são obrigatórios" });
    }

    const customerId = req.user!.id;

    const reservation = await createReservation({ customerId, eventId, seatIds });

    return res.status(201).json(reservation);
  } catch (error) {
    return res.status(400).json({ message: (error as Error).message });
  }
}