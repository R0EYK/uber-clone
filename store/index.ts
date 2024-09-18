// For more information please read zustand docs at: https://zustand.docs.pmnd.rs/getting-started/introduction,
import { create } from "zustand";
import { DriverStore, LocationStore, MarkerData } from "@/types/type";

/**
 * useLocationStore:
 * - `userLongitude`: The longitude of the user's current location (initially null).
 * - `userLatitude`: The latitude of the user's current location (initially null).
 * - `userAddress`: The address of the user's current location (initially null).
 * - `destinationLatitude`: The latitude of the destination (initially null).
 * - `destinationLongitude`: The longitude of the destination (initially null).
 * - `destinationAddress`: The address of the destination (initially null).
 *
 * Actions (Functions):
 * - `setUserLocation`: Sets the user's location with latitude, longitude, and address.
 *   - Parameters: `{ latitude: number, longitude: number, address: string }`
 *   - This function updates the store with the user's current location details.
 *
 * - `setDestinationLocation`: Sets the destination's location with latitude, longitude, and address.
 *   - Parameters: `{ latitude: number, longitude: number, address: string }`
 *   - This function updates the store with the destination location details.
 *
 * Example Usage:
 *   - Update user's location:
 *     `setUserLocation({ latitude: 40.7128, longitude: -74.0060, address: "New York, NY" })`
 *   - Update destination location:
 *     `setDestinationLocation({ latitude: 34.0522, longitude: -118.2437, address: "Los Angeles, CA" })`
 *
 * This store allows other components to access and update location data, making it useful
 * in map-based or navigation-related applications that need to track both user and destination locations.
 */
export const useLocationStore = create<LocationStore>((set) => ({
  userLongitude: null,
  userLatitude: null,
  userAddress: null,
  destinationLatitude: null,
  destinationLongitude: null,
  destinationAddress: null,
  setUserLocation: ({
    latitude,
    longitude,
    address,
  }: {
    latitude: number;
    longitude: number;
    address: string;
  }) => {
    set(() => ({
      userLatitude: latitude,
      userLongitude: longitude,
      userAddress: address,
    }));
  },
  setDestinationLocation: ({
    latitude,
    longitude,
    address,
  }: {
    latitude: number;
    longitude: number;
    address: string;
  }) => {
    set(() => ({
      destinationLatitude: latitude,
      destinationLongitude: longitude,
      destinationAddress: address,
    }));
  },
}));

/*
 * useDriverStore:
 * - `drivers`: An array of driver marker data (e.g., location info).
 * - `selectedDriver`: The currently selected driver ID, or `null` if no driver is selected.
 * - `setSelectedDriver`: Function to set the selected driver by their ID.
 * - `setDrivers`: Function to update the list of drivers.
 * - `clearSelectedDriver`: Function to clear the selected driver (set to `null`).
 *
 * This store can be used to handle the state of drivers and their selection
 * where markers represent drivers.
 */

export const useDriverStore = create<DriverStore>((set) => ({
  drivers: [] as MarkerData[],
  selectedDriver: null,
  setSelectedDriver: (driverId: number) =>
    set(() => ({ selectedDriver: driverId })),
  setDrivers: (drivers: MarkerData[]) => set(() => ({ drivers: drivers })),
  clearSelectedDriver: () => set(() => ({ selectedDriver: null })),
}));
