import { Driver, MarkerData } from "@/types/type";

/**
 * Calculates a map region based on the user's current location and an optional destination.
 * This is useful for centering and zooming the map to display both locations or just the user's location.
 */
export const calculateRegion = ({
  userLatitude,
  userLongitude,
  destinationLatitude,
  destinationLongitude,
}: {
  userLatitude: number | null;
  userLongitude: number | null;
  destinationLatitude?: number | null;
  destinationLongitude?: number | null;
}) => {
  // If the user's location is not available, return a default region.
  if (!userLatitude || !userLongitude) {
    return {
      latitude: 37.78825, // Default latitude (e.g., San Francisco)
      longitude: -122.4324, // Default longitude
      latitudeDelta: 0.01, // Default zoom level (small area)
      longitudeDelta: 0.01, // Default zoom level (small area)
    };
  }

  // If there is no destination provided, return the region centered around the user's location.
  if (!destinationLatitude || !destinationLongitude) {
    return {
      latitude: userLatitude, // User's latitude
      longitude: userLongitude, // User's longitude
      latitudeDelta: 0.01, // Zoom level focused on the user's location
      longitudeDelta: 0.01, // Zoom level focused on the user's location
    };
  }

  // Calculate the minimum and maximum latitude and longitude between the user and the destination
  const minLat = Math.min(userLatitude, destinationLatitude);
  const maxLat = Math.max(userLatitude, destinationLatitude);
  const minLng = Math.min(userLongitude, destinationLongitude);
  const maxLng = Math.max(userLongitude, destinationLongitude);

  // Add padding to the latitude and longitude deltas for a better map view
  const latitudeDelta = (maxLat - minLat) * 1.3; // Padding ensures extra space around the region
  const longitudeDelta = (maxLng - minLng) * 1.3; // Padding ensures extra space around the region

  // Calculate the center point between the user and the destination
  const latitude = (userLatitude + destinationLatitude) / 2;
  const longitude = (userLongitude + destinationLongitude) / 2;

  // Return the calculated region
  return {
    latitude, // Center latitude
    longitude, // Center longitude
    latitudeDelta, // Zoom level adjusted for both locations
    longitudeDelta, // Zoom level adjusted for both locations
  };
};

/**
 * Generates marker data for a map by applying random offsets to the user's location.
 * This is used to simulate driver locations near the user.
 */
export const generateMarkersFromData = ({
  data,
  userLatitude,
  userLongitude,
}: {
  data: Driver[];
  userLatitude: number;
  userLongitude: number;
}): MarkerData[] => {
  return data.map((driver) => {
    const latOffset = (Math.random() - 0.5) * 0.01; // Random offset between -0.005 and 0.005
    const lngOffset = (Math.random() - 0.5) * 0.01; // Random offset between -0.005 and 0.005

    return {
      latitude: userLatitude + latOffset,
      longitude: userLongitude + lngOffset,
      title: `${driver.first_name} ${driver.last_name}`,
      ...driver,
    };
  });
};
/**
 * Calculates estimated travel times and prices for drivers to a user and from the user to a destination.
 *
 * @param {Object[]} markers - An array of marker data representing drivers' locations.
 * @param {number | null} userLatitude - The latitude of the user's current location.
 * @param {number | null} userLongitude - The longitude of the user's current location.
 * @param {number | null} destinationLatitude - The latitude of the destination.
 * @param {number | null} destinationLongitude - The longitude of the destination.
 *
 * @returns {Promise<Object[] | undefined>} A promise that resolves to an array of markers with calculated times and prices, or undefined if inputs are invalid.
 *
 * This function performs the following steps:
 * 1. Validates input coordinates to ensure they are provided.
 * 2. For each driver marker, it:
 *    - Fetches the travel time from the driver's location to the user's location using the Google Directions API.
 *    - Fetches the travel time from the user's location to the destination using the Google Directions API.
 *    - Calculates the total travel time (to user and to destination) in minutes.
 *    - Estimates the price based on the total travel time (e.g., $0.50 per minute).
 * 3. Returns an updated array of markers, each including the calculated time and price.
 * 4. Logs any errors encountered during the API requests to the console.
 */
export const calculateDriverTimes = async ({
  markers,
  userLatitude,
  userLongitude,
  destinationLatitude,
  destinationLongitude,
}: {
  markers: MarkerData[];
  userLatitude: number | null;
  userLongitude: number | null;
  destinationLatitude: number | null;
  destinationLongitude: number | null;
}) => {
  if (
    !userLatitude ||
    !userLongitude ||
    !destinationLatitude ||
    !destinationLongitude
  )
    return;

  try {
    const timesPromises = markers.map(async (marker) => {
      const responseToUser = await fetch(
        `https://maps.googleapis.com/maps/api/directions/json?origin=${marker.latitude},${marker.longitude}&destination=${userLatitude},${userLongitude}&key=${process.env.EXPO_PUBLIC_GOOGLE_DIRECTIONS_API_KEY}`,
      );
      const dataToUser = await responseToUser.json();
      const timeToUser = dataToUser.routes[0].legs[0].duration.value; // Time in seconds

      const responseToDestination = await fetch(
        `https://maps.googleapis.com/maps/api/directions/json?origin=${userLatitude},${userLongitude}&destination=${destinationLatitude},${destinationLongitude}&key=${process.env.EXPO_PUBLIC_GOOGLE_DIRECTIONS_API_KEY}`,
      );
      const dataToDestination = await responseToDestination.json();
      const timeToDestination =
        dataToDestination.routes[0].legs[0].duration.value; // Time in seconds

      const totalTime = (timeToUser + timeToDestination) / 60; // Total time in minutes
      const price = (totalTime * 0.5).toFixed(2); // Calculate price based on time , 0.5 symbols the rate per minute of traveling

      return { ...marker, time: totalTime, price };
    });

    return await Promise.all(timesPromises);
  } catch (error) {
    console.error("Error calculating driver times:", error);
  }
};
