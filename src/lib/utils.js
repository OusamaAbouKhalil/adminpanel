import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const getLocationByCoordinates = async (lat, lng) => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1&accept-language=en`
    );
    const data = await response.json();
    // console.log(data);
    return (
      data.display_name ||
      `${data.address?.city || ''}, ${data.address?.state || ''}, ${data.address?.country || ''}`
    );
  } catch (error) {
    console.error("Error fetching location: ", error);
  }
};

export const transformSizesToObject = (sizesForm) => {
  return sizesForm.reduce((acc, { name, value }) => {
    if (name) acc[name] = Number(value); // Convert value to number
    return acc;
  }, {});
};
