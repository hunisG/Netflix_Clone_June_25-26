import axios from 'axios';

import React from 'react'

const instance = axios.create({
  baseURL: "https://api.themoviedb.org/3",
});

export default instance;
