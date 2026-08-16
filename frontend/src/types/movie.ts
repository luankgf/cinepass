export interface Movie {
  id: string;
  tmdbId: number;
  title: string;
  overview: string;
  posterUrl: string | null;
  releaseDate: string | null;
}