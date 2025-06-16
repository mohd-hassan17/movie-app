
type props = {
    searchMovie: string,
    setSearchMovie: (value: string) => void
}

const Search = ({searchMovie, setSearchMovie} : props) => {
  return (
    <div className="search">
      <div>
        <img src="search.svg" alt="search" />

        <input
          type="text"
          placeholder="Search through thousands of movies"
          value={searchMovie}
          onChange={(event) => setSearchMovie(event.target.value)}
        />
      </div>
    </div>
  )
}
export default Search