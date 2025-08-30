// Earth.jsx
import React, { useRef, useEffect, useState } from "react";
import Globe from "react-globe.gl";

// Weather condition details with mapping emojis
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

export default function Earth({ lat, lon, city, weather, isDaytime, isSearching }) {
  const globeRef = useRef();
  const [points, setPoints] = useState([]);
  const [labels, setLabels] = useState([]);
  const [arcs, setArcs] = useState([]);
  const [particles, setParticles] = useState([]);
  const [isGlobeReady, setIsGlobeReady] = useState(false);

  // Globe textures
  const globeImage = isDaytime
    ? "//unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
    : "//unpkg.com/three-globe/example/img/earth-night.jpg";

  const backgroundImage = "//unpkg.com/three-globe/example/img/night-sky.png";

  useEffect(() => {
    const timer = setTimeout(() => setIsGlobeReady(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isGlobeReady && globeRef.current) {
      if (lat && lon) {
        // Smooth camera zoom
        globeRef.current.pointOfView(
          { lat: lat + 3, lng: lon, altitude: 2 },
          2000
        );

        // Marker point
        setPoints([{ lat, lng: lon, size: 1.2 }]);

        // Arcs → fewer, thinner, smoother
        const newArcs = [];
        for (let i = 0; i < 5; i++) {
          const randomLat = Math.random() * 180 - 90;
          const randomLng = Math.random() * 360 - 180;
          newArcs.push({
            startLat: randomLat,
            startLng: randomLng,
            endLat: lat,
            endLng: lon,
            color: weather
              ? [weatherConfig[weather.code]?.color || "#FFD700", "#ffffff"]
              : ["#FFD700", "#ffffff"],
          });
        }
        setArcs(newArcs);

        // Particles
        if (weather) {
          const condition = weatherConfig[weather.code] || weatherConfig[0];
          const newParticles = [];
          for (let i = 0; i < 25; i++) {
            const offsetLat = (Math.random() - 0.5) * 6;
            const offsetLng = (Math.random() - 0.5) * 6;
            newParticles.push({
              lat: lat + offsetLat,
              lng: lon + offsetLng,
              color: condition.particleColor,
              size: Math.random() * 0.6 + 0.4,
              altitude: Math.random() * 0.2 + 0.05,
            });
          }
          setParticles(newParticles);
        }

        // Label text (fixed ?? issue + yellow color)
        if (weather) {
          const condition = weatherConfig[weather.code] || weatherConfig[0];
          setLabels([
            {
              lat,
              lng: lon,
              text: `${condition.icon} ${condition.text}\n${city}, ${weather.country}\n🌡 ${weather.temp}°C | 💨 ${weather.wind} km/h`,
              color: "#FFD700", // Force yellow
              size: 1.1,
            },
          ]);
        }
      } else {
        globeRef.current.pointOfView({ lat: 0, lng: 0, altitude: 2.5 }, 1000);
      }
    }
  }, [lat, lon, city, weather, isGlobeReady]);

  // Idle rotation
  useEffect(() => {
    if (isGlobeReady && globeRef.current && !lat && !isSearching) {
      const globe = globeRef.current;
      let animationFrameId;
      const rotateGlobe = () => {
        globe.pointOfView({ lng: globe.pointOfView().lng + 0.05 }, 0);
        animationFrameId = requestAnimationFrame(rotateGlobe);
      };
      rotateGlobe();
      return () => cancelAnimationFrame(animationFrameId);
    }
  }, [isGlobeReady, lat, isSearching]);

  return (
    <div className="w-full h-screen relative overflow-hidden">
      {/* Background gradient */}
      <div
        className={`absolute inset-0 transition-all duration-1000 ${
          isDaytime
            ? "bg-gradient-to-b from-blue-200 to-blue-400"
            : "bg-gradient-to-b from-blue-900 to-black"
        }`}
      ></div>

      {/* Globe */}
      <div className="absolute inset-0">
        <Globe
          ref={globeRef}
          globeImageUrl={globeImage}
          bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
          backgroundImageUrl={backgroundImage}
          showAtmosphere={true}
          atmosphereColor={
            isDaytime ? "rgba(100,150,255,0.4)" : "rgba(0,0,50,0.3)"
          }
          atmosphereAltitude={0.25}
          // Marker
          pointsData={points}
          pointColor={() => "orange"}
          pointAltitude={0.02}
          pointRadius={0.5}
          pointResolution={32}
          // Arcs
          arcsData={arcs}
          arcColor={"color"}
          arcDashLength={0.4}
          arcDashGap={0.3}
          arcDashAnimateTime={4000}
          arcStroke={0.5}
          // Weather particles
          htmlElementsData={particles}
          htmlElement={(d) => {
            const el = document.createElement("div");
            el.style.width = `${d.size * 8}px`;
            el.style.height = `${d.size * 8}px`;
            el.style.background = d.color;
            el.style.borderRadius = "50%";
            el.style.opacity = "0.7";
            el.style.boxShadow = `0 0 6px ${d.color}, 0 0 12px ${d.color}`;
            return el;
          }}
          // Labels
          labelsData={labels}
          labelText="text"
          labelSize={0.9}
          labelDotRadius={0.5}
          labelColor={() => "#FFD700"}
          labelAltitude={0.08}
          labelResolution={4}
        />
      </div>
    </div>
  );
}