import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { getDatabase, ref, onValue } from "firebase/database";
// Import Firebase configuration from firebaseconfig
import db from "../utils/firebaseconfig"; // Now using the db export from firebaseconfig

function distanceBetween(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Returns the distance in kilometers
}

// Custom icons for drivers
const carIcon = new L.Icon({
  iconUrl: "https://img.icons8.com/ios-filled/50/000000/car.png",
  iconSize: [30, 30],
});

const bikeIcon = new L.Icon({
  iconUrl: "https://img.icons8.com/ios-filled/50/000000/bicycle.png",
  iconSize: [30, 30],
});

const DriversMap = () => {
  const [drivers, setDrivers] = useState([]);
  const [currentLocation, setCurrentLocation] = useState(null);

  // Function to get the user's current location
  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setCurrentLocation({ latitude, longitude });
        },
        (error) => {
          console.error("Error getting location:", error);
          setCurrentLocation({ latitude: 33.8886, longitude: 35.4955 }); // Default to Beirut if location is not available
        }
      );
    } else {
      console.error("Geolocation is not supported by this browser.");
      setCurrentLocation({ latitude: 33.8886, longitude: 35.4955 }); // Default to Beirut if geolocation is not supported
    }
  };

  useEffect(() => {
    // Fetch the user's current location on component mount
    getUserLocation();

    const radius = 50; // 10 km
    const fetchDrivers = (dbRef, type) => {
      onValue(dbRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const driversArray = Object.keys(data).map((key) => {
            const driver = data[key];
            const { latitude, longitude } = driver.location || {}; // Safe access to location

            // Ensure latitude and longitude exist
            if (latitude && longitude) {
              return {
                id: key,
                type,
                location: { latitude, longitude },
              };
            }
            return null; // Return null for invalid data
          }).filter(driver => driver !== null); // Filter out null entries

          setDrivers(driversArray);
        }
      });
    };

    // Assuming db reference to the driver's data location in Firebase
    const driversRef = ref(getDatabase(), "drivers/");
    fetchDrivers(driversRef, "car");
  }, []);

  return (
    <MapContainer center={[currentLocation?.latitude || 33.8886, currentLocation?.longitude || 35.4955]} zoom={13} style={{ height: "100vh", width: "100%" }}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {drivers.map((driver) => (
        <Marker
          key={driver.id}
          position={[driver.location.latitude, driver.location.longitude]}
          icon={driver.type === "car" ? carIcon : bikeIcon}
        >
          <Popup>{`Driver ID: ${driver.id}`}</Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default DriversMap;
