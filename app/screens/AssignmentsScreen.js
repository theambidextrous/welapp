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
  Linking,
  TouchableOpacity,
  TouchableHighlight,
  SafeAreaView,
  ActivityIndicator,
} from "react-native";
import Moment from 'react-moment';
import { Button, Overlay } from 'react-native-elements';
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
import { apiUnits, apiAssignments,apiSubmitAssignments } from "../utils/network";
import * as DocumentPicker from 'expo-document-picker';
import Icon from "react-native-vector-icons/Ionicons";
/**  styles */
import profileStyles from '../utils/profile_styles';
import configs from "../config/configs";
const pstyles = StyleSheet.create({ ...profileStyles });
function AssignmentsScreen({ navigation }) {
  const { signOut } = React.useContext(AuthContext);
  const theme = useTheme();
  const [preload, setPreload] = React.useState({ visible: false });
  const [assignment, setAssignment ] = React.useState([]);
  const [unit, setUnit ] = React.useState([]);
  const [token, setToken ] = React.useState(null);
  const [render, setRender ] = React.useState(false);
  const [modalVisible, setModalVisible] = React.useState(false);
  const [selectedValue, setSelectedValue] = React.useState("all");
  
  const getAssignments = (xtoken, unit) =>{
      let unitid = 'all';
      if(unit){unitid = unit;}
      apiAssignments(xtoken, unitid)
      .then( (res) => {
        // console.log(res);
        setAssignment(res.payload.all);
        return;
      }).catch((error) => {
        setAssignment([]);
        return [];
      });
  }
  const getUnits = (xtoken) =>{
    apiUnits(xtoken)
    .then( (res) => {
      setUnit(res.payload.all);
      return;
    }).catch((error) => {
        setUnit([]);
      return [];
    });
}
const handleSubmission =  (assignment) => {
  setPreload({visible:true});
  DocumentPicker.getDocumentAsync({
    type: "*/*",
    copyToCacheDirectory:false,
    multiple:false,
  })
  .then(({type, uri, name, size }) => {
    if( type === "cancel")
    {
      Alert.alert("Upload Cancelled", "You cancelled the assignment upload process", 
      [
        {text:"Okay"}
      ]);
      return;
    }
    const postData = new FormData();
    postData.append('assignment', assignment);
    postData.append('subfile', {
      uri: uri,
      type: 'application/octet-stream',
      name: name
    });
    apiSubmitAssignments(token, postData)
    .then((res) => {
      // console.log(res);
      if( res.status === 200 )
      {
        setPreload({visible: false});
        Alert.alert("Upload Update", res.message, 
        [
          {text:"Okay Thanks", onPress:() => {
            navigation.navigate("AppHome");
          }}
        ]);
        return;
      }
      if( res.status !== 200 )
      {
        setPreload({visible: false});
        Alert.alert("Upload Errors", res.message, 
        [
          {text:"Try Again"}
        ]);
        return;
      }
    })
    .catch((error) => {
      setPreload({visible: false});
      Alert.alert("Upload Errors", error, 
      [
        {text:"Try Again"}
      ]);
      return;
    });
  })
  .catch((e) => {
    console.log(e);
  });
  setPreload({visible:false});
  return;
}
const handleAssignmentFilter = async () => {
    setPreload({visible:true})
    setModalVisible(!modalVisible);
    await getAssignments(token, selectedValue);
    setPreload({visible:false});
    setRender(!render);
}
const triggerDropCourse = () => {
    return;
}
  useFocusEffect(
    React.useCallback(() => {
      // Do something when the screen is focused
      function isConnectedDevice() {
        Network.getNetworkStateAsync()
          .then( (netstat) => {
            if(!netstat.isInternetReachable)
            {
              Alert.alert('Connection', 'Connection error, check your data',[{text:'Okay'}]);
              return;
            }
            AsyncStorage.getItem("userToken")
            .then( async (token) => {
                setToken(token);
                await getAssignments(token, selectedValue);
                await getUnits(token);
            })
            .catch( (err) => {
            });
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
    }, [render])
  );
  /** end user check */

  React.useEffect(() => {
    function isConnectedDevice() {
      Network.getNetworkStateAsync()
        .then( (netstat) => {
          if(!netstat.isInternetReachable)
          {
            Alert.alert('Connection', 'Connection error, check your data',[{text:'Okay'}]);
            return;
          }
          AsyncStorage.getItem("userToken")
            .then( async (token) => {
                await getAssignments(token, selectedValue);
                setToken(token);
                await getUnits(token);
            })
            .catch( (err) => {
            });
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

  const Item = ({ id, title, content, mark, time}) => (
    <TouchableHighlight style={[globalStyle.listItem, {marginBottom:15, marginTop:10}]} underlayColor="#f1f1f1">
      <Animatable.View animation="bounceIn" duration={10}>
        <View style={[globalStyle.row, { marginBottom: 4 }]}>
          <View style={[globalStyle.text, {flex:1}]}>
            <Text style={styles.lessonTitle}>
              {title}
            </Text>
            <Text style={styles.lessonDescription}>
              {content}
            </Text>
          </View>
        </View>
        
        <View style={[globalStyle.row, { marginBottom: 4 }]}>
            <View style={{flex:1, flexDirection:"row"}}>
                <View style={[globalStyle.text, {flex:1}]}>
                    <TouchableOpacity style={styles.lessonMeta}>
                        <Icon style={styles.lessonIcon} name="ios-calendar" size={20} />
                        <Moment element={Text} format="MMM Do">{time}</Moment>
                    </TouchableOpacity>
                </View>
                <View style={[globalStyle.text, {flex:1}]}>
                    <TouchableOpacity style={styles.lessonMeta} onPress={() => handleSubmission(id) }>
                        <LinearGradient colors={[colors.primary_darker, colors.primary_dark, colors.primary]} style={[styles.signIn,{flexDirection:"row"}]} >
                          <Icon style={[styles.lessonIcon, {color:colors.white}]} name="ios-cloud-upload" size={20} />
                          <Text style={{color:colors.white, fontWeight:"600"}}>Submit</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
      </Animatable.View>
    </TouchableHighlight>
  );
  const renderItem = ({item}) => <Item id={item.id} title={item.title} content={item.content} mark={item.mark} time={item.created_at} />;

  return (
    <View style={[globalStyle.container, {backgroundColor:colors.white}]}>
      <StatusBar barStyle={theme.dark ? "light-content" : "default"} />
      <SafeAreaView style={{ flex: 1 }}>
      <ScrollView>
        <View style={pstyles.cardContainer}>
          <View style={[styles.gridColumn,{flexDirection:"row"}]}>
              <View style={[styles.gridCell, {flex:6, backgroundColor:colors.container_grey}]}>
                <Text style={styles.gridCellTitle}>All Assignments</Text>
              </View>
              <View style={[styles.gridCell, {flex:4, backgroundColor:colors.container_grey}]}>
                <TouchableOpacity onPress={ () => setModalVisible(!modalVisible) } style={styles.signIn}>
                    <LinearGradient colors={[colors.primary_dark, colors.primary]} style={[styles.signIn,{flexDirection:"row"}]}>
                    <Icon style={styles.icon} name="ios-arrow-dropdown-circle" size={20} />
                    <Text style={[styles.gridCellText, {color:colors.white}]}>Filter</Text>
                    </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
        </View>
        </ScrollView>
        <ScrollView>
          <View style={pstyles.cardContainer}>
            <View style={{paddingTop:10}}>
                <FlatList
                  data={assignment}
                  renderItem={renderItem}
                  keyExtractor={(item) => item.id.toString()}
                />
            </View>
            {assignment.length === 0  && (
                <View style={{paddingTop:10}}>
                    <Text style={styles.warn}>No assignments found. Check back later</Text>
                </View>
            )}
            {/* end meta */}
          </View>
        <View style={{padding:0,}}>
          <Overlay isVisible={modalVisible} overlayStyle={styles.overlay}>
            <View>
              <View style={{flexDirection:"row"}}>
                <View style={{flex:10}}>
                  <Text style={[styles.gridCellTitle,{textAlign:"center"}]}>Filter By Unit</Text>
                </View>
                <View style={{flex:2}}>
                  <TouchableOpacity onPress={()=> setModalVisible(!modalVisible)}>
                    <Icon style={[styles.icon, {color:colors.secondary}]} name="ios-close-circle" size={30} />
                  </TouchableOpacity>
                </View>
              </View>
              <View style={{padding:5, flexDirection:"row"}}>
                <View style={{flex:1, marginBottom:0}}>
                  <Picker
                  itemStyle={styles.picker}
                  selectedValue={selectedValue}
                  onValueChange={(itemValue, itemIndex) => setSelectedValue(itemValue)}>
                    <Picker.Item label='Select a unit' value='all'/>
                    {unit.map((item, index) => {
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
              </View>
              <View>
                {/* btn */}
                <View style={[styles.button, styles.inputContainer, styles.mT]}>
                  {/* login button */}
                  <TouchableOpacity
                    style={[styles.signIn, {width:200,}]}
                    onPress={() => { handleAssignmentFilter() }}>
                    <LinearGradient
                        colors={[colors.primary, colors.primary_dark]}
                        style={[styles.signIn,{height:50}]}>
                      <Text style={(styles.textSign, { color: colors.white })}> Filter Assignments</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
                {/* end btn */}
              </View>
            </View>
          </Overlay>
        </View>
        </ScrollView>
        {/* activity indicator */}
        { preload.visible === true && (
            <View style={styles.loading}>
              <ActivityIndicator color={colors.primary_darker} animating={preload.visible} size="large" />
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
  mT:{
    marginTop:10,
  },
  lessonTitle:{
    color: colors.primary,
    textTransform: "capitalize",
    fontSize:16,
    fontWeight:"600",
  },
  lessonDescription:{
    color: colors.grey,
    textTransform: "none",
    fontSize:14,
    marginTop:15,
  },
  lessonMeta:{
    flexDirection:"row", 
    justifyContent:"center", 
    alignContent:"center", 
    alignItems:"center"
  },
  lessonIcon:{
    color: colors.secondary,
    marginRight:5,
  },
  inputContainer: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    minWidth:"90%",
    margin:20,
    borderRadius: 20,
    paddingBottom:40,
  },
  picker:{
    lineHeight:10,
    minWidth:"100%",
    fontSize: 15,
    padding: 0,
    margin:0,
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
  warn:{
      textAlign:"center",
      padding:30,
      color:colors.secondary,
  },
  icon:{
    color: colors.white,
    marginRight:5,
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

export default AssignmentsScreen;
