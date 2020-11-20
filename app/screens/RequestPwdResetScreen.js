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
  ActivityIndicator,
} from "react-native";
import * as Animatable from "react-native-animatable";
import { LinearGradient } from "expo-linear-gradient";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import { AuthContext } from "../components/context";
import { ScrollView } from "react-native-gesture-handler";


import colors from "../config/colors";
import {
  apiReqReset,
  apiVerifyReset,
  apiFinishReset
} from "../utils/network";

const wlogo = require("../assets/wel-logo.png");

function RequestPwdResetScreen({ navigation }) {
  const [preload, setPreload] = React.useState({ visible: false });
  const [fieldvisible, setFieldVisible] = React.useState({
    email: true,
    code: false,
    passwordResetFields: false,
  });
  const validateEmail = (email) => {
    var re = /\S+@\S+\.\S+/;
    return re.test(email);
  }
  const { signIn } = React.useContext(AuthContext);
  const [data, setData] = React.useState({
    email: "",
    code: "",
    password: "",
    c_password: "",
    check_emailInputChange: true,
    check_passwordInputChange: true,
    check_cpasswordInputChange: true,
  });
  const emailInputChange = (val) => {
    if (validateEmail(val)) {
      setData({
        ...data,
        email: val,
        check_emailInputChange: true,
      });
    } else {
      setData({
        ...data,
        email: val,
        check_emailInputChange: false,
      });
    }
  };
  const passwordInputChange = (val) => {
    if (val.length >= 8) {
      setData({
        ...data,
        password: val,
        check_passwordInputChange: true,
      });
    } else {
      setData({
        ...data,
        password: val,
        check_passwordInputChange: false,
      });
    }
  };
  const cpasswordInputChange = (val) => {
    if (val === data.password) {
      setData({
        ...data,
        c_password: val,
        check_cpasswordInputChange: true,
      });
    } else {
      setData({
        ...data,
        c_password: val,
        check_cpasswordInputChange: false,
      });
    }
  };

  const codeInputChange = (val) => {
    if (val.length === 6) {
      setPreload({visible: true});
      if (!validateEmail(data.email)) {
        setPreload({visible: true});
        Alert.alert("Account Error", "Email address is missing", [
          { text: "Okay" },
        ]);
        return;
      }
      let foundUser;
      apiVerifyReset(val, data.email)
        .then((found) => {
          console.log(found);
          foundUser = found;
          if (foundUser.status !== 200) {
            setPreload({visible: false});
            Alert.alert("Code validation error", foundUser.message, [
              { text: "Okay" },
            ]);
            return;
          }
          setFieldVisible({
            ...fieldvisible,
            email: false,
            code: false,
            passwordResetFields: true,
          });
          setPreload({ visible: false });
        })
        .catch((error) => {
          setPreload({visible: false});
          Alert.alert("Access error!", error, [
            { text: "Okay" },
          ]);
          return;
        });
    } else {
      setData({
        ...data,
        code: val,
      });
    }
  };
  const resendHandler = () => {
    setFieldVisible({
      email: true,
      code: false,
      passwordResetFields: false,
    });
  };
  const requestHandler = () => {
    if (!validateEmail(data.email)) {
      Alert.alert("Empty fields!", "Valid email address must be provided", [
        { text: "Okay" },
      ]);
      return;
    }
    let foundUser;
    setPreload({ visible: true });
    apiReqReset(data.email)
      .then((found) => {
        foundUser = found;
        if (foundUser.status !== 200) {
          setPreload({ visible: false });
          Alert.alert("Account error!", foundUser.message, [
            {text: "Okay",},
          ]);
          return;
        }
        setFieldVisible({
          ...fieldvisible,
          email: false,
          code: true,
          passwordResetFields: false,
        });
        setPreload({ visible: false });
      })
      .catch((error) => {
        setPreload({ visible: false });
        Alert.alert("Access error!", error, [
          { text: "Okay" },
        ]);
        return;
      });
  };

  const changePasswordHandler = () => {
    if (data.password !== data.c_password) {
      Alert.alert("Password error", "Provided passwords must match", [
        { text: "Okay" },
      ]);
      return;
    }
    let foundUser;
    setPreload({ visible: true });
    let postData = {
      email: data.email,
      password: data.password,
      c_password: data.c_password,
    };
    apiFinishReset(postData)
      .then((found) => {
        foundUser = found;
        if (foundUser.status !== 200) {
          setPreload({ visible: false });
          Alert.alert(
            "Account error!",
            foundUser.message,
            [{ text: "Okay" }]
          );
          return;
        }
        setFieldVisible({
          ...fieldvisible,
          email: false,
          code: false,
          passwordResetFields: false,
        });
        setPreload({ visible: false });
        Alert.alert("Success!", "Password Changed!", [
          {
            text: "Okay, take me to login",
            onPress: () => {
              navigation.navigate("SignInScreen");
            },
          },
        ]);
      })
      .catch((error) => {
        setPreload({ visible: false });
        Alert.alert("Access error!", error, [
          { text: "Okay" },
        ]);
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
          {/* phone */}
          {fieldvisible.email === true && (
            <View>
              <Text style={styles.text_footer}>Enter Email Address</Text>
              <View style={styles.action}>
                <TextInput
                  value={data.email}
                  placeholder=""
                  style={styles.textInput}
                  autoCapitalize="none"
                  onChangeText={(val) => emailInputChange(val)}
                />
              </View>
              {data.check_emailInputChange === false && (
                <Animatable.View animation="fadeInLeft" duration={500}>
                  <Text style={styles.errorMsg}>Provide a valid email</Text>
                </Animatable.View>
              )}
              <View style={styles.button}>
                {/* login button */}
                <TouchableOpacity
                  style={styles.signIn}
                  onPress={() => {
                    requestHandler();
                  }}
                >
                  <LinearGradient
                    colors={[colors.primary, colors.primary_dark]}
                    style={styles.signIn}
                  >
                    <Text style={(styles.textSign, { color: colors.white })}>
                    Reset Password
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          )}
          {/* reset fields */}
          {fieldvisible.passwordResetFields === true && (
            <View>
              {/* password */}
              <Text style={[styles.text_footer, { marginTop: 0 }]}>
                New Password
              </Text>
              <View style={styles.action}>
                <TextInput
                  placeholder=""
                  secureTextEntry={true}
                  value={data.password}
                  style={styles.textInput}
                  autoCapitalize="none"
                  onChangeText={(val) => passwordInputChange(val)}
                />
              </View>
              {data.check_passwordInputChange === false && (
                <Animatable.View animation="fadeInLeft" duration={500}>
                  <Text style={styles.errorMsg}>Enter atleast 8 characters</Text>
                </Animatable.View>
              )}
              {/* confirm password */}
              <Text style={[styles.text_footer, { marginTop: 0 }]}>
                Re-enter Password
              </Text>
              <View style={styles.action}>
                <TextInput
                  placeholder=""
                  secureTextEntry={true}
                  value={data.c_password}
                  style={styles.textInput}
                  autoCapitalize="none"
                  onChangeText={(val) => cpasswordInputChange(val)}
                />
              </View>
              {data.check_cpasswordInputChange === false && (
                <Animatable.View animation="fadeInLeft" duration={500}>
                  <Text style={styles.errorMsg}>Passwords do no match</Text>
                </Animatable.View>
              )}
              <View style={styles.button}>
                {/* login button */}
                <TouchableOpacity
                  style={styles.signIn}
                  onPress={() => {
                    changePasswordHandler();
                  }}
                >
                  <LinearGradient
                    colors={[colors.primary, colors.primary_dark]}
                    style={styles.signIn}
                  >
                    <Text style={(styles.textSign, { color: colors.white })}>
                      Reset Password
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          )}
          {/* code enter */}
          {fieldvisible.code === true && (
            <View>
              <Text style={styles.text_footer}>
                Enter verification code sent to your email
              </Text>
              <View style={styles.action}>
                <TextInput
                  placeholder=""
                  value={data.code}
                  style={styles.textInput}
                  autoCapitalize="none"
                  onChangeText={(val) => codeInputChange(val)}
                />
              </View>
              <View>
                <TouchableOpacity
                  style={styles.signIn}
                  onPress={() => {
                    resendHandler();
                  }}
                >
                  <Text style={(styles.textSign, { color: colors.primary })}>
                    Resend Code
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          {/* buttons */}
          <View style={styles.btnLinks}>
            <TouchableOpacity
              onPress={() => {
                navigation.navigate("SignInScreen");
              }}
            >
              <Text style={{ color: colors.primary, margin: 10 }}>
                 Login Instead
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </Animatable.View>
      {/* activity indicator */}
     { preload.visible === true && (
        <View style={styles.loading}>
          <ActivityIndicator animating={preload.visible} size="large" />
        </View>
     )}
      {/* end indicator */}
    </View>
  );
}
export default RequestPwdResetScreen;
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
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 20,
    paddingVertical: 30,
  },
  text_header: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 30,
  },
  text_footer: {
    color: "#05375a",
    fontSize: 18,
    textAlign:"center"
  },
  action: {
    flexDirection: "row",
    marginTop: 10,
    borderBottomWidth: 0,
    borderBottomColor: "#f2f2f2",
    paddingBottom: 5,
  },
  actionError: {
    flexDirection: "row",
    marginTop: 10,
    borderBottomWidth: 0,
    borderBottomColor: "#FF0000",
    paddingBottom: 5,
    textAlign:"center",
  },
  textInput: {
    flex: 1,
    paddingLeft: 30,
    marginBottom:15,
    borderWidth:1,
    borderColor:colors.input,
    color: colors.black,
    height:55,
    borderRadius:30,
    textAlign: "left",
    fontSize: 14,
  },
  errorMsg: {
    color: "#FF0000",
    fontSize: 14,
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
  textSign: {
    fontSize: 18,
    fontWeight: "bold",
  },
  logo: {
    marginTop:"10%",
    width: height_logo,
    height: height_logo,
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
