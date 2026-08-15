import { Request, Response } from "express";
import { processPayment } from "../services/payment.service";

export async function process(req: Request, res: Response) {
  try {
    const { reservationId, cardNumber, cardName } = req.body;

    if (!reservationId || !cardNumber || !cardName) {
      return res.status(400).json({
        message: "reservationId, cardNumber e cardName são obrigatórios",
      });
    }

    const customerId = req.user!.id;

    const result = await processPayment({
      reservationId,
      customerId,
      cardNumber,
      cardName,
    });

    return res.status(200).json(result);
  } catch (error) {
    return res.status(400).json({ message: (error as Error).message });
  }
}