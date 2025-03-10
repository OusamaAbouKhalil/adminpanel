import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { getDatabase, ref } from "firebase/database";
import { GeoFire } from "geofire"; // Import GeoFire
import db from "../utils/firebaseconfig"; // Firebase config

// Custom icons
const carIcon = new L.Icon({
  iconUrl: "https://imgs.search.brave.com/_YR6waPmQyvD53rjHHDs47LvAB2yF-V1ff5VaSPLJnI/rs:fit:500:0:0:0/g:ce/aHR0cHM6Ly93d3cu/dWJlci1hc3NldHMu/Y29tL2ltYWdlL3Vw/bG9hZC9mX2F1dG8s/cV9hdXRvOmVjbyxj/X2ZpbGwsaF8zNjgs/d181NTIvdjE1NTUz/Njc1MzgvYXNzZXRz/LzMxL2FkMjFiNy01/OTVjLTQyZTgtYWM1/My01Mzk2NmI0YTVm/ZWUvb3JpZ2luYWwv/RmluYWxfQmxhY2su/cG5n",
  iconSize: [30, 30],
});

const bikeIcon = new L.Icon({
  iconUrl: "https://img.icons8.com/ios-filled/50/000000/bicycle.png",
  iconSize: [30, 30],
});

const DriversMap = () => {
  const [drivers, setDrivers] = useState([]);
  const [currentLocation, setCurrentLocation] = useState(null);

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setCurrentLocation({ latitude, longitude });
        },
        (error) => {
          console.error("Error getting location:", error);
          setCurrentLocation({ latitude: 33.8886, longitude: 35.4955 }); // Default to Beirut
        }
      );
    } else {
      console.error("Geolocation is not supported by this browser.");
      setCurrentLocation({ latitude: 33.8886, longitude: 35.4955 });
    }
  };

  useEffect(() => {
    getUserLocation();

    if (!currentLocation) return;

    const database = getDatabase();
    const geoFire = new GeoFire(ref(database, "availableDrivers"));
    const geoQuery = geoFire.query({
      center: [currentLocation.latitude, currentLocation.longitude],
      radius: 50, // 50 km radius
    });

    geoQuery.on("key_entered", (key, location) => {
      setDrivers((prevDrivers) => {
        // Remove any existing driver with the same ID
        const filteredDrivers = prevDrivers.filter((driver) => driver.id !== key);

        // Add new driver entry with updated location and a fresh icon
        return [
          ...filteredDrivers,
          { id: key, location: { latitude: location[0], longitude: location[1] } },
        ];
      });
    });

    geoQuery.on("key_exited", (key) => {
      setDrivers((prevDrivers) => prevDrivers.filter((driver) => driver.id !== key));
    });

    return () => {
      geoQuery.cancel();
    };
  }, [currentLocation]);

  return (
    <MapContainer
      center={[currentLocation?.latitude || 33.8886, currentLocation?.longitude || 35.4955]}
      zoom={13}
      style={{ height: "100vh", width: "100%" }}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {drivers.map((driver) => (
        <Marker
          key={driver.id}
          position={[driver.location.latitude, driver.location.longitude]}
          icon={carIcon} // Default to car icon, you can change this logic based on the driver's vehicle type
        >
          <Popup>{`Driver ID: ${driver.id}`}</Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default DriversMap;
