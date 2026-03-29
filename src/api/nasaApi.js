import axios from 'axios';

const NASA_KEY = 'DEMO_KEY'; // Ganti dengan API Key dari api.nasa.gov

export const getNasaAPOD = async () => {
  try {
    const res = await axios.get(`https://api.nasa.gov/planetary/apod?api_key=${NASA_KEY}`);
    return res.data;
  } catch (err) {
    console.error("NASA API Error:", err);
    return null;
  }
};
