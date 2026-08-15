import { Request, Response } from "express";
import {
  createEvent,
  publishEvent,
  listPublishedEvents,
  getEventById,
  listOrganizerEvents,
} from "../services/event.service";

export async function create(req: Request, res: Response) {
  try {
    const { date, location, capacity, price, tmdbId } = req.body;

    if (!date || !location || !capacity || !price || !tmdbId) {
      return res.status(400).json({ message: "Todos os campos são obrigatórios" });
    }

    const organizerId = req.user!.id;

    const event = await createEvent({
      date,
      location,
      capacity,
      price,
      tmdbId,
      organizerId,
    });

    return res.status(201).json(event);
  } catch (error) {
    return res.status(400).json({ message: (error as Error).message });
  }
}

export async function publish(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const organizerId = req.user!.id;

    const event = await publishEvent(id as string, organizerId);

    return res.status(200).json(event);
  } catch (error) {
    return res.status(400).json({ message: (error as Error).message });
  }
}

export async function listPublished(req: Request, res: Response) {
  try {
    const events = await listPublishedEvents();
    return res.status(200).json(events);
  } catch (error) {
    return res.status(500).json({ message: "Erro ao listar eventos" });
  }
}

export async function getById(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const event = await getEventById(id as string);
    return res.status(200).json(event);
  } catch (error) {
    return res.status(404).json({ message: (error as Error).message });
  }
}

export async function listMine(req: Request, res: Response) {
  try {
    const organizerId = req.user!.id;
    const events = await listOrganizerEvents(organizerId);
    return res.status(200).json(events);
  } catch (error) {
    return res.status(500).json({ message: "Erro ao listar seus eventos" });
  }
}