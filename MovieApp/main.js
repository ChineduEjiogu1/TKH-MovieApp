const image_path = `https://image.tmdb.org/t/p/w1280`;

const API_KEY = import.meta.env.VITE_APP_MOVIE_API_KEY;

const input = document.querySelector(".search-bar input");

const btn = document.querySelector(".search-bar button");

const main_grid_title = document.querySelector(".favorites h1");

const main_grid = document.querySelector(".favorites .movies-grid");

const trending_grid = document.querySelector(".trending .movies-grid");

const popup_container = document.querySelector(".popup-container");

function addClickEffectToCard(cards) {
  cards.forEach((card) => {
    card.addEventListener("click", () => showPopup(card));
  });
}

async function getMovieBySearch(searchTerm) {
  const resp = await fetch(
    `https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&query=${searchTerm}`
  );
  const respData = await resp.json();
  console.log(respData);
  console.log(respData.results);
  return respData.results;
}

btn.addEventListener("click", addSearchedMoviesToDom);

async function addSearchedMoviesToDom() {
  const data = await getMovieBySearch(input.value);

  main_grid_title.innerText = `Search Results...`;
  main_grid.innerHTML = data
    .map((e) => {
      return `
       <div class="movie-card" data-id="${e.id}">
            <div class="img">
              <img src="${image_path + e.poster_path}">
            </div>
            <div class="info">
              <h2>${e.title}</h2>
              <div class="single-info">
                <span>Rate: </span>
                <span>${e.vote_average} / 10</span>
              </div>
              <div class="single-info">
                <span>Release Date: </span>
                <span>${e.release_date}</span>
              </div>
            </div>
          </div>
          `;
    })
    .join("");
  const cards = document.querySelectorAll(".movie-card");
  addClickEffectToCard(cards);
}

//popup

async function getMovieById(id) {
  const resp = await fetch(
    `https://api.themoviedb.org/3/movie/${id}?api_key=${API_KEY}`
  );
  const respData = await resp.json();
  console.log(respData);
  return respData;
}

async function getMovieTrailer(id) {
  const resp = await fetch(
    `https://api.themoviedb.org/3/movie/${id}/videos?api_key=${API_KEY}`
  );
  const respData = await resp.json();
  return respData.results[0].key;
}

async function showPopup(card) {
  popup_container.classList.add("show-popup");

  const movieId = card.getAttribute("data-id");
  const movie = await getMovieById(movieId);
  // console.log(movie);
  const movieTrailer = await getMovieTrailer(movieId);
  // console.log(image_path + movie.poster_path);

  // console.log(movieTrailer);
  popup_container.style.background = `linear-gradient(rgba(0, .0, .0, .8), rgba(0, .0, .0, .5)), url(${
    image_path + movie.poster_path
  })`;

  popup_container.innerHTML = ` 
  <span class="x-button">&#10006;</span>
    <div class="content">
        <div class="left">
            <div class="poster-img">
                <img src="${image_path + movie.poster_path}" alt="">
            </div>
            <div class="single-info">
                <span>Add to favorites:</span>
                <span class="heart-icon">&#9829;</span>
            </div>
        </div>
        <div class="right">
            <h1>${movie.title}</h1>
            <h3>${movie.tagline}</h3>
            <div class="single-info-container">
                <div class="single-info">
                    <span>Language:</span>
                    <span>${movie.spoken_languages[0].name}</span>
                </div>
                <div class="single-info">
                    <span>Length:</span>
                    <span>${movie.runtime} minutes</span>
                </div>
                <div class="single-info">
                    <span>Rate:</span>
                    <span>${movie.vote_average} / 10</span>
                </div>
                <div class="single-info">
                    <span>Budget:</span>
                    <span>$ ${movie.budget}</span>
                </div>
                <div class="single-info">
                    <span>Release Date:</span>
                    <span>${movie.release_date}</span>
                </div>
            </div>
            <div class="genres">
                <h2>Genres</h2>
                <ul>
                    ${movie.genres.map((e) => `<li>${e.name}</li>`).join("")}
                </ul>
            </div>
            <div class="overview">
                <h2>Overview</h2>
                <p>${movie.overview}</p>
            </div>
            <div class="trailer">
                <h2>Trailer</h2>
                <iframe width="560" height="315" src="https://www.youtube.com/embed/${movieTrailer}" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
            </div>
        </div>
    </div>
  `;

  const xIcon = document.querySelector(".x-button");
  xIcon.addEventListener("click", () =>
    popup_container.classList.remove("show-popup")
  );

  const heartIcon = popup_container.querySelector(".heart-icon");

  const movieIds = getLocalStorage();

  for (let i = 0; i <= movieIds.length; i++) {
    if (movieIds[i] == movieId) 
      heartIcon.classList.add("change-color");
  }

  heartIcon.addEventListener("click", () => {
    if (heartIcon.classList.contains("change-color")) {
      removeLocalStorage(movieId);
      heartIcon.classList.remove("change-color");
    } else {
      addToLocalStorage(movieId);
      heartIcon.classList.add("change-color");
    }
    fetchFavoriteMovies();
  });
}

// local storage
function getLocalStorage() {
  const movieIds = JSON.parse(localStorage.getItem("movie-id"));
  return movieIds === null ? [] : movieIds;
}

function addToLocalStorage(id) {
  const movieIds = getLocalStorage();
  localStorage.setItem("movie-id", JSON.stringify([...movieIds, id]));
}

function removeLocalStorage(id) {
  const movieIds = getLocalStorage();
  localStorage.setItem(
    "movie-id",
    JSON.stringify(movieIds.filter((e) => e !== id))
  );
}

//favorite Movies
fetchFavoriteMovies();
async function fetchFavoriteMovies() {
  main_grid.innerHTML = "";

  const moviesLocalStorage = await getLocalStorage();
  const movies = [];
  for (let i = 0; i <= moviesLocalStorage.length - 1; i++) {
    const movieId = moviesLocalStorage[i];
    let movie = await getMovieById(movieId);
    addFavoritesToDomFromLocalStorage(movie);
    movies.push(movie);
  }
}

function addFavoritesToDomFromLocalStorage(movieData) {
  main_grid.innerHTML += `
  <div class="movie-card" data-id="${movieData.id}">
  <div class="img">
    <img src="${image_path + movieData.poster_path}">
  </div>
  <div class="info">
    <h2>${movieData.title}</h2>
    <div class="single-info">
      <span>Rate: </span>
      <span>${movieData.vote_average} / 10</span>
    </div>
    <div class="single-info">
      <span>Release Date: </span>
      <span>${movieData.release_date}</span>
    </div>
  </div>
</div>
  `;

  const cards = document.querySelectorAll(".movie-card");
  addClickEffectToCard(cards);
}

getTrendingMovies();
async function getTrendingMovies() {
  const resp = await fetch(
    `https://api.themoviedb.org/3/trending/all/day?api_key=${API_KEY}`
  );
  const respData = await resp.json();
  console.log(respData.results);
  return respData.results;
}

addToDomTrending();
async function addToDomTrending() {
  const data = await getTrendingMovies();

  console.log(data);

  trending_grid.innerHTML = data
    .slice(0, 10)
    .map((e) => {
      return `
      <div class="movie-card" data-id="${e.id}">
        <div class="img">
          <img src="${image_path + e.poster_path}">
        </div>
        <div class="info">
          <h2>${e.title}</h2>
          <div class="single-info">
            <span>Rate: </span>
            <span>${e.vote_average} / 10</span>
          </div>
          <div class="single-info">
            <span>Release Date: </span>
            <span>${e.release_date}</span>
          </div>
        </div>
      </div>
    `;
    })
    .join("");
}