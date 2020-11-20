import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { StyleSheet } from "react-native";

import SignInScreen from "./SignInScreen";
import SignUpScreen from "./SignUpScreen";
import RequestPwdResetScreen from "./RequestPwdResetScreen";

const RootStack = createStackNavigator();

const RootStackScreen = ({ navigation }) => (
  <RootStack.Navigator headerMode="none">
    <RootStack.Screen name="SignInScreen" component={SignInScreen} />
    <RootStack.Screen name="SignUpScreen" component={SignUpScreen} />
    <RootStack.Screen
      name="RequestPwdResetScreen"
      component={RequestPwdResetScreen}
    />
  </RootStack.Navigator>
);

export default RootStackScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
