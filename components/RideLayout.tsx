import { View, Text, TouchableOpacity, Image, Keyboard } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { router } from "expo-router";
import { icons } from "@/constants";
import Map from "@/components/Map";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import { useRef, ReactNode } from "react";

interface RideLayoutProps {
  title: string;
  children:
    | ReactNode
    | ((bottomSheetRef: React.RefObject<BottomSheet>) => ReactNode);
  snapPoints?: string[];
}

const RideLayout = ({
  title,
  children,
  snapPoints = ["40%", "85%"],
}: RideLayoutProps) => {
  const bottomSheetRef = useRef<BottomSheet>(null);

  return (
    <GestureHandlerRootView>
      <View className="flex-1 bg-white">
        <View className="flex flex-col h-screen bg-blue-500">
          <View className="flex flex-row absolute z-10 top-16 items-center justify-start px-5">
            <TouchableOpacity onPress={() => router.back()}>
              <View>
                <Image
                  source={icons.backArrow}
                  resizeMode="contain"
                  className="w-6 h-6"
                />
              </View>
            </TouchableOpacity>
            <Text className="text-xl font-JakartaSemiBold ml-5">{title}</Text>
          </View>
          <Map />
        </View>
        <BottomSheet
          ref={bottomSheetRef}
          snapPoints={snapPoints}
          index={0}
          onChange={(index) => {
            // If the bottom sheet is minimized, dismiss the keyboard
            if (index === 0) {
              Keyboard.dismiss();
            }
          }}
        >
          <BottomSheetView style={{ flex: 1, padding: 20 }}>
            {/* Handle both regular ReactNode children and function children */}
            {typeof children === "function"
              ? children(bottomSheetRef)
              : children}
          </BottomSheetView>
        </BottomSheet>
      </View>
    </GestureHandlerRootView>
  );
};
export default RideLayout;
