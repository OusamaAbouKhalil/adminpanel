import React, { useEffect, useState, useCallback, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { ref, onValue } from "firebase/database";
import { GeoFire } from "geofire";
import db from "../utils/firebaseconfig";

// Fix Leaflet default icon paths
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png",
});

// Custom icons
const driverIcon = new L.Icon({
  iconUrl: "https://imgs.search.brave.com/_YR6waPmQyvD53rjHHDs47LvAB2yF-V1ff5VaSPLJnI/rs:fit:500:0:0:0/g:ce/aHR0cHM6Ly93d3cu/dWJlci1hc3NldHMu/Y29tL2ltYWdlL3Vw/bG9hZC9mX2F1dG8s/cV9hdXRvOmVjbyxj/X2ZpbGwsaF8zNjgs/d181NTIvdjE1NTUz/Njc1MzgvYXNzZXRz/LzMxL2FkMjFiNy01/OTVjLTQyZTgtYWM1/My01Mzk2NmI0YTVm/ZWUvb3JpZ2luYWwv/RmluYWxfQmxhY2su/cG5n",
  iconSize: [30, 30],
  iconAnchor: [15, 15],
});

const userIcon = new L.Icon({
  iconUrl: "https://img.icons8.com/color/48/000000/marker.png",
  iconSize: [25, 25],
  iconAnchor: [12.5, 25],
});

const DriversMap = () => {
  const [drivers, setDrivers] = useState([]);
  const [currentLocation, setCurrentLocation] = useState({ 
    latitude: 33.8886, 
    longitude: 35.4955 
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const mountedRef = useRef(true);
  const geoQueryRef = useRef(null);
  const hasSetInitialLocation = useRef(false);

  const getUserLocation = useCallback(() => {
    if (!navigator.geolocation) {
      console.warn("Geolocation not supported by browser");
      setError("Geolocation not supported");
      setLoading(false);
      return () => {};
    }

    console.log("Starting geolocation watch...");
    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        if (!mountedRef.current) return;
        const { latitude, longitude } = position.coords;
        console.log("Location updated:", { latitude, longitude });
        setCurrentLocation({ latitude, longitude });
        setError(null);
        if (!hasSetInitialLocation.current) {
          setLoading(false);
          hasSetInitialLocation.current = true;
        }
      },
      (err) => {
        if (!mountedRef.current) return;
        console.error("Geolocation error:", err);
        setError(`Geolocation error: ${err.message} (Code: ${err.code})`);
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );

    return () => {
      console.log("Cleaning up geolocation watch...");
      navigator.geolocation.clearWatch(watchId);
    };
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    const cleanupLocation = getUserLocation();
    const driversRef = ref(db, "availableDrivers");

    console.log("Initializing Firebase and GeoFire...");
    const geoFire = new GeoFire(driversRef);

    const setupGeoQuery = () => {
      if (!mountedRef.current) return;
      if (geoQueryRef.current) {
        console.log("Cancelling previous GeoQuery...");
        geoQueryRef.current.cancel();
      }

      console.log("Setting up new GeoQuery with center:", currentLocation);
      const geoQuery = geoFire.query({
        center: [currentLocation.latitude, currentLocation.longitude],
        radius: 50,
      });

      geoQueryRef.current = geoQuery;

      geoQuery.on("key_entered", (key, location) => {
        if (!mountedRef.current) return;
        console.log(`Driver ${key} entered radius at`, location);
        setDrivers((prev) => {
          const exists = prev.find((d) => d.id === key);
          if (!exists) {
            return [...prev, {
              id: key,
              location: { latitude: location[0], longitude: location[1] },
            }];
          }
          return prev;
        });
      });

      geoQuery.on("key_moved", (key, location) => {
        if (!mountedRef.current) return;
        console.log(`Driver ${key} moved to`, location);
        setDrivers((prev) =>
          prev.map((driver) =>
            driver.id === key
              ? { ...driver, location: { latitude: location[0], longitude: location[1] } }
              : driver
          )
        );
      });

      geoQuery.on("key_exited", (key) => {
        if (!mountedRef.current) return;
        console.log(`Driver ${key} exited radius`);
        setDrivers((prev) => prev.filter((driver) => driver.id !== key));
      });
    };

    const unsubscribe = onValue(driversRef, (snapshot) => {
      if (!mountedRef.current) return;
      const data = snapshot.val() || {};
      console.log("Firebase drivers data:", data);
      const updatedDrivers = Object.entries(data).map(([id, driver]) => ({
        id,
        location: {
          latitude: driver.l[0],
          longitude: driver.l[1],
        },
      }));
      setDrivers(updatedDrivers);
    }, (err) => {
      console.error("Firebase onValue error:", err);
      setError(`Firebase error: ${err.message}`);
    });

    setupGeoQuery();

    return () => {
      mountedRef.current = false;
      console.log("Cleaning up effect...");
      cleanupLocation();
      unsubscribe();
      if (geoQueryRef.current) {
        geoQueryRef.current.cancel();
      }
    };
  }, [currentLocation, getUserLocation]);

  if (loading) {
    return <div>Loading map...</div>;
  }

  if (error) {
    return (
      <div>
        <p>Error: {error}</p>
        <p>Using default location (Beirut)</p>
      </div>
    );
  }

  return (
    <MapContainer
      center={[currentLocation.latitude, currentLocation.longitude]}
      zoom={13}
      style={{ height: "100vh", width: "100%" }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      {drivers.map((driver) => (
        <Marker
          key={driver.id}
          position={[driver.location.latitude, driver.location.longitude]}
          icon={driverIcon}
        >
          <Popup>
            Driver ID: {driver.id}<br />
            Lat: {driver.location.latitude.toFixed(4)}<br />
            Lng: {driver.location.longitude.toFixed(4)}
          </Popup>
        </Marker>
      ))}
      <Marker
        position={[currentLocation.latitude, currentLocation.longitude]}
        icon={userIcon}
      >
        <Popup>Your Location</Popup>
      </Marker>
    </MapContainer>
  );
};

export default DriversMap;
