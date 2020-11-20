import { StatusBar } from "expo-status-bar";
import React, { useEffect } from "react";
import {
  NavigationContainer,
  DarkTheme as NavigationDarkTheme,
  DefaultTheme as NavigationDefaultTheme,
  useTheme,
} from "@react-navigation/native";
import AsyncStorage from "@react-native-community/async-storage";
import * as SplashScreen from "expo-splash-screen";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { createStackNavigator } from "@react-navigation/stack";
import RootStackScreen from "./app/screens/RootStackScreen";
import Icon from "react-native-vector-icons/Ionicons";
import { ActivityIndicator, View, Alert, Platform,} from "react-native";
import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';
import * as Permissions from 'expo-permissions';
import {
  Provider as PaperProvider,
  DarkTheme as PaperDarkTheme,
  DefaultTheme as PaperDefaultTheme,
} from "react-native-paper";

import { AuthContext } from "./app/components/context";

import { keep, find, del } from "./app/utils/storage";
import conf from "./app/config/configs";
import colors from "./app/config/colors";
import {apiDeviceToken} from "./app/utils/network";

/** screens */
import WelcomeScreen from "./app/screens/WelcomeScreen";
import AccountScreen from "./app/screens/AccountScreen";
import CoursesScreen from "./app/screens/CoursesScreen";
import LessonsScreen from "./app/screens/LessonsScreen";
import ExamsScreen from "./app/screens/ExamsScreen";
import AssignmentsScreen from "./app/screens/AssignmentsScreen";
import PerformanceScreen from "./app/screens/PerformanceScreen";
import ForumScreen from "./app/screens/ForumScreen";
import SurveyScreen from "./app/screens/SurveyScreen";

const Drawer = createDrawerNavigator();
const AppHomeStack = createStackNavigator();

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export default function App({navigation}) {
  const [isDarkTheme, setIsDarkTheme] = React.useState(false);
  const [showSplash, updateShowSplash] = React.useState(true);
  const [pushToken, setPushToken] = React.useState(null);
  const [notification, setNotification] = React.useState(false);
  const notificationListener = React.useRef();
  const responseListener = React.useRef();

  const CustomDefaultTheme = {
    ...NavigationDefaultTheme,
    ...PaperDefaultTheme,
    colors: {
      ...NavigationDefaultTheme.colors,
      // ...PaperDefaultTheme.colors,
    },
  };

  const CustomDarkTheme = {
    ...NavigationDarkTheme,
    ...PaperDarkTheme,
    colors: {
      ...NavigationDarkTheme.colors,
      ...PaperDarkTheme.colors,
    },
  };

  const theme = isDarkTheme ? CustomDarkTheme : CustomDefaultTheme;

  const initialLoginState = {
    isLoading: true,
    userName: null,
    userToken: null,
    userData: null,
    userType: null,
  };

  const loginReducer = (prevState, action) => {
    // console.log(action);
    switch (action.type) {
      case "RETRIEVE_TOKEN":
        return {
          ...prevState,
          userToken: action.token,
          userData: action.data,
          userType: action.uType,
          isLoading: false,
        };
      case "LOGIN":
        return {
          ...prevState,
          userName: action.id,
          userToken: action.token,
          userData: action.data,
          userType: action.uType,
          isLoading: false,
        };
      case "LOGOUT":
        return {
          ...prevState,
          userName: null,
          userData: null,
          userToken: null,
          userType: null,
          isLoading: false,
        };
      case "REGISTER":
        return {
          ...prevState,
          userName: action.id,
          userData: action.data,
          userToken: action.token,
          userType: action.uType,
          isLoading: false,
        };
    }
  };
  const [loginState, dispatch] = React.useReducer(
    loginReducer,
    initialLoginState
  );
  const registerForPushNotificationsAsync = async () => {
    if (Constants.isDevice) {
      const { status: existingStatus } = await Permissions.getAsync(Permissions.NOTIFICATIONS);
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Permissions.askAsync(Permissions.NOTIFICATIONS);
        finalStatus = status;
      }
      if (finalStatus !== 'granted') {
        Alert.alert(
          'Push notifications', 
          'Please allow notifications to get the best out of this App. Dont miss a thing!',
          [{text:"Okay"}]
        );
        return;
      }
      const pToken = (await Notifications.getExpoPushTokenAsync()).data;
      setPushToken(pToken);
    } else {
      Alert.alert(
        'Notifications Permission', 
        'Please use a real phone. Simulators not allowed',
        [{text:"Okay"}]
      );
      return;
    }
    if (Platform.OS === 'android') {
      Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }
  };
  const authContext = React.useMemo(
    () => ({
      signIn: async (foundUser) => {
        try {
          //console.log(foundUser);
          const userToken = String(foundUser.payload.token);
          const userName = String(foundUser.payload.email);
          const userData = String(foundUser.payload);
          const userType = String(foundUser.payload.is_student);
          keep("userToken", userToken);
          keep(conf.secret, JSON.stringify(foundUser.payload));
          keep("userType", userType);
          dispatch({
            type: "LOGIN",
            id: userName,
            token: userToken,
            data: userData,
            uType: userType,
          });
        } catch (error) {
          //console.log("sign in error: " + error);
          return;
        }
      },
      signOut: async () => {
        try {
          del("userToken");
          del(conf.secret);
          del("userType");
        } catch (error) {
          //console.log("sign out error: " + error);
        }
        dispatch({
          type: "LOGOUT",
          id: null,
          token: null,
          data: null,
          uType: null,
        });
      },
      signUp: async (foundUser) => {
        try {
          const userToken = String(foundUser.payload.token);
          const userName = String(foundUser.payload.email);
          const userData = String(foundUser.payload);
          const userType = String(foundUser.payload.usertype);
          keep("userToken", userToken);
          keep(conf.secret, JSON.stringify(foundUser.payload));
          keep("userType", userType);
          dispatch({
            type: "REGISTER",
            id: userName,
            token: userToken,
            data: userData,
            uType: userType,
          });
        } catch (error) {
          //console.log("sign in error: " + error);
          return;
        }
      },
      toggleTheme: () => {
        setIsDarkTheme((isDarkTheme) => !isDarkTheme);
      },
    }),
    []
  );
  const hideSplash = async () => {
    if (!showSplash) {
      await SplashScreen.hideAsync().catch((e) => {
        console.warn(e);
      });
    }
  };
  useEffect(() => {
    setTimeout(async () => {
      let userToken;
      let uType;
      userToken = null;
      uType = null;
      notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
        setNotification(notification);
      });
      responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
        console.log(response);
      });
      await registerForPushNotificationsAsync();
      await AsyncStorage.multiGet(["userToken", "userType"])
        .then( async (multiple) => {
          userToken = multiple[0][1];
          uType = multiple[1][1];
          if( userToken !== null )
          {
            apiDeviceToken(userToken, pushToken)
            .then((response) => {}).catch((errors) => { console.log('token err ' + errors)});
            // console.log('null token::: ' + userToken + ' :::');
          }else{
            console.log('null token::: ' + userToken);
          }
          updateShowSplash(false);
          dispatch({ type: "REGISTER", token: userToken, uType: uType });
        })
        .catch((error) => {
          updateShowSplash(false);
          del("userToken");
          del(conf.secret);
          dispatch({ type: "LOGOUT", token: null, userType: null });
        });
    }, 10);
    return () => {
      hideSplash();
      Notifications.removeNotificationSubscription(notificationListener);
      Notifications.removeNotificationSubscription(responseListener);
    };
  }, []);

  const AppHomeStackScreen = ({ navigation }) => (
    <AppHomeStack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.primary,
        },
        headerTintColor: colors.white,
        headerTitleAlign: "center",
        headerTitleStyle: {
          fontWeight: "bold",
        },
      }}
    >
      <AppHomeStack.Screen
        name="AppHome"
        component={WelcomeScreen}
        options={{
          title: "Learner Dashboard",
          headerLeft: () => (
            <Icon.Button
              name="ios-home"
              size={30}
              backgroundColor={colors.primary}
            ></Icon.Button>
          ),
          headerRight: () => (
            <Icon.Button
              name="ios-log-out"
              size={30}
              backgroundColor={colors.primary}
              onPress={() => {
                authContext.signOut();
              }}
            ></Icon.Button>
          ),
        }}
      />
      <AppHomeStack.Screen
        name="Account"
        component={AccountScreen}
        options={{
          title: "My Account",
          headerLeft: () => (
            <Icon.Button
              name="ios-arrow-back"
              size={30}
              backgroundColor={colors.primary}
              onPress={() => navigation.goBack()}
            ></Icon.Button>
          ),
          headerRight: () => (
            <Icon.Button
              name="ios-log-out"
              size={30}
              backgroundColor={colors.primary}
              onPress={() => {
                authContext.signOut();
              }}
            ></Icon.Button>
          ),
        }}
      />
      <AppHomeStack.Screen
        name="Courses"
        component={CoursesScreen}
        options={{
          title: "My Courses",
          headerLeft: () => (
            <Icon.Button
              name="ios-arrow-back"
              size={30}
              backgroundColor={colors.primary}
              onPress={() => navigation.goBack()}
            ></Icon.Button>
          ),
          headerRight: () => (
            <Icon.Button
              name="ios-log-out"
              size={30}
              backgroundColor={colors.primary}
              onPress={() => {
                authContext.signOut();
              }}
            ></Icon.Button>
          ),
        }}
      />
      <AppHomeStack.Screen
        name="Lessons"
        component={LessonsScreen}
        options={{
          title: "My Lessons",
          headerLeft: () => (
            <Icon.Button
              name="ios-arrow-back"
              size={30}
              backgroundColor={colors.primary}
              onPress={() => navigation.goBack()}
            ></Icon.Button>
          ),
          headerRight: () => (
            <Icon.Button
              name="ios-log-out"
              size={30}
              backgroundColor={colors.primary}
              onPress={() => {
                authContext.signOut();
              }}
            ></Icon.Button>
          ),
        }}
      />
      <AppHomeStack.Screen
        name="Exams"
        component={ExamsScreen}
        options={{
          title: "Exams & Quizes",
          headerLeft: () => (
            <Icon.Button
              name="ios-arrow-back"
              size={30}
              backgroundColor={colors.primary}
              onPress={() => navigation.goBack()}
            ></Icon.Button>
          ),
          headerRight: () => (
            <Icon.Button
              name="ios-log-out"
              size={30}
              backgroundColor={colors.primary}
              onPress={() => {
                authContext.signOut();
              }}
            ></Icon.Button>
          ),
        }}
      />
      <AppHomeStack.Screen
        name="Assignments"
        component={AssignmentsScreen}
        options={{
          title: "My Assignments",
          headerLeft: () => (
            <Icon.Button
              name="ios-arrow-back"
              size={30}
              backgroundColor={colors.primary}
              onPress={() => navigation.goBack()}
            ></Icon.Button>
          ),
          headerRight: () => (
            <Icon.Button
              name="ios-log-out"
              size={30}
              backgroundColor={colors.primary}
              onPress={() => {
                authContext.signOut();
              }}
            ></Icon.Button>
          ),
        }}
      />
      <AppHomeStack.Screen
        name="Performance"
        component={PerformanceScreen}
        options={{
          title: "Unit Performance",
          headerLeft: () => (
            <Icon.Button
              name="ios-arrow-back"
              size={30}
              backgroundColor={colors.primary}
              onPress={() => navigation.goBack()}
            ></Icon.Button>
          ),
          headerRight: () => (
            <Icon.Button
              name="ios-log-out"
              size={30}
              backgroundColor={colors.primary}
              onPress={() => {
                authContext.signOut();
              }}
            ></Icon.Button>
          ),
        }}
      />
      <AppHomeStack.Screen
        name="Forum"
        component={ForumScreen}
        options={{
          title: "Forum Discussions",
          headerLeft: () => (
            <Icon.Button
              name="ios-arrow-back"
              size={30}
              backgroundColor={colors.primary}
              onPress={() => navigation.goBack()}
            ></Icon.Button>
          ),
          headerRight: () => (
            <Icon.Button
              name="ios-log-out"
              size={30}
              backgroundColor={colors.primary}
              onPress={() => {
                authContext.signOut();
              }}
            ></Icon.Button>
          ),
        }}
      />
      <AppHomeStack.Screen
        name="Survey"
        component={SurveyScreen}
        options={{
          title: "Unit Surveys",
          headerLeft: () => (
            <Icon.Button
              name="ios-arrow-back"
              size={30}
              backgroundColor={colors.primary}
              onPress={() => navigation.goBack()}
            ></Icon.Button>
          ),
          headerRight: () => (
            <Icon.Button
              name="ios-log-out"
              size={30}
              backgroundColor={colors.primary}
              onPress={() => {
                authContext.signOut();
              }}
            ></Icon.Button>
          ),
        }}
      />
    </AppHomeStack.Navigator>
  );

  if (loginState.isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator color={colors.primary_dark} size="large" />
      </View>
    );
  }

  return (
    <PaperProvider theme={theme}>
      <AuthContext.Provider value={authContext}>
        <NavigationContainer theme={theme}>
          {/* unsecured */}
          {loginState.userToken === null && <RootStackScreen />}
          {/* student area */}
          {loginState.userToken !== null && (
            <Drawer.Navigator screenOptions={{gestureEnabled:false}}>
              <Drawer.Screen name="AppHome" component={AppHomeStackScreen} />
            </Drawer.Navigator>
          )}
        </NavigationContainer>
      </AuthContext.Provider>
    </PaperProvider>
  );
}
