import { Text, ScrollView, View, Image, TextInput, Alert } from "react-native";
import { Link, router } from "expo-router";

import { icons, images } from "@/constants";
import InputField from "@/components/InputField";
import { useState, useRef } from "react";
import CustomButton from "@/components/CustomButton";
import OAuth from "@/components/OAuth";
import { useSignUp } from "@clerk/clerk-expo";
import { ReactNativeModal } from "react-native-modal";
import { fetchAPI } from "@/lib/fetch";
const SignUp = () => {
  const { isLoaded, signUp, setActive } = useSignUp(); // Clerk SignUp hook
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Refs for each input field, we need to hold them so the user could hit Next on his keyboard and go to the next input
  const nameInputRef = useRef<TextInput>(null);
  const emailInputRef = useRef<TextInput>(null);
  const passwordInputRef = useRef<TextInput>(null);

  // This state holds an object containing the register form
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  // This state holds an object containing information about the verification, state, error (if there is one) and the code
  const [verification, setVerification] = useState({
    state: "default",
    error: "",
    code: "",
  });

  // Most of the logic of this sign up press function comes from Clerk, Docs:https://clerk.com/docs/quickstarts/expo , we are using the SignUp hook from Clerk to create a new user, then we will send an email verification code
  const onSignUpPress = async () => {
    if (!isLoaded) {
      return;
    }

    try {
      await signUp.create({
        emailAddress: form.email,
        password: form.password,
      });
      // Sending a verification email to the user
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      // Update the verification state to pending
      setVerification({
        ...verification,
        state: "pending",
      });
    } catch (err: any) {
      // See https://clerk.com/docs/custom-flows/error-handling
      // for more info on error handling
      Alert.alert("Error", err.errors[0].longMessage);
    }
  };
  // Verifying the code sent by email, once again most of the logic comes from Clerk
  const onPressVerify = async () => {
    if (!isLoaded) {
      return;
    }

    try {
      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code: verification.code,
      });
      // If verification was successful we will create a session and update the verification state to "success"
      if (completeSignUp.status === "complete") {
        // Creating database user
        await fetchAPI("/(api)/user", {
          method: "POST",
          body: JSON.stringify({
            name: form.name,
            email: form.email,
            clerkId: completeSignUp.createdSessionId,
          }),
        });
        await setActive({ session: completeSignUp.createdSessionId });
        setVerification({
          ...verification,
          state: "success",
        });
      } else {
        setVerification({
          ...verification,
          error: "Verification Failed",
          state: "pending",
        });
      }
    } catch (err: any) {
      // See https://clerk.com/docs/custom-flows/error-handling
      // for more info on error handling
      setVerification({
        ...verification,
        error: err.errors[0].longMessage,
        state: "pending",
      });
    }
  };

  return (
    <ScrollView className="flex-1 bg-white">
      <View className="flex-1 bg-white">
        <View className="relative w-full h-[200px]">
          <Image source={images.signUpCar} className="z-0 w-full h-[200px]" />
          <Text className="text-2xl text-black font-JakartaSemiBold absolute bottom-5 left-5">
            Create Your Account
          </Text>
        </View>
        <View className="p-5">
          <InputField
            ref={nameInputRef}
            label="Name"
            placeholder="Enter your name"
            icon={icons.person}
            value={form.name}
            onChangeText={(value) => setForm({ ...form, name: value })}
            returnKeyType="next"
            onSubmitEditing={() => emailInputRef.current?.focus()}
          />
          <InputField
            label="Email"
            ref={emailInputRef}
            placeholder="Enter your email"
            icon={icons.email}
            value={form.email}
            onChangeText={(value) => setForm({ ...form, email: value })}
            onSubmitEditing={() => passwordInputRef.current?.focus()}
            returnKeyType="next"
          />
          <InputField
            ref={passwordInputRef}
            label="Password"
            placeholder="Enter your password"
            icon={icons.lock}
            value={form.password}
            secureTextEntry={true}
            onChangeText={(value) => setForm({ ...form, password: value })}
            returnKeyType="done"
          />
          <CustomButton
            title={"Sign Up"}
            onPress={onSignUpPress}
            className="mt-6"
          />
          {/* OAuth*/}
          <OAuth />

          <Link
            href="/sign-in"
            className="text-md text-center text-general-200 mt-5"
          >
            <Text>Already have an account? </Text>
            <Text className=" text-primary-500">Log In</Text>
          </Link>
        </View>
        {/*Verification Modal*/}
        <ReactNativeModal
          isVisible={verification.state === "pending"}
          onModalHide={() => {
            if (verification.state === "success") setShowSuccessModal(true);
          }}
        >
          <View className="bg-white px-7 py-9 rounded-2xl min-h-[300px]">
            <Text className="text-2xl font-JakartaExtraBold mb-2">
              Verification
            </Text>
            <Text className="font-JakartaSemiBold mb-5">
              We have sent a verifiction code to {form.email}
            </Text>
            <InputField
              label="Code"
              icon={icons.lock}
              placeholder="12345"
              value={verification.code}
              keyboardType="numeric"
              onChangeText={(code) =>
                setVerification({
                  ...verification,
                  code: code,
                })
              }
            />
            {verification.error && (
              <Text className="text-red-500 text-sm mt-1">
                {verification.error}
              </Text>
            )}
            <CustomButton
              title="Verify Email"
              onPress={onPressVerify}
              className="mt-5 "
            />
          </View>
        </ReactNativeModal>

        <ReactNativeModal isVisible={showSuccessModal}>
          <View className="bg-white px-7 py-9 rounded-2xl min-h-[300px]">
            <Image
              source={images.check}
              className="w-[110px] h-[110px] mx-auto my-5"
            />
            <Text className="text-3xl font-JakartaBold text-center">
              Verified
            </Text>
            <Text className="text-base text-sm text-gray-400 font-Jakarta text-center mt-2">
              You have successfuly verified your account
            </Text>
            <CustomButton
              title="Broswse Home"
              onPress={() => {
                router.push("/(root)/(tabs)/home");
                setShowSuccessModal(false);
              }}
              className="mt-5"
              textVariant="primary"
              bgVariant="primary"
            />
          </View>
        </ReactNativeModal>
      </View>
    </ScrollView>
  );
};
export default SignUp;
