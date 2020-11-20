import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  StatusBar,
  Image,
  Alert,
  Dimensions,
  ActivityIndicator
} from "react-native";
import * as Animatable from "react-native-animatable";
import { LinearGradient } from "expo-linear-gradient";
// import FontAwesome from "react-native-vector-icons/FontAwesome";
// import Feather from "react-native-vector-icons/Feather";
import { AuthContext } from "../components/context";
import { ScrollView } from "react-native-gesture-handler";

// import { useTheme } from "react-native-paper";

import colors from "../config/colors";
import conf from "../config/configs";
import { apiLogin } from "../utils/network";
import { Colors } from "react-native/Libraries/NewAppScreen";

const wlogo = require("../assets/wel-logo.png");

function SignInScreen({ navigation }) {
  const [data, setData] = React.useState({
    email: "alita.s@hotmail.com",
    password: "WEL@2024",
    // email: "",
    // password: "",
    check_emailInputChange: false,
    isValidUser: true,
    isValidPassword: true,
  });
  const [preload, setPreload] = React.useState({ visible: false });

  const { signIn } = React.useContext(AuthContext);
  
  const validateEmail = (email) => {
    var re = /\S+@\S+\.\S+/;
    return re.test(email);
  }
  const emailInputChange = (val) => {
    if (validateEmail(val)) {
      setData({
        ...data,
        email: val,
        check_emailInputChange: true,
        isValidUser: true,
      });
    } else {
      setData({
        ...data,
        email: val,
        check_emailInputChange: false,
        isValidUser: false,
      });
    }
  };
  const handlePasswordChange = (val) => {
    if (val.trim().length >= 8) {
      setData({
        ...data,
        password: val,
        isValidPassword: true,
      });
    } else {
      setData({
        ...data,
        password: val,
        isValidPassword: false,
      });
    }
  };
  const handleValidUser = (val) => {
    if (validateEmail(val)) {
      setData({
        ...data,
        isValidUser: true,
      });
    } else {
      setData({
        ...data,
        isValidUser: false,
      });
    }
  };
  const loginHandler = () => {
    if (!data.email || !data.password ) {
      Alert.alert(
        "Empty fields!",
        "Valid Email and Password must be provided",
        [{ text: "Okay" }]
      );
      return;
    }
    let foundUser;
    setPreload({ visible: true });
    apiLogin(data)
      .then((found) => {
        // console.log(found);
        foundUser = found;
        if (foundUser.status === 201) {
          Alert.alert("Access Denied!", foundUser.message, [
            { text: "Okay" },
          ]);
          setPreload({ visible: false });
          return;
        }
        if (foundUser.status !== 200) {
          Alert.alert("Invalid Access!", "Invalid user information", [
            { text: "Okay" },
          ]);
          setPreload({ visible: false });
          return;
        }
        setPreload({ visible: false });
        signIn(foundUser);
      })
      .catch((error) => {
        console.log("vvv " + error);
        Alert.alert("Access error!", "Network request error", [
          { text: "Okay" },
        ]);
        setPreload({ visible: false });
        return;
      });
  };
  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={colors.primary} barStyle="dark-content" />
      <View style={styles.header}>
        <Animatable.Image
          animation="bounceIn"
          duration={1500}
          source={wlogo}
          resizeMode="contain"
          style={styles.logo}
        />
      </View>
      <Animatable.View animation="fadeInUpBig" style={styles.footer}>
        <ScrollView>
          <View style={styles.inputContainer}>
            <TextInput
              placeholder="Email Address"
              underlineColorAndroid="transparent"
              style={styles.textInput}
              value={data.email}
              autoCapitalize="none"
              onChangeText={(val) => emailInputChange(val)}
              onEndEditing={(e) => handleValidUser(e.nativeEvent.text)}
            />
          </View>
          {data.isValidUser ? null : (
            <Animatable.View animation="fadeInLeft" duration={500}>
              <Text style={styles.errorMsg}>Provide a valid email address</Text>
            </Animatable.View>
          )}
          <View style={styles.action}>
            <TextInput
              placeholder="Your Password"
              secureTextEntry={true}
              value={data.password}
              style={styles.textInput}
              autoCapitalize="none"
              onChangeText={(val) => handlePasswordChange(val)}
            />
          </View>
          {data.isValidPassword ? null : (
            <Animatable.View animation="fadeInLeft" duration={500}>
              <Text style={styles.errorMsg}>Provide a valid password</Text>
            </Animatable.View>
          )}
          {/* buttons */}
          <View style={styles.button}>
            {/* login button */}
            <TouchableOpacity
              style={styles.signIn}
              onPress={() => {
                loginHandler();
              }}
            >
              <LinearGradient
                colors={[colors.primary, colors.primary_dark]}
                style={styles.signIn}
              >
                <Text style={(styles.textSign, { color: colors.white })}>
                  Login
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
          <View style={styles.btnLinks}>
            <TouchableOpacity
              onPress={() => {
                navigation.navigate("RequestPwdResetScreen");
              }}
            >
              <Text style={{ color: colors.primary, marginTop: 10 }}>
                Forgot password?
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                navigation.navigate("SignUpScreen");
              }}
            >
              <Text style={{ color: colors.primary, margin: 10 }}>
                <Text style={{color:colors.grey}}>New User? </Text>
                 Create Account
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </Animatable.View>
      {/* activity indicator */}
     { preload.visible === true && (
        <View style={styles.loading}>
          <ActivityIndicator color={colors.primary_dark} animating={preload.visible} size="large" />
        </View>
     )}
      {/* end indicator */}
    </View>
  );
}
export default SignInScreen;
const { height } = Dimensions.get("screen");
const height_logo = height * 0.20;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  header: {
    flex: 3,
    justifyContent: "center",
    alignItems: "center",
  },
  footer: {
    flex: 7,
    backgroundColor: colors.white,
    paddingHorizontal: 30,
    paddingVertical: 30,
  },
  text_header: {
    color: colors.primary,
    fontWeight: "bold",
    fontSize: 30,
  },
  
  logo: {
    marginTop:"10%",
    width: height_logo,
    height: height_logo,
  },
  text_footer: {
    color: "#05375a",
    fontSize: 18,
  },
  action: {
    flexDirection: "row",
    marginTop: 10,
    borderBottomWidth: 0,
    borderBottomColor: "#f2f2f2",
    paddingBottom: 5,
  },
  btnLinks:{
    flexDirection:"row",
    marginTop:20,
    justifyContent:"center",
  },
  actionError: {
    flexDirection: "row",
    marginTop: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#FF0000",
    paddingBottom: 5,
  },
  inputContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  textInput: {
    flex: 1,
    paddingLeft: 10,
    marginBottom:15,
    borderWidth:1,
    borderColor:colors.input,
    color: colors.black,
    height:55,
    borderRadius:30,
    textAlign: "center",
    fontSize: 14,
  },
  floatcon:{
    padding:10
  },
  errorMsg: {
    color: "#FF0000",
    fontSize: 14,
    textAlign: "center"
  },
  button: {
    alignItems: "center",
    marginTop: 20,
    height:55,
    flex: 1,
    width: "100%",
  },
  signIn: {
    width: "100%",
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 25,
  },
  signInHalf: {
    width: "48%",
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 4,
  },
  textSign: {
    fontSize: 18,
    fontWeight: "bold",
  },
  loading: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center'
  }
});
