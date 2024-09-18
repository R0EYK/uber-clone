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
