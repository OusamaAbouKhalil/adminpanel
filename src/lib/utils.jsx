import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export const getLocationByCoordinates = async (lat, lng) => {
  try {
    const response = await fetch(
      `https://photon.komoot.io/reverse?lon=${lng}&lat=${lat}`
    );
    const data = await response.json();
    // console.log(data);
    return (
      data["features"][0]["properties"]["city"] +
      ", " +
      data["features"][0]["properties"]["country"]
    );
  } catch (error) {
    console.error("Error fetching location: ", error);
  }
};

