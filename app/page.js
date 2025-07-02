"use client";

import Image from "next/image";
import styles from "./page.module.css";
import { useEffect, useState, useRef } from "react";
import Link from "next/link";

const calculateDistance = (pos1, pos2) => {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (pos1.latitude * Math.PI) / 180;
  const φ2 = (pos2.latitude * Math.PI) / 180;
  const Δφ = ((pos2.latitude - pos1.latitude) * Math.PI) / 180;
  const Δλ = ((pos2.longitude - pos1.longitude) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
};

const formatDistance = (meters) => {
  if (meters >= 1000) {
    return `${(meters / 1000).toFixed(2)} km`;
  } else {
    return `${meters.toFixed(0)} m`;
  }
};

export default function Home() {
  const [location, setLocation] = useState({});
  const [currentPosition, setCurrentPosition] = useState({});
  const [isTracking, setIsTracking] = useState(false);
  const [hasLocationPermission, setHasLocationPermission] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [prevDistance, setPrevDistance] = useState(0);
  const [totalDistance, setTotalDistance] = useState(0);
  const [sectorDistance, setSectorDistance] = useState(0);
  const [isTabVisible, setIsTabVisible] = useState(true);
  const [error, setError] = useState("");
  const watchIdRef = useRef (null);
  const totalDistanceRef = useRef(0);
  const deltaPositionRef = useRef({});

  useEffect(() => {
    // Check for saved theme preference
    const savedTheme = localStorage.getItem("app-theme");
    if (savedTheme === "dark") {
      setIsDarkMode(true);
      document.documentElement.setAttribute("data-theme", "dark");
    }
  }, []);

  const startTracking = async () => {
    totalDistanceRef.current = 0;
    deltaPositionRef.current = null;
    setTotalDistance(0);
    setSectorDistance(0);
    setPrevDistance(0);

    if ("geolocation" in navigator) {
      setIsTracking(true);
      watchIdRef.current = navigator.geolocation.watchPosition(
        (position) => {
          //console.log(deltaPositionRef.current, position.coords.accuracy);
          if (position.coords.accuracy > 100) {
            // Ignore inaccurate readings
            return;
          }
          const newPosition = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };
          if (!deltaPositionRef.current) {
            deltaPositionRef.current = newPosition;
            return;
          }
          const distance = calculateDistance(deltaPositionRef.current, newPosition);
          if (distance > 5) {
            totalDistanceRef.current += distance;
            setTotalDistance(totalDistanceRef.current);
            deltaPositionRef.current = newPosition;
          }
        },
        (err) => setError(err.message),
        { maximumAge: 0, enableHighAccuracy: true }
      );
    }
  };

  const checkpoint = async () => {
    if(!isTracking) return;
    
    setSectorDistance(totalDistance - prevDistance);
    setPrevDistance(totalDistance);
  };

  const stopTracking = async () =>{
    checkpoint();
    totalDistanceRef.current = 0;
    setIsTracking(false);
    navigator.geolocation.clearWatch(watchIdRef.current);
  }

  const toggleTheme = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    const theme = newTheme ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("app-theme", theme);
  };

  return (
    <div className={styles.page}>
      <header className={`${styles.wrapper} container `}>
        <aside>

          <button
            className="btn-back"
            //Link todo
            >
            &lt;
          </button>
        </aside>
        <aside>
          <button
            className="btn-theme"
            onClick={toggleTheme}
            aria-label="Toggle theme"
            >
            {isDarkMode ? (
              <Image src="/moon.png" alt="Moon icon" width={40} height={40}/>
            ) : (
              <Image src="/sun.png" alt="Sun icon" width={40} height={40}/>
            )}
          </button>
        </aside>
      </header>
      <main className={styles.main}>
        
        <div>
          <div className="stats-label">
            Total Distance
          </div>
          <div className="stats-value">
            {formatDistance(totalDistance)}
          </div>
          <div className="stats-label">
            Checkpoint Distance
          </div>
          <div className="stats-value">
            {formatDistance(sectorDistance)}
          </div>
        </div>
        
      </main>
      <footer className={styles.footer}>
        {!isTracking ? (
          <button
            className="btn-start"
            onClick={startTracking}
          >
            <Image src="/start.png" alt="Start icon" width={100} height={100}/>
          </button>
        ) : (
          <button
            className="btn-stop"
            onClick={stopTracking}
          >
            <Image src="/stop.png" alt="Stop icon" width={100} height={100}/>
          </button>
        )}
        <button
          className="btn-checkpoint"
          onClick={checkpoint}
          disabled={!isTracking}
        >
          <Image src="/checkpoint.png" alt="Checkpoint icon" width={100} height={100}/>
        </button>
      </footer>
    </div>
  );
}
