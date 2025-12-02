
import React, { useEffect, useState } from "react";
import axios from "../../../utils/axios";
import "./row.css";

import movieTrailer from "movie-trailer";
import YouTube from "react-youtube";

function Row({ title, fetchUrl, isLargeRow = false }) {
  const [movies, setMovies] = useState([]);
  const [trailerVideoId, setTrailerVideoId] = useState(""); // YouTube video id
  const [playingMovieId, setPlayingMovieId] = useState(null); // id of movie currently playing (for toggle)

  useEffect(() => {
    async function fetchData() {
      try {
        const request = await axios.get(fetchUrl);
        setMovies(request.data.results || []);
      } catch (error) {
        console.error("Row fetch error:", error);
      }
    }
    fetchData();
  }, [fetchUrl]);

  // click handler to open/close trailer
  const handleClick = async (movie) => {
    // toggle if user clicked the same movie again
    if (playingMovieId === movie.id) {
      setPlayingMovieId(null);
      setTrailerVideoId("");
      return;
    }

    // otherwise find trailer
    try {
      // movieTrailer accepts title and returns a full YouTube URL. We try several title fields.
      const name = movie?.name || movie?.title || movie?.original_name || "";
      const url = await movieTrailer(name, { id: false }); // returns full url by default; id:false keeps full url
      if (!url) {
        console.warn("No trailer found for:", name);
        setTrailerVideoId("");
        setPlayingMovieId(movie.id);
        return;
      }

      // extract the v= param (video id)
      const urlObj = new URL(url);
      const v = urlObj.searchParams.get("v");
      if (v) {
        setTrailerVideoId(v);
        setPlayingMovieId(movie.id);
      } else {
        // sometimes movie-trailer returns a youtu.be short link or other; fallback:
        // if it was a youtu.be link (pathname includes id) use that
        const pathnameId = urlObj.pathname.split("/").pop();
        if (pathnameId) {
          setTrailerVideoId(pathnameId);
          setPlayingMovieId(movie.id);
        } else {
          console.warn("Could not extract video id from trailer URL:", url);
          setTrailerVideoId("");
          setPlayingMovieId(movie.id);
        }
      }
    } catch (err) {
      console.error("movieTrailer error:", err);
      setTrailerVideoId("");
      setPlayingMovieId(movie.id);
    }
  };

  // YouTube player options
  const ytOpts = {
    height: "390",
    width: "640",
    playerVars: {
      autoplay: 1,
    },
  };

  const baseImgUrl = "https://image.tmdb.org/t/p/original";

  return (
    <div className="row">
      <h2>{title}</h2>

      <div className="row_posters">
        {movies.map((movie) => {
          // choose the correct image path, fallback to poster or backdrop
          const imagePath = isLargeRow
            ? movie?.poster_path || movie?.backdrop_path
            : movie?.backdrop_path || movie?.poster_path;

          // don't render if no image available (optional)
          if (!imagePath) {
            return null;
          }

          return (
            <img
              key={movie.id}
              className={`row_poster ${isLargeRow ? "row_posterLarge" : ""}`}
              src={`${baseImgUrl}${imagePath}`}
              alt={movie?.name || movie?.title || "movie poster"}
              onClick={() => handleClick(movie)}
              style={{ cursor: "pointer" }}
              title="Click to watch trailer"
            />
          );
        })}
      </div>

      {/* Trailer player: show only for the currently selected movie */}
      <div className="row_trailer">
        {trailerVideoId ? (
          <YouTube videoId={trailerVideoId} opts={ytOpts} />
        ) : playingMovieId ? (
          // user clicked a movie but no trailerVideoId was found
          <div className="no_trailer_message">Trailer not available.</div>
        ) : null}
      </div>
    </div>
  );
}

export default Row;
