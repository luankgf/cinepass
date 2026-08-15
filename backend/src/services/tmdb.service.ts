import axios from "axios";

const TMDB_BASE_URL = "https://api.themoviedb.org/3";

interface TMDbMovieResult {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  release_date: string;
}

interface TMDbSearchResponse {
  results: TMDbMovieResult[];
}

export async function searchMovies(query: string) {
  const apiKey = process.env.TMDB_API_KEY;

  const response = await axios.get<TMDbSearchResponse>(
    `${TMDB_BASE_URL}/search/movie`,
    {
      params: {
        api_key: apiKey,
        query,
        language: "pt-BR",
      },
    }
  );

  return response.data.results.map((movie) => ({
    tmdbId: movie.id,
    title: movie.title,
    overview: movie.overview,
    posterUrl: movie.poster_path
      ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
      : null,
    releaseDate: movie.release_date || null,
  }));
}

export async function getMovieDetails(tmdbId: number) {
  const apiKey = process.env.TMDB_API_KEY;

  const response = await axios.get<TMDbMovieResult>(
    `${TMDB_BASE_URL}/movie/${tmdbId}`,
    {
      params: {
        api_key: apiKey,
        language: "pt-BR",
      },
    }
  );

  const movie = response.data;

  return {
    tmdbId: movie.id,
    title: movie.title,
    overview: movie.overview,
    posterUrl: movie.poster_path
      ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
      : null,
    releaseDate: movie.release_date || null,
  };
}