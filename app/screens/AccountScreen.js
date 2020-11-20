import React from "react";
import {
  Text,
  View,
  ScrollView,
  Image,
  StatusBar,
  Alert,
  StyleSheet,
  TextInput,
  Dimensions,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { Button, Overlay } from 'react-native-elements';
import { LinearGradient } from "expo-linear-gradient";
import * as ImagePicker from 'expo-image-picker';
import * as Network from 'expo-network';
import { useTheme } from "@react-navigation/native";
import { AuthContext } from "../components/context";
import AsyncStorage from "@react-native-community/async-storage";
import globalStyle from "../utils/styles";
import colors from "../config/colors";
import Icon from "react-native-vector-icons/Ionicons";
import {Picker} from '@react-native-community/picker';
import { apiProfileUpdate,apiPicUpdate } from "../utils/network";
/**  styles */
import profileStyles from '../utils/profile_styles';
import configs from "../config/configs";
import { color } from "react-native-reanimated";
const pstyles = StyleSheet.create({ ...profileStyles });
function AccountScreen({ navigation }) {
  const { signOut } = React.useContext(AuthContext);
  const theme = useTheme();
  const [preload, setPreload] = React.useState({ visible: false });
  const avatar = configs.media_api + "avatar.png";
  const [account, setAccount ] = React.useState({});
  const [modalVisible, setModalVisible] = React.useState(false);
  const [render, setRender ] = React.useState(false);
  const [token, setToken ] = React.useState(null);
  const [image, setImage] = React.useState(null);
  const [profile, setProfile ] = React.useState({
    name:"",
    email:"",
    phone:"",
    position:"",
    gender:"all",
    county:"",
    address:"",
    pic:configs.media_api + "avatar.png",
  });
  const handleNameChange = (v) => {
    setProfile({...profile, name: v});
    return;
  }
  const handleEmailChange = (v) => {
    setProfile({...profile, email: v});
    return;
  }
  const handlePhoneChange = (v) => {
    setProfile({...profile, phone: v});
    return;
  }
  const handlePositionChange = (v) => {
    setProfile({...profile, position: v});
    return;
  }
  const handleGenderChange = (v) => {
    setProfile({...profile, gender: v});
    return;
  }
  const handleCountyChange = (v) => {
    setProfile({...profile, county: v});
    return;
  }
  const handleAddressChange = (v) => {
    setProfile({...profile, address: v});
    return;
  }
  const pickImage = async () => {
    setPreload({visible:true});
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });
    if (!result.cancelled) {
      const frm = new FormData();
      let localUri = result.uri;
      let filename = localUri.split('/').pop();
      let match = /\.(\w+)$/.exec(filename);
      let type = match ? 'image/${match[1]}' : 'image';
      type = 'application/octet-stream';
      frm.append('photo', { uri: localUri, name: filename, type });
      // console.log(frm);
      apiPicUpdate(token, frm)
      .then((res) => {
        // console.log(res);
        if( res.status !== 200 )
        {
          setPreload({visible:false});
          Alert.alert("Image upload error", res.message, [{text:"Okay"}]);
          return
        }
        setImage(localUri);
        // console.log(localUri);
        setPreload({visible:false});
      })
      .catch((error) => {
        setPreload({visible:false});
        Alert.alert("mage upload error", error, [{text:"Okay"}]);
        return
      });
    }
  };
  const mimeType =  (ext) => {
    switch(ext){
      case 'jpg':
        return 'image/jpeg';
      case 'jpeg':
        return 'image/jpeg';
      case 'png':
        return 'image/png';
      case 'svg':
        return 'image/svg+xml';
      default:
        return 'image/unknown';
    }
  }
  const handleProfileChange = () => {
    setPreload({visible:true});
    apiProfileUpdate(token, profile)
    .then((res) => {
      // console.log(res);
      if( res.status === 200 )
      {
        AsyncStorage.setItem(configs.secret, JSON.stringify(res.payload))
        .then((str) => {
          setRender(!render);
          setPreload({visible:false});
          Alert.alert("Action Update", res.message, [{text:"Okay", onPress:() => signOut() }]);
          return
        })
        .catch((err) => {
          setPreload({visible:false});
          Alert.alert("Action error", err, [{text:"Okay"}]);
          return
        });
      }else
      {
        setPreload({visible:false});
        Alert.alert("Action Error", res.message, [{text:"Okay"}]);
        return
      }
    })
    .catch((error) => {
      setPreload({visible:false});
      Alert.alert("Action Error", error, [{text:"Okay"}]);
      return
    });
  }
  /** check if user is still active */
  useFocusEffect(
    React.useCallback(() => {
      // Do something when the screen is focused
      setPreload({visible:true});
      async function isConnectedDevice() {
        const { status } = await ImagePicker.requestCameraRollPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permissions Warning','Sorry, App need camera roll permissions');
        }
        await AsyncStorage.getItem(configs.secret)
        .then((user) => {
          let usr = JSON.parse(user);
          setToken(usr.token);
          setProfile({
            name: usr.name,
            email: usr.email,
            phone: usr.phone,
            position: usr.position,
            gender: usr.gender,
            county: usr.county,
            address: usr.address,
            pic: configs.media_api + usr.profile,
          });
          // console.log(usr.address);
          setAccount(JSON.parse(user));
        })
        .catch( (err) => {
          setAccount({});
        });
        await Network.getNetworkStateAsync()
          .then((netstat) => {
            if(!netstat.isInternetReachable)
            {
              Alert.alert('Connection', 'Connection error, check your data',[{text:'Okay'}]);
              return;
            }
            return;
          })
          .catch((error) => {
            Alert.alert('Connection warning', error,
            [{text:'Okay'}]);
          });
        setPreload({visible:false});
      }
      isConnectedDevice();
      return () => {
        // Do something when the screen is un-focused
        setPreload({ visible: false });
      };
    }, [render])
  );
  /** end user check */

  React.useEffect(() => {
    async function isConnectedDevice() {
      setPreload({visible:true});
      await Network.getNetworkStateAsync()
        .then((netstat) => {
          if(!netstat.isInternetReachable)
          {
            Alert.alert('Connection', 'Connection error, check your data',[{text:'Okay'}]);
            return;
          }
          return;
        })
        .catch((error) => {
          Alert.alert('Connection warning', error,
          [{text:'Okay'}]);
        });
    }
    isConnectedDevice();
    return () => {
      // Do something when the screen is un-focused
      setPreload({ visible: false });
    };
  }, []);
  const RenderContactHeader = () => {
    return (
      <View style={pstyles.headerContainer}>
        <View style={pstyles.coverContainer}>
        <LinearGradient 
        colors={[colors.primary_darker, colors.primary, colors.primary_darker, colors.primary]} 
        style={pstyles.coverImage}>
          <View style={pstyles.coverTitleContainer}>
              <Text style={pstyles.coverTitle} />
            </View>
            <View style={pstyles.coverMetaContainer}>
              <Text style={pstyles.coverName}>{account.name}</Text>
              <Text style={pstyles.coverBio}>{account.position ? account.position : ("no job title")}</Text>
            </View>
        </LinearGradient>
        </View>
        <View style={pstyles.profileImageContainer}>
          <TouchableOpacity style={styles.tOpacity}>
            <Image
              source={{uri: profile.pic}}
              style={pstyles.profileImage}
            />
          </TouchableOpacity>
        </View>
        <View style={{alignItems:"flex-end"}}>
          <TouchableOpacity style={styles.Edit} onPress={() => setModalVisible(!modalVisible)}>
            <Text>Edit profile</Text>
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  return (
    <View style={[globalStyle.container, {backgroundColor:colors.white}]}>
      <StatusBar barStyle={theme.dark ? "light-content" : "default"} />
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView>
          <View style={pstyles.cardContainer}>
            <RenderContactHeader/>
            {/* prof meta */}
            <View style={styles.gridColumn}>
              <View style={styles.gridCell}>
                <TouchableOpacity style={styles.tOpacity}>
                  <Text style={styles.gridCellLabel}>Title</Text>
                  <Text style={styles.gridCellText}>{account.position}</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.gridCell}>
                <TouchableOpacity style={styles.tOpacity}>
                  <Text style={styles.gridCellLabel}>Email</Text>
                  <Text style={styles.gridCellText}>{account.email}</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.gridCell}>
                <TouchableOpacity style={styles.tOpacity}>
                  <Text style={styles.gridCellLabel}>Phone</Text>
                  <Text style={styles.gridCellText}>{account.phone}</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.gridCell}>
                <TouchableOpacity style={styles.tOpacity}>
                  <Text style={styles.gridCellLabel}>Gender</Text>
                  <Text style={styles.gridCellText}>{account.gender}</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.gridCell}>
                <TouchableOpacity style={styles.tOpacity}>
                  <Text style={styles.gridCellLabel}>Address</Text>
                  <Text style={styles.gridCellText}>{account.address ? account.address : ("No address specified")}</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.gridCell}>
                <TouchableOpacity style={styles.tOpacity}>
                  <Text style={styles.gridCellLabel}>County</Text>
                  <Text style={styles.gridCellText}>{account.county}</Text>
                </TouchableOpacity>
              </View>
            </View>
            {/* end meta */}

            {/* modal */}
              <Overlay isVisible={modalVisible} overlayStyle={styles.overlay}>
                <ScrollView style={{padding:20}}>
                  <View>
                    <View style={{flexDirection:"row"}}>
                      <View style={{flex:10}}>
                        <Text style={[styles.gridCellTitle,{textAlign:"center"}]}>Update Profile</Text>
                      </View>
                      <View style={{flex:2}}>
                        <TouchableOpacity onPress={()=> setModalVisible(!modalVisible)}>
                          <Icon style={[styles.icon, {color:colors.secondary}]} name="ios-close-circle" size={30} />
                        </TouchableOpacity>
                      </View>
                    </View>
                    <Text style={styles.inputLabel}>Profile Picture</Text>
                    <Button title="Pick an image" onPress={pickImage} />
                    {image && <Image source={{ uri: image }} style={pstyles.profileImage} />}
                    <Text style={styles.inputLabel}>Full Name</Text>
                    <TextInput
                      style={styles.inputField}
                      value={profile.name}
                      underlineColorAndroid="transparent"
                      onChangeText={text => handleNameChange(text)}
                    />
                    <Text style={styles.inputLabel}>Email Address</Text>
                    <TextInput
                      style={styles.inputField}
                      value={profile.email}
                      underlineColorAndroid="transparent"
                      onChangeText={text => handleEmailChange(text)}
                    />
                    <Text style={styles.inputLabel}>Phone Number</Text>
                    <TextInput
                      style={styles.inputField}
                      value={profile.phone}
                      underlineColorAndroid="transparent"
                      onChangeText={text => handlePhoneChange(text)}
                    />
                    <Text style={styles.inputLabel}>Job Title/Position</Text>
                    <TextInput
                      style={styles.inputField}
                      value={profile.position}
                      underlineColorAndroid="transparent"
                      onChangeText={text => handlePositionChange(text)}
                    />
                    <Text style={styles.inputLabel}>Select Gender</Text>
                    <Picker
                    itemStyle={styles.picker}
                    selectedValue={profile.gender}
                    onValueChange={(itemValue, itemIndex) => handleGenderChange(itemValue)}>
                      <Picker.Item label='Female' value='FEMALE'/>
                      <Picker.Item label='Male' value='MALE'/>
                    </Picker>
                    <Text style={styles.inputLabel}>County</Text>
                    <TextInput
                      style={styles.inputField}
                      value={profile.county}
                      underlineColorAndroid="transparent"
                      onChangeText={text => handleCountyChange(text)}
                    />
                    <Text style={styles.inputLabel}>Address</Text>
                    <TextInput
                      style={styles.inputField}
                      value={profile.address}
                      underlineColorAndroid="transparent"
                      onChangeText={text => handleAddressChange(text)}
                    />
                  </View>
                  <View style={{ marginBottom:40,marginTop:20, justifyContent:"center", alignItems:"center"}}>
                    <TouchableOpacity
                      style={[styles.signIn, {width:200,justifyContent:"center"}]}
                      onPress={() => { handleProfileChange() }}>
                      <LinearGradient
                        colors={[colors.primary, colors.primary_dark]}
                        style={[styles.signIn,{height:50, flexDirection:"row"}]}>
                        <Icon style={[styles.icon, {color:colors.white, margin:5 }]} name="ios-save" size={30} />
                        <Text style={(styles.textSign, { color: colors.white })}>
                        Save changes
                        </Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  </View>
                  {/* activity indicator */}
                  { preload.visible === true && (
                      <View style={styles.loading}>
                        <ActivityIndicator color={colors.primary_dark} animating={preload.visible} size="large" />
                      </View>
                  )}
                    {/* end indicator */}
                </ScrollView>
              </Overlay>
            {/* end modal */}
          </View>
        </ScrollView>
        {/* activity indicator */}
        { preload.visible === true && (
            <View style={styles.loading}>
              <ActivityIndicator color={colors.primary_dark} animating={preload.visible} size="large" />
            </View>
        )}
          {/* end indicator */}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  gridColumn:{
    flexDirection:"column", 
    flex:1,
    marginTop:0,
    marginRight:0,
    marginLeft:0,
  },
  gridCell:{
    flex:1, 
    justifyContent:"center", 
    alignItems:"flex-start", 
    padding:10,
    marginRight:0, 
    paddingLeft:20,
    backgroundColor:colors.white, 
    borderRadius:0,
    borderBottomWidth:1,
    borderBottomColor: colors.container_grey,
  },
  gridCellIcon:{
    width:60, 
    height:60,
    margin:5,
  },
  gridCellText:{
    marginTop:0,
    marginBottom:0,
    color:colors.black,
  },
  gridCellTitle:{
    marginTop:0,
    marginBottom:0,
    color:colors.primary,
    fontSize:18,
    fontWeight:"700",
  },
  gridCellLabel:{
    marginTop:0,
    marginBottom:0,
    color:colors.black_light,
  },
  tOpacity:{
    alignItems:"flex-start",
  },
  signIn: {
    width: "100%",
    height: 30,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 13,
  },
  Edit: {
    width: 100,
    height: 30,
    justifyContent: "center",
    borderBottomWidth:1,
    borderBottomColor:colors.primary_dark,
    borderRightWidth:1,
    borderRightColor:colors.primary_dark,
    alignItems: "center",
    borderRadius: 20,
  },
  loading: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center'
  },
  overlay: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    minWidth:"90%",
    margin:20,
    borderRadius: 20,
  },
  picker:{
    lineHeight:10,
    minWidth:"100%",
    height:100,
    borderRadius: 20,
    backgroundColor:colors.white_dark,
    fontSize: 16,
    padding: 0,
    margin:0,
  },
  inputField: {
    width: "100%",
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    fontSize:16,
    borderRadius: 50,
    backgroundColor:colors.white_dark,
    padding: 10,
  },
  inputLabel: {
    color:colors.black_light,
    padding: 10,
  },

});

export default AccountScreen;
