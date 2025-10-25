import { useState } from 'react';
import { Toaster } from 'react-hot-toast';
import SearchBar from '../SearchBar/SearchBar';
import MovieGrid from '../MovieGrid/MovieGrid';
import Loader from '../Loader/Loader';
import ErrorMessage from '../ErrorMessage/ErrorMessage';
import MovieModal from '../MovieModal/MovieModal';
import type { Movie } from '../../types/movie';
import  { fetchMovies } from '../../service/movieService';
import css from './App.module.css';
import { useQuery } from "@tanstack/react-query";
import ReactPaginate from 'react-paginate';

export default function App() {
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);

 

  const handleSearch = (newQuery: string) => {
    setQuery(newQuery);
    setPage(1);
  };

  const { data, isLoading, isError } = useQuery({
  queryKey: ["movies", query, page],
  queryFn: () => fetchMovies(query, page),
  enabled: !!query,
  });
  const movies = data?.results ?? [];
  const totalPages = data?.total_pages ?? 0;

  return (
    <div className= {css.app}>
      <SearchBar onSubmit={handleSearch} />
      <main>
      {totalPages > 1 && (
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
  {isLoading && <Loader />}
  {isError && <ErrorMessage />}
  {!isLoading && !isError && movies.length > 0 && (
    <MovieGrid movies={movies} onSelect={setSelectedMovie} />
  )}
      </main>
      
      

      {selectedMovie && (
        <MovieModal movie={selectedMovie} onClose={() => setSelectedMovie(null)} />
      )}
      <Toaster position="top-right" />
    </div>
  );
}
