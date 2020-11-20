import React from "react";
import {
  Text,
  View,
  ScrollView,
  Image,
  StatusBar,
  Modal,
  Alert,
  StyleSheet,
  Dimensions,
  FlatList,
  TouchableOpacity,
  TouchableHighlight,
  SafeAreaView,
  ActivityIndicator,
} from "react-native";
import {Picker} from '@react-native-community/picker';
import { useFocusEffect } from "@react-navigation/native";
import * as Animatable from "react-native-animatable";
import { LinearGradient } from "expo-linear-gradient";
import * as Network from 'expo-network';
import { useTheme } from "@react-navigation/native";
import { AuthContext } from "../components/context";
import AsyncStorage from "@react-native-community/async-storage";
import globalStyle from "../utils/styles";
import colors from "../config/colors";
import { apiCourses, apiDropCourse, apiEnrollCourse } from "../utils/network";
import Icon from "react-native-vector-icons/Ionicons";
/**  styles */
import profileStyles from '../utils/profile_styles';
import configs from "../config/configs";
import { color } from "react-native-reanimated";
const pstyles = StyleSheet.create({ ...profileStyles });
function CoursesScreen({ navigation }) {
  const { signOut } = React.useContext(AuthContext);
  const theme = useTheme();
  const [preload, setPreload] = React.useState({ visible: false });
  const [course, setCourse ] = React.useState([]);
  const [morecourse, setMoreCourse ] = React.useState([]);
  const [actionMeta, setActionMeta ] = React.useState({drop: null, enroll: null});
  const [token, setToken ] = React.useState(null);
  const [render, setRender ] = React.useState(false);
  const [modalVisible, setModalVisible] = React.useState(false);
  const [selectedValue, setSelectedValue] = React.useState("");

  const getCourses = async (xtoken) =>{
      await apiCourses(xtoken)
      .then( (res) => {
        setCourse(res.payload.myc);
        setMoreCourse(res.payload.all);
      })
      .catch((error) => {
        setCourse(...course);
        setMoreCourse(...morecourse);
        return [];
      });
  }
  const handleEnrollables = () => {
    if ( morecourse.length === 0 )
    {
      Alert.alert('Action message', 'There are no more courses to enroll',[{text:'Okay'}]);
      return;
    }
    else
    {
      setModalVisible(!modalVisible);
      return;
    }
  }
  /** check if user is still active */
  useFocusEffect(
    React.useCallback(() => {
      // Do something when the screen is focused
      setPreload({visible:true});
      async function isConnectedDevice() {
        await Network.getNetworkStateAsync()
          .then( async (netstat) => {
            if(!netstat.isInternetReachable)
            {
              Alert.alert('Connection', 'Connection error, check your data',[{text:'Okay'}]);
              return;
            }
            await AsyncStorage.getItem("userToken")
            .then( async (token) => {
                setToken(token);
                await getCourses(token);
                setPreload({visible:false});
            })
            .catch( (err) => {
            });
          })
          .catch((error) => {
            setPreload({visible:false});
            Alert.alert('Connection warning', error,
            [{text:'Okay'}]);
          });
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
  const completeDropCourse = async (course) => {
    setPreload({visible: true});
    if( course === null )
    {
      setPreload({visible:false});
      Alert.alert(
        'Action Status', 
        "Please select a course",
        [
          { text: "Okay",}
        ],
      );
      return;
    }
    await apiDropCourse(course, token)
    .then( (cRes) =>{
      // console.log("sct::: " + JSON.stringify(cRes));
      if( cRes.status === 200 )
      {
        setRender(!render);
        setPreload({visible: false});
        Alert.alert(
          'Action Status', 
          cRes.message,
          [
            {
              text: "Cancel",
            },
            { text: "Okay",}
          ],
        );
        return;
      }else{
        setPreload({visible: false});
        setRender(!render);
        Alert.alert(
          'Action Warning', 
          cRes.message,
          [
            { text: "Okay",}
          ],
        );
        return;
      }
    }).catch((error) =>{
      setPreload({visible: false});
      setRender(!render);
      Alert.alert(
        'Action Status', 
        error,
        [
          { text: "Okay",}
        ],
      );
      return;
    });
  }
  const triggerDropCourse = (course, title) => {
    setActionMeta({...actionMeta, drop: course});
    Alert.alert(
      'Confirm Action', 
      'Are you sure you want to drop ' + title + ' course?',
      [
        {
          text: "Cancel",
        },
        { text: "Drop", onPress: () => completeDropCourse(course) }
      ],
      { cancelable: false }
    );
  }
  const handleEnrollment = async ()=>{
    setPreload({visible:true});
    // console.log(selectedValue);
    if( selectedValue.length === 0 )
    {
      setPreload({visible:false});
      Alert.alert(
        'Action Status', 
        "Please select a course",
        [
          { text: "Okay",}
        ],
      );
      setModalVisible(!modalVisible);
      return;
    }
    await apiEnrollCourse(selectedValue, token)
    .then((eRes) => {
      if( eRes.status === 200 )
      {
        setRender(!render);
        setPreload({visible: false});
        setSelectedValue("");
        Alert.alert(
          'Action Status', 
          eRes.message,
          [
            { text: "Okay", onPress: () => setModalVisible(!modalVisible)}
          ],
        );
        return;
      }else{
        setPreload({visible: false});
        setSelectedValue("");
        Alert.alert(
          'Action Warning', 
          eRes.message,
          [
            { text: "Okay", onPress: () => setModalVisible(!modalVisible)}
          ],
        );
        return;
      }
    }).catch((error) => {
      setPreload({visible:false});
      Alert.alert(
        'Action Warning', 
        error,
        [
          { text: "Okay", onPress: () => setModalVisible(!modalVisible)}
        ],
      );
      return;
    });
  }
  const Item = ({ id, title }) => (
    <TouchableHighlight style={[globalStyle.listItem, {marginBottom:15, marginTop:10}]} underlayColor="#f1f1f1">
      <Animatable.View animation="bounceIn" duration={10}>
        <View style={[globalStyle.row, { marginBottom: 4 }]}>
          <View style={[globalStyle.text, {flex:8}]}>
            <Text
              style={[
                globalStyle.name,
                { color: colors.primary, textTransform: "capitalize", fontSize:20 },
              ]}
            >
              {title}
            </Text>
          </View>
          <View style={[globalStyle.text, {flex:1}]}>
            <TouchableOpacity onPress={() => triggerDropCourse(id, title) }>
              <Icon style={styles.icon} name="ios-close-circle-outline" size={35} />
            </TouchableOpacity>
          </View>
        </View>
      </Animatable.View>
    </TouchableHighlight>
  );
  const renderItem = ({ item }) => <Item id={item.id} title={item.name} />;

  return (
    <View style={[globalStyle.container, {backgroundColor:colors.white}]}>
      <StatusBar barStyle={theme.dark ? "light-content" : "default"} />
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView>
          <View style={pstyles.cardContainer}>
            {/* course meta */}
            <View style={[styles.gridColumn,{flexDirection:"row"}]}>
              <View style={[styles.gridCell, {flex:4, backgroundColor:colors.container_grey}]}>
                <Text style={styles.gridCellTitle}>My enrollments</Text>
              </View>
              <View style={[styles.gridCell, {flex:2, backgroundColor:colors.container_grey}]}>
                <TouchableOpacity onPress={ () => handleEnrollables() } style={styles.signIn}>
                    <LinearGradient colors={[colors.primary_dark, colors.primary]} style={styles.signIn}>
                    <Text style={[styles.gridCellText, {color:colors.white}]}>Enroll new</Text>
                    </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
            {/* modal */}
            {modalVisible === true && (
            <View style={{padding:40}}>
              <View style={styles.inputContainer}>
                <View style={{flexDirection:"row"}}>
                  <View style={{flex:10}}>
                    <Text style={[styles.gridCellTitle,{textAlign:"center"}]}>Select Course</Text>
                  </View>
                  <View style={{flex:4}}>
                    <TouchableOpacity onPress={()=> setModalVisible(!modalVisible)} style={{flexDirection:"row", justifyContent:"center"}}>
                      <Icon style={[styles.icon, {color:colors.primary,marginRight:3}]} name="ios-close-circle" size={20} />
                      <Text style={{textAlignVertical:"center", color:colors.primary,}}>Close</Text>
                    </TouchableOpacity>
                  </View>
                </View>
                <Picker
                style={{width:"100%", position:"relative", marginBottom:40,marginTop:40, borderColor:colors.primary}}
                selectedValue={selectedValue}
                onValueChange={(itemValue, itemIndex) => setSelectedValue(itemValue)}>
                  <Picker.Item label='Select a course' value='' />
                    {morecourse.map((item, index) => {
                      return (
                        <Picker.Item
                          label={item.name.toLowerCase()}
                          value={item.id}
                          key={index}
                        />
                      );
                    })}
                  </Picker>
              </View>
              <View style={[styles.button, styles.inputContainer]}>
                {/* login button */}
                <TouchableOpacity
                  style={[styles.signIn, {width:"90%",}]}
                  onPress={() => {
                    handleEnrollment();
                  }}
                >
                  <LinearGradient
                    colors={[colors.primary, colors.primary_dark]}
                    style={[styles.signIn,{height:50}]}
                  >
                    <Text style={(styles.textSign, { color: colors.white })}>
                      Enroll Selected
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
            )}
            {/* end modal */}
            { modalVisible === false && (
              <View style={{paddingTop:10}}>
                <FlatList
                  data={course}
                  renderItem={renderItem}
                  keyExtractor={(item) => item.id.toString()}
                />
              </View>
            )}
            {/* end meta */}
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
  inputContainer: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
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
  gridCellLabel:{
    marginTop:0,
    marginBottom:0,
    color:colors.black_light,
  },
  gridCellTitle:{
    marginTop:0,
    marginBottom:0,
    color:colors.primary,
    fontSize:18,
    fontWeight:"700",
  },
  signIn: {
    width: "100%",
    height: 30,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 13,
  },
  tOpacity:{
    alignItems:"flex-start",
  },
  icon:{
    color: colors.secondary,
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
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22,
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 10,
    alignItems: "center",
    width:"80%",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5
  },
  openButton: {
    backgroundColor: "#F194FF",
    borderRadius: 20,
    padding: 10,
    elevation: 2
  },
  textStyle: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center"
  },
  modalText: {
    marginBottom: 15,
    textAlign: "center"
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

});

export default CoursesScreen;
