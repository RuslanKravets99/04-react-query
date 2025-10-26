import { useState, useEffect } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import SearchBar from '../SearchBar/SearchBar';
import MovieGrid from '../MovieGrid/MovieGrid';
import Loader from '../Loader/Loader';
import ErrorMessage from '../ErrorMessage/ErrorMessage';
import MovieModal from '../MovieModal/MovieModal';
import type { Movie } from '../../types/movie';
import { fetchMovies } from '../../services/movieService';
import css from './App.module.css';
import { useQuery } from '@tanstack/react-query';
import ReactPaginate from 'react-paginate';

interface MoviesResponse {
  results: Movie[];
  total_pages: number;
}

export default function App() {
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);

  const handleSearch = (newQuery: string) => {
    setQuery(newQuery.trim());
    setPage(1);
  };

  const { data, isLoading, isError, isSuccess, isFetching } = useQuery<MoviesResponse, Error>({
    queryKey: ['movies', query, page],
    queryFn: () => fetchMovies(query as string, page as number),
    enabled: query.trim().length > 0,
    placeholderData: { results: [], total_pages: 0 },
  });

  const movies = data?.results ?? [];
  const totalPages = data?.total_pages ?? 0;

  useEffect(() => {
  if (isSuccess && !isFetching && query && movies.length === 0) {
    toast.error('No movies found for your request.');
  }
}, [isSuccess, isFetching, query, page, movies.length]);

  const showLoader = isLoading || isFetching;

  return (
    <div className={css.app}>
      <SearchBar onSubmit={handleSearch} />

      {query && totalPages > 1 && (
        <ReactPaginate
          pageCount={totalPages}
          pageRangeDisplayed={5}
          marginPagesDisplayed={1}
          onPageChange={({ selected }) => setPage(selected + 1)}
          forcePage={page - 1}
          containerClassName={css.pagination}
          activeClassName={css.active}
          nextLabel="→"
          previousLabel="←"
        />
      )}

      <main>
        {showLoader && <Loader />}
        {isError && <ErrorMessage />}
        {!showLoader && !isError && movies.length > 0 && (
          <MovieGrid movies={movies} onSelect={setSelectedMovie} />
        )}
        {!query && <p className={css.info}>Please enter a movie title to start searching.</p>}
      </main>

      {selectedMovie && (
        <MovieModal movie={selectedMovie} onClose={() => setSelectedMovie(null)} />
      )}

      <Toaster position="top-right" />
    </div>
  );
}
