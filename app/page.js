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

  //console.log("dis calculation", R * c);
  return R * c;
};

const formatDistance = (meters) => {
  if (meters >= 1000) {
    return `${(meters / 1000).toFixed(1)} km`;
  } else if (meters >= 100) {
    return `${meters.toFixed(0)} m`;
  } else if (meters >= 10) {
    return `${meters.toFixed(1)} m`;
  } else {
    return `${meters.toFixed(2)} m`;
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
    setTotalDistance(0);
    setSectorDistance(0);
    setPrevDistance(0);
    let deltaPosition = {};

    if ("geolocation" in navigator) {
      // Retrieve latitude & longitude coordinates from `navigator.geolocation` Web API
      navigator.geolocation.getCurrentPosition((position) => {
        deltaPosition = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };
      });
    }

    setIsTracking(true)
      watchIdRef.current = navigator.geolocation.watchPosition((position) => {
        const newPosition = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };
        
        if (deltaPosition && deltaPosition.latitude) {
          const distance = calculateDistance(deltaPosition, newPosition);
          
          if (distance > 10 || (distance > 4 && totalDistanceRef.current > 2)) {//don't need small distances
            totalDistanceRef.current += distance;  //unfortunate need to use ref to check total distance as setTotalDistance does not update
            setTotalDistance(totalDistanceRef.current);
            deltaPosition = newPosition;
          }
        }
      });
  };

  const checkpoint = async () => {
    if(!isTracking) return;
    
    setSectorDistance(totalDistance - prevDistance);
    setPrevDistance(totalDistance);
  };

  const stopTracking = async () =>{
    checkpoint();
    
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
            //href = todo
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
              <Image src="/moon.png" alt="Moon icon" width={32} height={32}/>
            ) : (
              <Image src="/sun.png" alt="Sun icon" width={35} height={35}/>
            )}
          </button>
        </aside>
      </header>
      <main className={styles.main}>

        <div>
          {/* Stats Display */}
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
        </div>
        
      </main>
      <footer className={styles.footer}>
        {/* Control Buttons */}
        <div>
          {!isTracking ? (
            <button
              className="btn-start"
              onClick={startTracking}
            >
              Start
            </button>
          ) : (
            <button
              className="btn-stop"
              onClick={stopTracking}
            >
              Stop
            </button>
          )}
          <button
            className="btn-checkpoint"
            onClick={checkpoint}
            disabled={!isTracking}
          >
            Checkpoint
          </button>
        </div>
      </footer>
    </div>
  );
}
