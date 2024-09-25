import { View, Text } from "react-native";
import { useLocationStore } from "@/store";
import RideLayout from "@/components/RideLayout";
import GoogleTextInput from "@/components/GoogleTextInput";
import { icons } from "@/constants";
import CustomButton from "@/components/CustomButton";
import { router } from "expo-router";
import BottomSheet from "@gorhom/bottom-sheet";

// I`ve had to go for a function as children approach here as I wanted to get access to the reference of the BottomSheet which is held in the RideLayout component, so we will pass the function as children and in the RideLayout we will use it with the reference of the BottomSheet like this we can do different stuff like control the snap points etc...

const FindRide = () => {
  const {
    userAddress,
    destinationAddress,
    setDestinationLocation,
    setUserLocation,
  } = useLocationStore();

  return (
    <RideLayout title={"Find Ride"}>
      {(bottomSheetRef: React.RefObject<BottomSheet>) => (
        <View>
          <View>
            <Text className="text-lg font-JakartaSemiBold mb-3">From</Text>
            <GoogleTextInput
              icon={icons.target}
              initialLocation={userAddress!}
              containerStyle="bg-neutral-100"
              textInputBackgroundColor="#f5f5f5"
              onFocus={() => bottomSheetRef.current?.snapToIndex(1)} // Snap to the expanded position when focused
              handlePress={(location) => setUserLocation(location)}
            />
          </View>
          <View className="my-3">
            <Text className="text-lg font-JakartaSemiBold mb-3">To</Text>
            <GoogleTextInput
              icon={icons.map}
              initialLocation={destinationAddress!}
              containerStyle="bg-neutral-100"
              textInputBackgroundColor="transparent"
              onFocus={() => bottomSheetRef.current?.snapToIndex(1)}
              handlePress={(location) => setDestinationLocation(location)}
            />
          </View>
          <CustomButton
            title="Find Now"
            onPress={() => router.push("/(root)/confirm-ride")}
            className="my-5"
          />
        </View>
      )}
    </RideLayout>
  );
};

export default FindRide;
