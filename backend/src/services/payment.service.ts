import crypto from "crypto";
import { prisma } from "../lib/prisma";
import { ProcessPaymentInput } from "../types/payment.types";

const APPROVED_TEST_CARD = "4242424242424242";
const REJECTED_TEST_CARD = "4000000000000002";

export async function processPayment(data: ProcessPaymentInput) {
  const { reservationId, customerId, cardNumber, cardName } = data;

  const cleanCardNumber = cardNumber.replace(/\s/g, "");

  if (!cardName || cardName.trim().length === 0) {
    throw new Error("Nome no cartão é obrigatório");
  }

  let outcome: "APPROVED" | "REJECTED";

  if (cleanCardNumber === APPROVED_TEST_CARD) {
    outcome = "APPROVED";
  } else if (cleanCardNumber === REJECTED_TEST_CARD) {
    outcome = "REJECTED";
  } else {
    throw new Error(
      "Cartão de teste inválido. Use 4242 4242 4242 4242 (aprovado) ou 4000 0000 0000 0002 (recusado)"
    );
  }

  const reservation = await prisma.reservation.findUnique({
    where: { id: reservationId },
    include: { seats: { include: { seat: true } }, event: true },
  });

  if (!reservation) {
    throw new Error("Reserva não encontrada");
  }

  if (reservation.customerId !== customerId) {
    throw new Error("Esta reserva não pertence a você");
  }

  if (reservation.status !== "PENDING") {
    throw new Error("Esta reserva já foi processada");
  }

  if (outcome === "REJECTED") {
    return prisma.$transaction(async (tx) => {
      await tx.payment.create({
        data: {
          reservationId,
          status: "REJECTED",
          amount: reservation.event.price,
        },
      });

      await tx.reservationSeat.deleteMany({
        where: { reservationId },
      });

      return tx.reservation.update({
        where: { id: reservationId },
        data: { status: "REJECTED" },
      });
    });
  }

  return prisma.$transaction(async (tx) => {
    await tx.payment.create({
      data: {
        reservationId,
        status: "APPROVED",
        amount: reservation.event.price,
      },
    });

    const confirmedReservation = await tx.reservation.update({
      where: { id: reservationId },
      data: { status: "CONFIRMED" },
    });

    for (const reservationSeat of reservation.seats) {
      const qrCode = generateQrCode(reservationSeat.id);

      await tx.ticket.create({
        data: {
          customerId,
          reservationSeatId: reservationSeat.id,
          qrCode,
        },
      });
    }

    return tx.reservation.findUnique({
      where: { id: confirmedReservation.id },
      include: {
        seats: { include: { seat: true, ticket: true } },
        payment: true,
      },
    });
  });
}

function generateQrCode(reservationSeatId: string) {
  const secret = process.env.JWT_SECRET as string;
  const signature = crypto
    .createHmac("sha256", secret)
    .update(reservationSeatId)
    .digest("hex")
    .slice(0, 16);

  return `${reservationSeatId}.${signature}`;
}