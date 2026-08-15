import { Request, Response } from "express";
import { searchMovies } from "../services/tmdb.service";

export async function search(req: Request, res: Response) {
  try {
    const { query } = req.query;

    if (!query || typeof query !== "string") {
      return res.status(400).json({ message: "Parâmetro 'query' é obrigatório" });
    }

    const movies = await searchMovies(query);

    return res.status(200).json(movies);
  } catch (error) {
    return res.status(500).json({ message: "Erro ao buscar filmes na TMDb" });
  }
}