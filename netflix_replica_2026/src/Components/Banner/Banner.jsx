
import React, { useEffect, useState } from "react";
import axios from "../../utils/axios"; 
import requests from "../../utils/requests"; 
import "./banner.css";

function Banner() {
  const [movie, setMovie] = useState(null);

  useEffect(() => {
    let isMounted = true; // avoid state update if unmounted

    async function fetchData() {
      try {
        const response = await axios.get(requests.fetchTrending); // change to fetchNetflixOriginals if you prefer
        const results = response?.data?.results || [];

        if (!results.length) {
          setMovie(null);
          return;
        }

        // pick a random movie/show from results
        const randomIndex = Math.floor(Math.random() * results.length);
        if (isMounted) setMovie(results[randomIndex]);
      } catch (err) {
        console.error("Banner fetch error:", err);
        if (isMounted) setMovie(null);
      }
    }

    fetchData();

    return () => {
      isMounted = false;
    };
  }, []);

  // helper to shorten long descriptions
  function truncate(str, n) {
    if (!str) return "";
    return str.length > n ? str.substr(0, n - 1) + "…" : str;
  }

  // safe guard if movie is not loaded yet
  if (!movie) {
    return <div className="banner loading">Loading...</div>;
  }

  // image path fallback: prefer backdrop, else poster
  const backgroundPath = movie.backdrop_path || movie.poster_path;
  const backgroundUrl = backgroundPath
    ? `https://image.tmdb.org/t/p/original${backgroundPath}`
    : "";

  const title = movie.title || movie.name || movie.original_name || "Untitled";

  return (
    <header
      className="banner"
      style={{
        backgroundSize: "cover",
        backgroundImage: backgroundUrl ? `url("${backgroundUrl}")` : "none",
        backgroundPosition: "center center",
      }}
    >
      <div className="banner_contents">
        <h1 className="banner_title">{title}</h1>

        <div className="banner_buttons">
          <button className="banner_button">Play</button>
          <button className="banner_button banner_button_outline">
            My List
          </button>
        </div>

        <p className="banner_description">{truncate(movie.overview, 150)}</p>
      </div>

      <div className="banner--fadeBottom" />
    </header>
  );
}

export default Banner;
