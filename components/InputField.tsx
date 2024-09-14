import { forwardRef } from "react";
import {
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Text,
  View,
  Image,
  TextInput,
  Platform,
  Keyboard,
  ScrollView,
} from "react-native";
import { InputFieldProps } from "@/types/type";

const InputField = forwardRef(
  (
    {
      label,
      labelStyle,
      icon,
      secureTextEntry = false,
      containerStyle,
      inputStyle,
      iconStyle,
      className,
      ...props
    }: InputFieldProps,
    ref,
  ) => (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          {/* Closing Keyboard when touching outside */}
          <View className="my-2 w-full">
            <Text className={`text-lg font-JakartaSemiBold mb-3 ${labelStyle}`}>
              {label}
            </Text>
            <View
              className={`flex flex-row justify-start items-center relative bg-neutral-100 rounded-full border border-neutral-100 focus:border-primary-500 ${containerStyle}`}
            >
              {/* if icon was sent, display it */}
              {icon && (
                <Image source={icon} className={`w-6 h-6 ml-4 ${iconStyle}`} />
              )}
              <TextInput
                ref={ref} // Forwarding the ref to the TextInput
                className={`rounded-full p-4 font-JakartaSemiBold text-[15px] flex-1 ${inputStyle} text-left`}
                secureTextEntry={secureTextEntry}
                {...props}
              />
            </View>
          </View>
        </TouchableWithoutFeedback>
      </ScrollView>
    </KeyboardAvoidingView>
  ),
);

export default InputField;
