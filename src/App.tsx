import { useEffect, useState } from 'react'
import './App.css'
import Search from './components/Search'
import Spinner from './components/Spinner';
import MovieCard from './components/MovieCard';
import { useDebounce } from 'react-use';
import {getTrendingMovies, updateSearchCount} from './appwrite.ts'


const API_BASE_URL = 'https://api.themoviedb.org/3';

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

const API_OPTIONS = {
  method : "GET",
  headers: {
    accept: "application/json",
    Authorization: `Bearer ${API_KEY}`
  }
}

export interface Movie {
  id: number;                 // always useful for React keys
  title: string;
  vote_average: number;       // number → easier for maths / stars
  poster_path: string | null; // nullable if no poster
  release_date: string;       // "YYYY-MM-DD"
  original_language: string;
}

type MovieDocument = {
  $id: string;
  searchTerm: string;
  count: number;
  movie_id: number;
  poster_url: string;
  title: string;
  // + any other fields you added to the document
};

function App() {

  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')
  const [searchMovie, setSearchMovie] = useState('');
  const [error, setError] = useState('');
  const [movieList, setMovieList] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);
const [trendingMovies, setTrendingMovies] = useState<MovieDocument[]>([]);

  useDebounce(() => setDebouncedSearchTerm(searchMovie), 500, [searchMovie])

  const fetchMovies = async (query = '') => {

    setLoading(true);
    setError('');

    try {
      const endpoint = query ? 
      `${API_BASE_URL}/search/movie?query=${encodeURIComponent(query)}`:
      `${API_BASE_URL}/discover/movie?sort_by=popularity.desc`;

      const response = await fetch(endpoint, API_OPTIONS);

      if(!response.ok){
        throw new Error("failed to fetched movies");
      }
      const data = await response.json();

      if(data.response === 'False'){
        setError(data.error || 'failed to fetched movies');
        setMovieList([]);
      }

      setMovieList(data.results || [])

      if(query && data.results.length > 0){

        await updateSearchCount(query, data.results[0])
      }

    } catch (error) {
      console.error(`Error while fetching movies ${error}`);
      setError('Error while fetching movies');
    } finally{
      setLoading(false);
    }
  }

  const fetchTrendingMovies = async () => {
    try {
      const movies = await getTrendingMovies();
      setTrendingMovies(movies )
    } catch (error) {
      console.error(error)
    }
  }

  useEffect(() => {
    fetchMovies(debouncedSearchTerm);
  },[debouncedSearchTerm]);

  useEffect(() => {
fetchTrendingMovies()
  },[])

  return (
    <main>
      <div className="pattern"/>

      <div className="wrapper -mt-14">
        <header>
          <img  src="./hero.png" alt="Hero Banner" />
          <h1 className=''>Find <span className="text-gradient">Movies</span> You'll Enjoy Without the Hassle</h1>

          <Search searchMovie={searchMovie} setSearchMovie={setSearchMovie}/>
        </header>


        {trendingMovies.length > 0 && (
            <section className="trending">
            <h2>Trending Movies</h2>

            <ul>
              {trendingMovies.map((movie, index) => (
                <li key={movie.$id}>
                  <p>{index + 1}</p>
                  <img src={movie.poster_url} alt={movie.title} />
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="all-movies">
          <h2>All Movies</h2>

          {loading ? <Spinner /> : error ? (<p className="text-red-500">{error}</p>) : (
            <ul >
              {movieList.map((movie) => (
                <MovieCard key={movie.id} movie={movie}/>
                
              ))}
            </ul>
          ) }

          // {error && <p className="text-red-500">{error}</p>}
        </section>
      </div>
    </main>
  )
}

export default App
