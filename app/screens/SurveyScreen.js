import React from "react";
import {
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
import CountDown from 'react-native-countdown-component';
import { RadioButton,Text } from 'react-native-paper';
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
import { apiUnits, apiSurveys, apiExamQuestions, apiMarkChoiceSurvey,apiCompletePaper } from "../utils/network";
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
function SurveyScreen({ navigation }) {
  const { signOut } = React.useContext(AuthContext);
  const theme = useTheme();
  const [preload, setPreload] = React.useState({ visible: false });
  const [exam, setExam ] = React.useState([]);
  const [unit, setUnit ] = React.useState([]);
  const [token, setToken ] = React.useState(null);
  const [render, setRender ] = React.useState(false);
  const [modalVisible, setModalVisible] = React.useState(false);
  const [selectedValue, setSelectedValue] = React.useState("all");
  const [myselection, setSelection] = React.useState([]);
  const [progress, setProgres] = React.useState({exam:null, isOn: false, questions:[], showInst:false, duration:0, examtitle:""});
  
  const getSuveys = (xtoken, unit) =>{
      let unitid = 'all';
      if(unit){unitid = unit;}
      apiSurveys(xtoken, unitid)
      .then( (res) => {
        // console.log(res);
        setExam(res.payload.all);
        return;
      }).catch((error) => {
        setExam([]);
        return [];
      });
  }
  const getCurrentQuestions = (examid, title, time) =>{
    apiExamQuestions(token, examid)
    .then( (res) => {
      if( res.status === 200 )
      {
        // console.log(res.payload.all.question);
        setSelection(res.payload.all.indices);
        setProgres({...progress, isOn:true, showInst:true, duration:time, questions:res.payload.all.questions, examtitle: title.toLowerCase()});
        return;
      }else
      {
        Alert.alert("Attempt Warning", "You have already submitted this survey",
        [{text:"Okay"}]);
        return;
      }
    }).catch((error) => {
      console.log(error);
      Alert.alert("Attempt Warning", error,
      [{text:"Okay"}]);
      return;
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
const initiateExam = (examid, title, duration) => {
  // console.log(examid);
  setProgres({...progress, showInst:true});
  Alert.alert("START " + title + "?", "We highly recommend that you access this survey on your computer by visiting WEL elearning website. If you are ready to attempt on your phone, Click on Start",
  [{text:"Not now", onPress: async () => {
    await stopExamProgress();
  }},
  {text:"Start", onPress: async () => {
    // console.log(progress);
    await getCurrentQuestions(examid, title, duration);
  }}]);
}
const stopExamProgress = () => {
  setProgres({...progress, exam:null, showInst:false, isOn:false });
  return;

}
const handleExamFilter = async () => {
    setPreload({visible:true})
    setModalVisible(!modalVisible);
    await getSuveys(token, selectedValue);
    setPreload({visible:false});
    setRender(!render);
}
const finishCurrentExam = (id) => {
  setPreload({visible:true});
  // console.log(id);
  apiCompletePaper(token, {exam: id})
  .then((resp) => {
    setPreload({visible:false});
    if(resp.status === 200)
    {
      Alert.alert("Survey Notification", "Survey has been submitted. Thank you for your feedback", [{text:"Okay, Thanks", onPress: () => {
        navigation.navigate('AppHome');
        return;
      }}]);
      return;
    }
  }).catch((e) =>{
    setPreload({visible:false});
    console.log(e);
    return;
  })
}
const updateChoice = (choice, index, this_exam, question) => {
  setProgres({...progress, exam: this_exam});
  // JSON.parse(JSON.stringify(myselection[index])).value
  try{
    for (var i in myselection) {
      if (i == index ) {
        setPreload({visible:true});
        myselection[i].value = choice;
        JSON.parse(JSON.stringify(myselection[i])).value = choice;
        let postD = {choice: choice,index: index,exam: this_exam,question: question};
        // console.log(postD);
        apiMarkChoiceSurvey(token, postD)
        .then( (resp) => {
          // console.log(resp);
          setPreload({visible:false});
        })
        .catch((error) => {
          // console.log(error);
          setPreload({visible:false});
        });
        // setRender(!render);
        setPreload({visible:false});
        break;
      }
    }
  }catch(e){
    console.log(e);
  }
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
                await getSuveys(token, selectedValue);
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
  const Item = ({ id, title, duration, description, mark, done}) => (
    <TouchableHighlight style={[globalStyle.listItem, {marginBottom:15, marginTop:10}]} underlayColor="#f1f1f1">
      <Animatable.View animation="bounceIn" duration={10}>
        <View style={[globalStyle.row, { marginBottom: 4 }]}>
          <View style={[globalStyle.text, {flex:1}]}>
            <Text style={styles.lessonTitle}>
              {title}
            </Text>
            <Text style={styles.lessonDescription}>
              {description}
            </Text>
          </View>
        </View>
        
        <View style={[globalStyle.row, { marginBottom: 4 }]}>
            <View style={{flex:1, flexDirection:"row",}}>
                <View style={[globalStyle.text, {flex:1, alignItems:"flex-start"}]}>
                  <TouchableOpacity style={styles.lessonMeta} onPress={() => initiateExam(id, title, duration) }>
                        <Icon style={[styles.lessonIcon]} name="ios-arrow-dropup" size={35} />
                        <Text>Answer this Survey</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
      </Animatable.View>
    </TouchableHighlight>
  );
  const ExamItem = ({ id, index, title, this_exam, options, mark}) => (
    <TouchableHighlight style={[globalStyle.listItem, {marginBottom:15, marginTop:10}]} underlayColor="#f1f1f1">
      <Animatable.View animation="bounceIn" duration={10}>
        <View style={[globalStyle.row, { marginBottom: 4 }]}>
          <View style={[globalStyle.text, {flex:1}]}>
            <Text style={styles.lessonTitle}>
            {index+1}.){" "}{title}{" "}({mark}mks)
            </Text>
          </View>
        </View>
        <View style={[globalStyle.row, { marginBottom: 4 }]}>
            <View style={{flex:1, flexDirection:"row"}}>
              <View style={[globalStyle.text, {flex:1,}]}>
                  <RadioButton.Group onValueChange={
                    v => updateChoice(v, index, this_exam, id)} value={JSON.parse(JSON.stringify(myselection[index])).value}>
                    { options.map( (opt, i) => 
                      <View style={{flexDirection:"row"}}>
                        <RadioButton.Item color={colors.primary} uncheckedColor={colors.white_dark}  label={opt.Id + ") " + opt.Option} value={opt.Id}/>
                      </View>
                    )}
                  </RadioButton.Group>
              </View>
            </View>
        </View>
      </Animatable.View>
    </TouchableHighlight>
  );
  const renderItem = ({item}) => <Item id={item.id} title={item.title} duration={item.duration} mark={item.maxscore} description={item.description} time={item.created_at} done={item.has_done} />;
  const renderExamItem = ({item}) => <ExamItem id={item.id} index={item.q_index}  title={item.title} this_exam={item.exam} mark={item.maxscore} options={item.options} />;

  return (
    <View style={[globalStyle.container, {backgroundColor:colors.white}]}>
      <StatusBar barStyle={theme.dark ? "light-content" : "default"} />
      <SafeAreaView style={{ flex: 1 }}>
        {/* ==== if exam is not on */}
        { progress.showInst === false && progress.isOn === false && (
          <ScrollView>
            <View style={pstyles.cardContainer}>
              <View style={[styles.gridColumn,{flexDirection:"row"}]}>
                  <View style={[styles.gridCell, {flex:6, backgroundColor:colors.container_grey}]}>
                    <Text style={styles.gridCellTitle}>All Surveys</Text>
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
        )}
        {/* exam is on  */}
        { progress.showInst === true && progress.isOn === true && (
          <ScrollView>
            <View style={pstyles.cardContainer}>
              <View style={[styles.gridColumn,{flexDirection:"row"}]}>
                  <View style={[styles.gridCell, {flex:1, backgroundColor:colors.container_grey}]}>
                    <TouchableOpacity onPress={ () => finishCurrentExam(progress.exam) } style={styles.signIn}>
                        <LinearGradient colors={[colors.primary_dark, colors.primary]} style={[styles.signIn,{flexDirection:"row"}]}>
                          <Text>Submit Answers</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                  </View>
                </View>
            </View>
          </ScrollView>
        )}
        { progress.isOn === true && progress.showInst === true && (
          <ScrollView>
          <View style={pstyles.cardContainer}>
            <View style={{paddingTop:10}}>
                <FlatList
                  data={progress.questions}
                  renderItem={renderExamItem}
                  keyExtractor={(item) => item.id.toString()}
                />
            </View>
          </View>
          </ScrollView>
        )}
        { progress.showInst === false && progress.isOn === false && (
          <ScrollView>
            <View style={pstyles.cardContainer}>
              <View style={{paddingTop:10}}>
                  <FlatList
                    data={exam}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id.toString()}
                  />
              </View>
              {exam.length === 0  && (
                  <View style={{paddingTop:10}}>
                      <Text style={styles.warn}>You have no pending surveys.</Text>
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
                    <View style={[styles.button, styles.inputContainer, styles.mT]}>
                      <TouchableOpacity
                        style={[styles.signIn, {width:200,}]}
                        onPress={() => { handleExamFilter() }}>
                        <LinearGradient
                        colors={[colors.primary, colors.primary_dark]}
                        style={[styles.signIn,{height:50}]}>
                          <Text style={(styles.textSign, { color: colors.white })}>Filter Surveys</Text>
                        </LinearGradient>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </Overlay>
            </View>
          </ScrollView>
        )}
        {/* ===== end default */}

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

export default SurveyScreen;
