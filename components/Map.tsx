import { View, Image, Text, ActivityIndicator } from "react-native";
import { useEffect, useState } from "react";
import MapView, { Marker, Callout, PROVIDER_DEFAULT } from "react-native-maps";
import { useDriverStore, useLocationStore } from "@/store";
import { calculateRegion, generateMarkersFromData } from "@/lib/map";
import { MarkerData } from "@/types/type";
import { icons } from "@/constants";
import CustomButton from "@/components/CustomButton";

// Mock data for drivers for now
const drivers = [
  {
    id: "1",
    first_name: "James",
    last_name: "Wilson",
    profile_image_url:
      "https://ucarecdn.com/dae59f69-2c1f-48c3-a883-017bcf0f9950/-/preview/1000x666/",
    car_image_url:
      "https://ucarecdn.com/a2dc52b2-8bf7-4e49-9a36-3ffb5229ed02/-/preview/465x466/",
    car_seats: 4,
    rating: "4.80",
  },
  {
    id: "2",
    first_name: "David",
    last_name: "Brown",
    profile_image_url:
      "https://ucarecdn.com/6ea6d83d-ef1a-483f-9106-837a3a5b3f67/-/preview/1000x666/",
    car_image_url:
      "https://ucarecdn.com/a3872f80-c094-409c-82f8-c9ff38429327/-/preview/930x932/",
    car_seats: 5,
    rating: "4.60",
  },
  {
    id: "3",
    first_name: "Michael",
    last_name: "Johnson",
    profile_image_url:
      "https://ucarecdn.com/0330d85c-232e-4c30-bd04-e5e4d0e3d688/-/preview/826x822/",
    car_image_url:
      "https://ucarecdn.com/289764fb-55b6-4427-b1d1-f655987b4a14/-/preview/930x932/",
    car_seats: 4,
    rating: "4.70",
  },
  {
    id: "4",
    first_name: "Robert",
    last_name: "Green",
    profile_image_url:
      "https://ucarecdn.com/fdfc54df-9d24-40f7-b7d3-6f391561c0db/-/preview/626x417/",
    car_image_url:
      "https://ucarecdn.com/b6fb3b55-7676-4ff3-8484-fb115e268d32/-/preview/930x932/",
    car_seats: 4,
    rating: "4.90",
  },
];

const Map = () => {
  // Getting the current user location from our Zustand location store
  const {
    userLongitude,
    userLatitude,
    destinationLatitude,
    destinationLongitude,
  } = useLocationStore();

  // Getting the selected driver if there is one and the current available drivers from our Zustand drivers store
  const { selectedDriver, setDrivers } = useDriverStore();
  const [markers, setMarkers] = useState<MarkerData[]>([]); // all our markers
  const [loading, setLoading] = useState(true); // Is the map loading ?
  // Calculate the region
  const region = calculateRegion({
    userLongitude,
    userLatitude,
    destinationLatitude,
    destinationLongitude,
  });

  // The effect is mainly to load the map data , we will show an ActivityIndicator while we are loading the data, dependencies are everything related to user location or destination location as well as if our drivers change (Driver deleted or added to the drivers list)
  useEffect(() => {
    const loadMapData = async () => {
      if (userLatitude && userLongitude) {
        // Generate markers from data
        const newMarkers = generateMarkersFromData({
          data: drivers,
          userLatitude,
          userLongitude,
        });
        setMarkers(newMarkers);
        setLoading(false); // Once data is ready, stop loading
      }
    };

    loadMapData();
  }, [
    userLatitude,
    userLongitude,
    destinationLatitude,
    destinationLongitude,
    drivers,
  ]);
  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#0286FF" />
        <Text className="text-sm font-JakartaSemiBold mt-1">
          We are looking for your location...
        </Text>
      </View>
    );
  }

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
          image={icons.marker}
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
    </MapView>
  );
};
export default Map;
