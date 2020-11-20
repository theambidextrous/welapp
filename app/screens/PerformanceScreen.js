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
import { apiUnits, apiPerformance } from "../utils/network";
import Icon from "react-native-vector-icons/Ionicons";
/** media */
import * as FileSystem from "expo-file-system";
import * as MediaLibrary from "expo-media-library";
import * as Permissions from "expo-permissions";
import { Video } from "expo-av";
import * as ScreenOrientation from "expo-screen-orientation";
/**  styles */
import profileStyles from '../utils/profile_styles';
import configs from "../config/configs";
const pstyles = StyleSheet.create({ ...profileStyles });
function PerformanceScreen({ navigation }) {
  const { signOut } = React.useContext(AuthContext);
  const theme = useTheme();
  const [preload, setPreload] = React.useState({ visible: false });
  const [performance, setPerformance ] = React.useState({assign:[], exm: [], heading:"No unit selected",});
  const [unit, setUnit ] = React.useState([]);
  const [token, setToken ] = React.useState(null);
  const [render, setRender ] = React.useState(false);
  const [modalVisible, setModalVisible] = React.useState(false);
  const [selectedValue, setSelectedValue] = React.useState("all");
  
  const getPerformance = (xtoken, unitid) =>{
      if( unit !== 'all' ){
        apiPerformance(xtoken, unitid)
        .then( (res) => {
          console.log(res);
          setPerformance({assign: res.payload.a, exm: res.payload.b, heading:res.payload.c});
          return;
        }).catch((error) => {
          setPerformance({...performance});
          return;
        });
      }else
      {
        setPerformance({...performance});
        return;
      }
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
const showDownloadsWindow = async () => {
    return;
}
const handleFilter = async () => {
    setPreload({visible:true})
    setModalVisible(!modalVisible);
    await getPerformance(token, selectedValue);
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
                await getPerformance(token, selectedValue);
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
                // await getPerformance(token, selectedValue);
                setToken(token);
                // await getUnits(token);
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

  const Item = ({ id, title, score, maxscore, marked}) => (
    <TouchableHighlight style={{marginBottom:15, marginTop:10}} underlayColor="#f1f1f1">
      <Animatable.View animation="bounceIn" duration={10}>
        <View>
          <View style={[globalStyle.text, {flex:1}]}>
            <Text style={[styles.lessonTitle,{color:colors.black}]}>
              {title}
            </Text>
            {marked === 1 && (
              <View>
                <Text style={styles.scoreStatus}>
                Status: Marked
                </Text>
                <Text style={styles.score}>
                Score: {score}/{maxscore} {" "} {(score*100/maxscore).toFixed(1)}%
                </Text>
              </View>
            )}
            {marked === 0 && (
              <View>
                <Text style={styles.scoreStatusD}>
                Status: Not Marked
                </Text>
                <Text style={styles.scoreD}>
                Score: Awaiting update
                </Text>
              </View>
            )}
          </View>
        </View>
      </Animatable.View>
    </TouchableHighlight>
  );
  const renderItem = ({item}) => <Item id={item.id} title={item.title} content={item.content} score={item.score} maxscore={item.maxscore} time={item.created_at} marked={item.is_marked} />;

  return (
    <View style={[globalStyle.container, {backgroundColor:colors.white}]}>
      <StatusBar barStyle={theme.dark ? "light-content" : "default"} />
      <SafeAreaView style={{ flex: 1 }}>
      <ScrollView>
        <View style={pstyles.cardContainer}>
          <View style={[styles.gridColumn,{flexDirection:"row"}]}>
              <View style={[styles.gridCell, {flex:5, backgroundColor:colors.container_grey}]}>
                <Text style={styles.gridCellTitle}>Performance</Text>
              </View>
              <View style={[styles.gridCell, {flex:4, backgroundColor:colors.container_grey}]}>
                <TouchableOpacity onPress={ () => setModalVisible(!modalVisible) } style={styles.signIn}>
                    <LinearGradient colors={[colors.primary_dark, colors.primary]} style={[styles.signIn,{flexDirection:"row"}]}>
                    <Icon style={styles.icon} name="ios-arrow-dropdown-circle" size={20} />
                    <Text style={[styles.gridCellText, {color:colors.white}]}>Select Unit</Text>
                    </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
        </View>
        </ScrollView>
        <ScrollView>
          <View style={pstyles.cardContainer}>
            <View style={{padding:10}}>
                <View style={{borderBottomWidth:3, borderBottomColor:colors.white_dark, paddingBottom:20}}>
                  <Text style={styles.sectionUnitCourse}>{performance.heading}</Text>
                </View>
            </View>
            <View style={{padding:10}}>
                <View style={{borderBottomWidth:1, borderBottomColor:colors.white_dark, paddingBottom:20}}>
                  <Text style={styles.sectionTitle}>Exams & Quizes</Text>
                </View>
                <View style={{borderBottomWidth:1, borderBottomColor:colors.white_dark, paddingBottom:20}}>
                  <FlatList
                    data={performance.exm}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id.toString()}
                  />
                </View>
            </View>
            <View style={{padding:10}}>
                <View style={{borderBottomWidth:1, borderBottomColor:colors.white_dark, paddingBottom:20}}>
                  <Text style={styles.sectionTitle}>Assignments & Take aways</Text>
                </View>
                <View style={{borderBottomWidth:1, borderBottomColor:colors.white_dark, paddingBottom:20}}>
                  <FlatList
                    data={performance.assign}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id.toString()}
                  />
                </View>
            </View>
            {performance.assign.length === 0  && performance.exm.length === 0 && (
                <View style={{paddingTop:10}}>
                    <Text style={styles.warn}>Select unit to see performance</Text>
                </View>
            )}
            {/* end meta */}
          </View>
        <View style={{padding:0,}}>
          <Overlay isVisible={modalVisible} overlayStyle={styles.overlay}>
            <View>
              <View style={{flexDirection:"row"}}>
                <View style={{flex:10}}>
                  <Text style={[styles.gridCellTitle,{textAlign:"center", fontSize:16}]}>Performance by Unit</Text>
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
                <View style={[styles.button, styles.inputContainer, styles.mT]}>
                  <TouchableOpacity
                    style={[styles.signIn, {width:200,}]}
                    onPress={() => { handleFilter() }}>
                    <LinearGradient
                        colors={[colors.primary, colors.primary_dark]}
                        style={[styles.signIn,{height:50}]}>
                        <Text style={(styles.textSign, { color: colors.white })}>
                        Search Performance
                        </Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Overlay>
        </View>
        </ScrollView>
        {/* activity indicator */}
        { preload.visible === true && (
            <View style={styles.loading}>
              <ActivityIndicator animating={preload.visible} size="large" />
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
  sectionUnitCourse:{
    fontSize:25,
    fontWeight:"200",
    color:colors.black,
  },
  sectionTitle:{
    fontSize:25,
    fontWeight:"200",
    color:colors.primary_darker,
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
  score:{
    color: colors.green,
    textTransform: "none",
    fontSize:14,
    marginTop:15,
  },
  scoreStatus:{
    color: colors.green,
    textTransform: "uppercase",
    fontSize:14,
    fontWeight:"bold",
    marginTop:15,
  },
  scoreD:{
    color: colors.secondary_dark,
    textTransform: "none",
    fontSize:14,
    marginTop:15,
  },
  scoreStatusD:{
    color: colors.secondary_dark,
    textTransform: "uppercase",
    fontSize:14,
    fontWeight:"bold",
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

export default PerformanceScreen;
