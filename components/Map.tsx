import { View, Image, Text, ActivityIndicator } from "react-native";
import { useEffect, useState } from "react";
import MapView, { Marker, Callout, PROVIDER_DEFAULT } from "react-native-maps";
import { useDriverStore, useLocationStore } from "@/store";
import {
  calculateDriverTimes,
  calculateRegion,
  generateMarkersFromData,
} from "@/lib/map";
import { Driver, MarkerData } from "@/types/type";
import { icons } from "@/constants";
import CustomButton from "@/components/CustomButton";
import { useFetch } from "@/lib/fetch";
import MapViewDirections from "react-native-maps-directions";

const Map = () => {
  const { data: drivers, loading, error } = useFetch<Driver[]>("/(api)/driver");

  // Getting the current user location from our Zustand location store
  const {
    userLongitude,
    userLatitude,
    destinationLatitude,
    destinationLongitude,
  } = useLocationStore();

  // Getting the selected driver if there is one and the current available drivers from our Zustand drivers store
  const { selectedDriver, setDrivers, setSelectedDriver } = useDriverStore();
  const [markers, setMarkers] = useState<MarkerData[]>([]); // all our markers
  // Calculate the region
  const region = calculateRegion({
    userLongitude,
    userLatitude,
    destinationLatitude,
    destinationLongitude,
  });

  // The effect is mainly to load the map data , we will show an ActivityIndicator while we are loading the data, dependencies are everything related to user location or destination location as well as if our drivers change (Driver deleted or added to the drivers list)
  useEffect(() => {
    if (Array.isArray(drivers)) {
      if (!userLatitude || !userLongitude) return;

      const newMarkers = generateMarkersFromData({
        data: drivers,
        userLatitude,
        userLongitude,
      });

      setMarkers(newMarkers);
    }
  }, [drivers, userLatitude, userLongitude]);

  useEffect(() => {
    if (markers.length > 0 && destinationLatitude && destinationLongitude) {
      calculateDriverTimes({
        markers,
        userLongitude,
        userLatitude,
        destinationLatitude,
        destinationLongitude,
      }).then((drivers) => {
        setDrivers(drivers as MarkerData[]);
      });
    }
  }, [markers, destinationLatitude, destinationLongitude]);

  if (loading || (!userLatitude && !userLongitude))
    return (
      <View className="flex justify-between items-center w-full">
        <ActivityIndicator size="small" color="#000" />
      </View>
    );

  if (error)
    return (
      <View className="flex justify-between items-center w-full">
        <Text>Error: {error}</Text>
      </View>
    );

  return (
    <MapView
      provider={PROVIDER_DEFAULT}
      className="w-full h-full rounded-2xl"
      tintColor="black"
      mapType="mutedStandard"
      showsPointsOfInterest={false}
      showsUserLocation={true}
      userInterfaceStyle="light"
      initialRegion={region}
    >
      {markers.map((marker) => (
        <Marker
          key={marker.id}
          coordinate={{
            latitude: marker.latitude,
            longitude: marker.longitude,
          }}
          title={marker.title}
          image={
            selectedDriver === marker.id ? icons.selectedMarker : icons.marker
          }
          onPress={() => setSelectedDriver(marker.id)}
        >
          {/*Custom Callout for pressing the drivers icon in the Map*/}
          <Callout>
            <View className="w-49 p-2 justify-center items-center shadow-lg">
              <Image
                source={{ uri: marker.profile_image_url }}
                className="w-20 h-20 rounded-full mb-2 mx-auto"
              />
              <View className="text-center mb-3">
                <Text className="text-lg font-semibold mb-1">
                  {marker.first_name} {marker.last_name}
                </Text>
                <Text className="text-sm text-gray-500">
                  Seats: {marker.car_seats}
                </Text>
                <Text className="text-sm text-gray-500">
                  Rating: {marker.rating}
                </Text>
              </View>
              <CustomButton
                title={`Book ${marker.first_name} Now!`}
                onPress={() => {
                  // Logic to handle calling the driver
                  console.log(`Calling ${marker.first_name}`);
                }}
                textVariant="primary"
                className="mt-2 w-26 rounded-md"
              />
            </View>
          </Callout>
        </Marker>
      ))}
      {destinationLatitude && destinationLongitude && (
        <>
          <Marker
            key="destination"
            coordinate={{
              latitude: destinationLatitude,
              longitude: destinationLongitude,
            }}
            title="Destination"
            image={icons.pin}
          />
          <MapViewDirections
            origin={{
              latitude: userLatitude!,
              longitude: userLongitude!,
            }}
            destination={{
              latitude: destinationLatitude,
              longitude: destinationLongitude,
            }}
            apikey={process.env.EXPO_PUBLIC_GOOGLE_API_KEY}
            strokeColor="#0286ff"
            strokeWidth={4}
          />
        </>
      )}
    </MapView>
  );
};
export default Map;
