import React from "react";
import {
  View,
  // Text,
  TouchableOpacity,
  TextInput,
  Alert,
  StyleSheet,
  StatusBar,
  Image,
  ActivityIndicator,
} from "react-native";
import * as Animatable from "react-native-animatable";
import { RadioButton,Text } from 'react-native-paper';
import { Dialog } from "react-native-simple-dialogs";
import { LinearGradient } from "expo-linear-gradient";
// import FontAwesome from "react-native-vector-icons/FontAwesome";
// import Feather from "react-native-vector-icons/Feather";
import { AuthContext } from "../components/context";

import globalStyle from "../utils/styles";
// import { useTheme } from "react-native-paper";
import { apiSignUp } from "../utils/network";

import colors from "../config/colors";
import { ScrollView } from "react-native-gesture-handler";

function SignUpScreen({ navigation }) {
  const [data, setData] = React.useState({
    name: "",
    email: "",
    phone: "",
    gender: "",
    position: "",
    county: "",
    password: "",
    c_password: "",
    check_nameInputChange: true,
    check_emailInputChange: true,
    check_phoneInputChange: true,
    check_genderInputChange: false,
    check_positionInputChange: true,
    check_countyInputChange: true,
    check_passwordInputChange: true,
    check_cpasswordInputChange: true,
  });
  const [preload, setPreload] = React.useState({ visible: false });
  const { signUp } = React.useContext(AuthContext);
  const validateEmail = (email) => {
    var re = /\S+@\S+\.\S+/;
    return re.test(email);
  }

  const nameInputChange = (val) => {
    let fname = val.split(' ')[0];
    let lname = val.split(' ')[1];
    if (fname.length !== 0 && lname !== undefined &&
      lname) {
      setData({
        ...data,
        name: val,
        check_nameInputChange: true,
      });
    } else {
      setData({
        ...data,
        name: val,
        check_nameInputChange: false,
      });
    }
  };
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
  const phoneInputChange = (val) => {
    if (val.length === 10) {
      setData({
        ...data,
        phone: val,
        check_phoneInputChange: true,
      });
    } else {
      setData({
        ...data,
        phone: val,
        check_phoneInputChange: false,
      });
    }
  };
  const genderInputChange = (val) => {
    if (val.length >= 4 ) {
      setData({
        ...data,
        gender: val,
        check_genderInputChange: true,
      });
    } else {
      setData({
        ...data,
        gender: val,
        check_genderInputChange: false,
      });
    }
  };
  const positionInputChange = (val) => {
    if (val.length >= 4) {
      setData({
        ...data,
        position: val,
        check_positionInputChange: true,
      });
    } else {
      setData({
        ...data,
        position: val,
        check_positionInputChange: false,
      });
    }
  };
  const countynputChange = (val) => {
    if (val.length >= 2) {
      setData({
        ...data,
        county: val,
        check_countyInputChange: true,
      });
    } else {
      setData({
        ...data,
        county: val,
        check_countyInputChange: false,
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
  const registerHandler = () => {
    setPreload({ visible: true });
    if (
      data.check_nameInputChange === false ||
      data.check_emailInputChange === false ||
      data.check_phoneInputChange === false ||
      data.check_genderInputChange === false ||
      data.check_positionInputChange === false || 
      data.check_countyInputChange === false ||
      data.check_passwordInputChange === false ||
      data.check_cpasswordInputChange === false 
    ) {
      setPreload({ visible: false });
      Alert.alert("Empty fields!", "All fields are required", [
        { text: "Okay" },
      ]);
      return;
    }
    let foundUser;
    apiSignUp(data)
      .then((found) => {
        foundUser = found;
        if (foundUser.status !== 200) {
          setPreload({ visible: false });
          Alert.alert(
            "Invalid Access!",
            foundUser.message,
            [{ text: "Okay" }]
          );
          return;
        }
        if (foundUser.status === 200 ) {
          setPreload({ visible: false });
          signUp(foundUser);
          return;
        } else {
          setPreload({ visible: false });
          Alert.alert("Invalid Access!", foundUser.message, [
            { text: "Okay" },
          ]);
          return;
        }
      })
      .catch((error) => {
        setPreload({ visible: false });
        Alert.alert(
          "Access error!",
          error,
          [{ text: "Okay" }]
        );
        return;
      });
  };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={colors.primary} barStyle="light-content" />
      <View style={styles.header}>
        <Text style={[styles.text_header, { textAlign: "center" }]}>
          Create Account
        </Text>
      </View>
      <Animatable.View animation="fadeInUpBig" style={styles.footer}>
        <ScrollView>
          {/* name */}
          <Text style={styles.text_footer}>Full Name</Text>
          <View style={styles.action}>
            <TextInput
              placeholder=""
              value={data.name}
              style={styles.textInput}
              autoCapitalize="none"
              onChangeText={(val) => nameInputChange(val)}
            />
          </View>
          {data.check_nameInputChange === false && (
            <Animatable.View animation="fadeInLeft" duration={500}>
              <Text style={styles.errorMsg}>First and last name required</Text>
            </Animatable.View>
          )}
          {/* email */}
          <Text style={styles.text_footer}>Email Address</Text>
          <View style={styles.action}>
            <TextInput
              placeholder=""
              value={data.email}
              style={styles.textInput}
              autoCapitalize="none"
              onChangeText={(val) => emailInputChange(val)}
            />
          </View>
          {data.check_emailInputChange === false && (
            <Animatable.View animation="fadeInLeft" duration={500}>
              <Text style={styles.errorMsg}>Enter valid email</Text>
            </Animatable.View>
          )}
          {/* phone */}
          <Text style={styles.text_footer}>Phone Number</Text>
          <View style={styles.action}>
            <TextInput
              placeholder=""
              value={data.phone}
              style={styles.textInput}
              autoCapitalize="none"
              onChangeText={(val) => phoneInputChange(val)}
            />
          </View>
          {data.check_phoneInputChange === false && (
            <Animatable.View animation="fadeInLeft" duration={500}>
              <Text style={styles.errorMsg}>Enter valid phone</Text>
            </Animatable.View>
          )}
          {/* gender */}
          <Text style={styles.text_footer}>Gender</Text>
          <View style={styles.action}>
            <RadioButton.Group onValueChange={
              v => genderInputChange(v)} value={data.gender}>
              <View style={{flexDirection:"row"}}>
                <RadioButton.Item color={colors.black} style={styles.radio} label="Female" value="FEMALE"/>
                <RadioButton.Item color={colors.black} style={styles.radio} label="Male" value="MALE"/>
              </View>
            </RadioButton.Group>
          </View>
          {/* job title */}
          <Text style={styles.text_footer}>Leadership Position</Text>
          <View style={styles.action}>
            <TextInput
              placeholder=""
              value={data.position}
              style={styles.textInput}
              autoCapitalize="none"
              onChangeText={(val) => positionInputChange(val)}
            />
          </View>
          {data.check_positionInputChange === false && (
            <Animatable.View animation="fadeInLeft" duration={500}>
              <Text style={styles.errorMsg}>Enter valid job title e.g. elected MCA</Text>
            </Animatable.View>
          )}
          {/* county */}
          <Text style={styles.text_footer}>County</Text>
          <View style={styles.action}>
            <TextInput
              placeholder=""
              value={data.county}
              style={styles.textInput}
              autoCapitalize="none"
              onChangeText={(val) => countynputChange(val)}
            />
          </View>
          {data.check_countyInputChange === false && (
            <Animatable.View animation="fadeInLeft" duration={500}>
              <Text style={styles.errorMsg}>Enter valid county name</Text>
            </Animatable.View>
          )}
          {/* password */}
          <Text style={[styles.text_footer, { marginTop: 0 }]}>Password</Text>
          <View style={styles.action}>
            <TextInput
              placeholder=""
              value={data.password}
              secureTextEntry={true}
              style={styles.textInput}
              autoCapitalize="none"
              onChangeText={(val) => passwordInputChange(val)}
            />
          </View>
          {data.check_passwordInputChange === false && (
            <Animatable.View animation="fadeInLeft" duration={500}>
              <Text style={styles.errorMsg}>Enter atleast 8 characters </Text>
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
              style={styles.textInput}
              autoCapitalize="none"
              onChangeText={(val) => cpasswordInputChange(val)}
            />
          </View>
          {data.check_cpasswordInputChange === false && (
            <Animatable.View animation="fadeInLeft" duration={500}>
              <Text style={styles.errorMsg}>Passwords do not match</Text>
            </Animatable.View>
          )}
          {/* buttons */}
          <View style={styles.button}>
            <TouchableOpacity
              style={styles.signIn}
              onPress={() => {
                registerHandler();
              }}
            >
              <LinearGradient
                colors={[colors.primary, colors.primary_dark]}
                style={styles.signIn}
              >
                <Text style={(styles.textSign, { color: colors.white })}>
                  Create Account
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
          <View style={styles.btnLinks}>
            <TouchableOpacity
              onPress={() => {
                navigation.navigate("SignInScreen");
              }}
            >
              <Text style={{ color: colors.primary, margin: 10 }}>
                <Text style={{color:colors.grey}}>Have Account? </Text>
                 Login Here
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
export default SignUpScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary,
  },
  header: {
    flex: 1,
    justifyContent: "flex-end",
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  footer: {
    flex: 10,
    backgroundColor: colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 30,
  },
  radio:{
    backgroundColor: colors.primary, 
    borderRadius:40,
    height:50,
    flex:1,
    margin:10,
    width:110
  },
  text_header: {
    color: "#fff",
    fontWeight: '900',
    fontSize: 16,
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
    paddingBottom: 0,
  },
  actionError: {
    flexDirection: "row",
    marginTop: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#FF0000",
    paddingBottom: 5,
  },
  textInput: {
    flex: 1,
    paddingLeft: 30,
    marginBottom:2,
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
    textAlign:"center",
  },
  button: {
    alignItems: "center",
    marginTop: 20,
    height:55,
    flex: 1,
    width: "100%",
  },
  btnLinks:{
    flexDirection:"row",
    marginTop:20,
    justifyContent:"center",
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
