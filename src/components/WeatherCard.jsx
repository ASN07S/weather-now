import React from "react";
import { Sun, Cloud, CloudRain, Snowflake, Wind } from "lucide-react";

const weatherCodes = {
  0: { text: "Clear sky", icon: <Sun size={40} className="text-yellow-400" /> },
  1: { text: "Mainly clear", icon: <Sun size={40} className="text-yellow-300" /> },
  2: { text: "Partly cloudy", icon: <Cloud size={40} className="text-gray-300" /> },
  3: { text: "Overcast", icon: <Cloud size={40} className="text-gray-500" /> },
  61: { text: "Rain", icon: <CloudRain size={40} className="text-blue-400" /> },
  71: { text: "Snow", icon: <Snowflake size={40} className="text-blue-200" /> },
  95: { text: "Thunderstorm", icon: <CloudRain size={40} className="text-purple-500" /> },
};

export default function WeatherCard({ weather }) {
  const details = weatherCodes[weather.code] || { text: "Weather", icon: <Cloud /> };

  return (
    <div className="backdrop-blur-xl bg-white/20 rounded-3xl shadow-2xl p-6 text-center w-80 border border-white/30">
      <div className="flex justify-center mb-2">{details.icon}</div>
      <h2 className="text-xl font-bold text-white drop-shadow-md">
        {weather.city}, {weather.country}
      </h2>
      <p className="text-5xl font-extrabold text-white mt-2 drop-shadow-lg">
        {weather.temp}°C
      </p>
      <p className="text-lg text-gray-100 mt-2">{details.text}</p>
      <p className="mt-2 text-gray-200 flex items-center justify-center gap-2">
        <Wind size={18} /> {weather.wind} km/h
      </p>
    </div>
  );
}
