'use client'

import Image from "next/image";
import styles from "./page.module.css";
import { useEffect, useState } from 'react'
import Link from 'next/link';

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
  
  console.log("dis calculation", R*c);
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
  const [elapsedTime, setElapsedTime] = useState(0);
  const [totalDistance, setTotalDistance] = useState(0);
  const [lastGpsUpdate, setLastGpsUpdate] = useState(0);
  const [lastCalculatedDistance, setLastCalculatedDistance] = useState(0);
  const [isTabVisible, setIsTabVisible] = useState(true);
  const [error, setError] = useState("");
  
const startTracking = async () =>{

  setTotalDistance(0)
  var deltaPosition = {}
  //check permission

  if('geolocation' in navigator) {
      // Retrieve latitude & longitude coordinates from `navigator.geolocation` Web API
      navigator.geolocation.getCurrentPosition((position) => {
        deltaPosition = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        };
      setLocation({...location, latitude: position.coords.latitude, longitude: position.coords.longitude});
    })
  }

  //setIsTracking(true)

  navigator.geolocation.watchPosition((position) => {
    const newPosition = {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude
    };
    setCurrentPosition({...currentPosition, latitude: position.coords.latitude, longitude: position.coords.longitude});

    
    if(deltaPosition){
      const distance = calculateDistance(deltaPosition,newPosition);

      if (distance > 2){//don't need small distances
        setTotalDistance((dis) => dis + distance);
        deltaPosition = newPosition;
      }
    }
  })
}
  
  return (
    <div className={styles.page}>      
      <main className={styles.main}>
        <Image
          className={styles.logo}
          src="/next.svg"
          alt="Next.js logo"
          width={180}
          height={38}
          priority
        />
        <ol>
          <li>
            Get started by editing <code>app/page.js</code>.
          </li>
          <li>Save and see your changes instantly.</li>
        </ol>

        <div className={styles.ctas}>
          <a
            className={styles.primary}
            href="https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              className={styles.logo}
              src="/vercel.svg"
              alt="Vercel logomark"
              width={20}
              height={20}
            />
            Deploy now
          </a>
          <a
            href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.secondary}
          >
            Read our docs
          </a>
        </div>
      </main>
      <footer className={styles.footer}>

        {/* Control Buttons */}
        <div className="space-y-4 shrink-0">
          {!isTracking ? (
            <button
              className="btn btn-success btn-lg w-full text-xl h-20 flex items-center justify-center gap-3 text-success-content"
              onClick={startTracking}
            >
              Start
            </button>
          ) : (
            <div className="space-y-3">
              <button
                className="btn btn-info btn-lg w-full text-xl h-16 flex items-center justify-center gap-3 text-info-content"
                //onClick={recordLap}
              >
                Lap
              </button>
              <button
                className="btn btn-error btn-lg w-full text-xl h-16 flex items-center justify-center gap-3 text-error-content"
                //onClick={stopTracking}
              >
                Stop
              </button>
            </div>
          )}
        </div>
        
      </footer>
    </div>
  );
}
