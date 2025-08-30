
import React, { useState } from "react";
import Earth from "./components/Earth";

const weatherConfig = {
  0: { text: "Clear", icon: "☀️", color: "#FFD700", particleColor: "#FFD700" },
  1: { text: "Mostly Clear", icon: "🌤️", color: "#87CEEB", particleColor: "#87CEEB" },
  2: { text: "Partly Cloudy", icon: "⛅", color: "#B0C4DE", particleColor: "#B0C4DE" },
  3: { text: "Overcast", icon: "☁️", color: "#FFD700", particleColor: "#FFD700" },
  45: { text: "Fog", icon: "🌫️", color: "#D3D3D3", particleColor: "#D3D3D3" },
  61: { text: "Rain", icon: "🌧️", color: "#4682B4", particleColor: "#4682B4" },
  71: { text: "Snow", icon: "❄️", color: "#F0F8FF", particleColor: "#FFFFFF" },
  95: { text: "Thunderstorm", icon: "⛈️", color: "#FFA500", particleColor: "#FFD700" },
};

export default function App() {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState(null);
  const [coords, setCoords] = useState({ lat: null, lon: null });
  const [error, setError] = useState("");
  const [isDaytime, setIsDaytime] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const fetchWeather = async () => {
    if (!city.trim()) {
      setError("Please enter a city name");
      return;
    }
    try {
      setIsLoading(true);
      setError("");
      setWeather(null);
      setHasSearched(true);

      const geoRes = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`
      );
      const geoData = await geoRes.json();
      if (!geoData.results || geoData.results.length === 0) {
        setError("City not found. Try again!");
        setIsLoading(false);
        return;
      }

      const { latitude, longitude, name, country, timezone } = geoData.results[0];
      setCoords({ lat: latitude, lon: longitude });

      const weatherRes = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&timezone=${timezone}`
      );
      const weatherData = await weatherRes.json();

      const currentHour = new Date(weatherData.current_weather.time).getHours();
      setIsDaytime(currentHour > 6 && currentHour < 20);

      setWeather({
        city: name,
        country: country,
        temp: weatherData.current_weather.temperature,
        wind: weatherData.current_weather.windspeed,
        code: weatherData.current_weather.weathercode,
      });
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden text-white">
      {/* Globe details */}
      <Earth
        lat={coords.lat}
        lon={coords.lon}
        city={weather?.city}
        weather={weather}
        isDaytime={isDaytime}
        isSearching={isLoading}
      />

      {/* Fixed or postion Header */}
      <div className="absolute top-0 left-0 w-full z-20 p-4 flex justify-center">
        <div className="flex w-full max-w-2xl gap-2 p-2 rounded-2xl backdrop-blur-lg bg-black/30 border border-white/20 shadow-xl">
          <input
            type="text"
            placeholder="Search city..."
            value={city}
            onChange={(e) => setCity(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && fetchWeather()}
            className="flex-1 px-4 py-2 rounded-xl bg-white/10 text-white placeholder-gray-300 outline-none focus:ring-2 focus:ring-blue-400 transition"
          />
          <button
            onClick={fetchWeather}
            disabled={isLoading}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium shadow hover:opacity-90 disabled:opacity-50 transition"
          >
            {isLoading ? "..." : "Search"}
          </button>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="absolute top-20 w-full flex justify-center z-20">
          <p className="text-red-200 text-sm bg-red-500/30 px-4 py-2 rounded-lg shadow-lg">
            {error}
          </p>
        </div>
      )}

      {/* Weather info i assigend bottom */}
      {weather && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-full max-w-lg z-20">
          <div className="backdrop-blur-lg bg-black/40 rounded-2xl p-6 border border-white/20 shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold">{weather.city}, {weather.country}</h2>
                <p className="text-gray-300 text-sm">
                  {new Date().toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
              <div className="text-right">
                <p className="text-4xl font-bold">{weather.temp}°C</p>
                <p className="text-gray-300 text-sm">💨 {weather.wind} km/h</p>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-white/10 flex items-center">
              <span className="text-3xl mr-2">{weatherConfig[weather.code]?.icon || "🌤️"}</span>
              <span className="text-lg">{weatherConfig[weather.code]?.text || "Unknown"}</span>
            </div>
          </div>
        </div>
      )}

      {/* Initial prompt */}
      {!hasSearched && !isLoading && (
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div className="backdrop-blur-md bg-black/50 rounded-2xl p-6 border border-white/20 shadow-xl max-w-md text-center">
            <h2 className="text-xl font-bold mb-2">Discover Global Weather 🌍</h2>
            <p className="text-gray-300">Enter a city name above to see its live weather on the globe</p>
            <div className="mt-4 animate-bounce">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mx-auto text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
