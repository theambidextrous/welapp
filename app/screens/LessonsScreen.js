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
import PDFReader from 'rn-pdf-reader-js';
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
import { apiLessons, apiUnits } from "../utils/network";
import Icon from "react-native-vector-icons/Ionicons";
import Micon from "react-native-vector-icons/FontAwesome";
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
function LessonsScreen({ navigation }) {
  const { signOut } = React.useContext(AuthContext);
  const theme = useTheme();
  const [preload, setPreload] = React.useState({ visible: false });
  const [lesson, setLesson ] = React.useState([]);
  const [unit, setUnit ] = React.useState([]);
  const [token, setToken ] = React.useState(null);
  const [render, setRender ] = React.useState(false);
  const [modalVisible, setModalVisible] = React.useState(false);
  const [selectedValue, setSelectedValue] = React.useState("all");
  const [downloadspage, setDownPage] = React.useState({show:false});
  const [viewing, setViewing ] = React.useState({file:"", show: false});
  const [downloading, setDownLoad] = React.useState({downloadProgress: null, isFinished: true, count: 0, data: []});
  const [playing, setPlaying] = React.useState({
    url: null,
    autoplay: false,
    poster:"nowLoading.gif",
    showPoster:true,
    mode: Video.RESIZE_MODE_STRETCH,
  });
  const [videomodal, setVideoModal] = React.useState(false);

  const changeScreenOrientation = async (e) => {
    if (e.fullscreenUpdate === 0) {
      setPlaying({ ...playing, mode: Video.RESIZE_MODE_CONTAIN,});
      await ScreenOrientation.lockAsync(
        ScreenOrientation.OrientationLock.LANDSCAPE_LEFT
      );
    }
    if (e.fullscreenUpdate === 3) {
      setPlaying({ ...playing, mode: Video.RESIZE_MODE_STRETCH, });
      setRender(!render);
      await ScreenOrientation.lockAsync(
        ScreenOrientation.OrientationLock.PORTRAIT_UP
      );
    }
  };
  const handleViewer = (file) => {
    const dirname = "WEL/"
    let file_url = FileSystem.documentDirectory+dirname+file;
    setViewing({show:true, file: file_url});
  }
  const getLessons = async (xtoken, unit) =>{
      let unitid = 'all';
      if(unit){
          unitid = unit;
      }
      await apiLessons(xtoken, unitid)
      .then( (res) => {
        setLesson(res.payload.all);
      })
      .catch((error) => {
          // console.log(error);
        setLesson([]);
        return [];
      });
  }
  const isVideo = (filename) => {
    let ext = filename.substr(filename.lastIndexOf('.') + 1);
    return ['mp4','avi','mkv','mov', 'flv'].includes(ext.toLowerCase());
  }
  const getUnits = async (xtoken) =>{
    await apiUnits(xtoken)
    .then( (res) => {
      setUnit(res.payload.all);
    })
    .catch((error) => {
        setUnit([]);
      return [];
    });
}
const showDownloadsWindow = async () => {
  setDownPage({show:true});
  return;
}
const handleLessonFilter = async () => {
    setPreload({visible:true})
    setModalVisible(!modalVisible);
    await getLessons(token, selectedValue);
    setPreload({visible:false});
    setRender(!render);
}
const loadRemoteVideo = (file) => {
  setVideoModal(!videomodal);
  let streamFrom = configs.base_api + "lessons/stream/" + file;
  setPlaying({...playing, url: streamFrom, autoplay:true});
  return;
}
const loadLocalVideo = (file) => {
  setVideoModal(!videomodal);
  const dirname = "WEL/"
  let streamFrom = FileSystem.documentDirectory+dirname+file;
  setPlaying({...playing, url: streamFrom, autoplay:true});
  return;
}
const closeCurrentVideo = () =>{
  setPlaying({
    url: null,
    autoplay: false,
    poster:"nowLoading.gif",
    showPoster:true,
    mode: Video.RESIZE_MODE_STRETCH,});
  setVideoModal(!videomodal);
}
const openLiveLink = (link) => {
    Linking.openURL(link).catch((err) => console.error(err));
}
const allowPermissions = async () => {
    const status = await Permissions.getAsync(Permissions.CAMERA_ROLL, Permissions.CAMERA);
    if (status.status === "granted") {
        return true;
    }
    else
    {
        await Permissions.askAsync(Permissions.CAMERA_ROLL, Permissions.CAMERA);
        Alert.alert(
            "Action Warning",
            "Denying this App permissions will hinder you from downloading lessons",
            [{ text: "Okay", }]
        );
        return;
    }
}
const ucWords = (string) => {
  return string.charAt(0).toUpperCase() + string.slice(1);
}
const callback = downloadProgress => {
  const progress = downloadProgress.totalBytesWritten / downloadProgress.totalBytesExpectedToWrite;
  setDownLoad({...downloading, downloadProgress: progress});
};
const myDownloads =  () => {
  const dirname = "WEL"
  let temp_file_url = FileSystem.documentDirectory+dirname;
  FileSystem.readDirectoryAsync(temp_file_url)
  .then((contents) => {
    setDownLoad({...downloading, count:contents.length, data:contents});
    // console.log(contents);
  })
  .catch((readError) => {
    console.log(readError);
  });
}
const handleDownload = async (file, xtoken, flname) => {
  console.log(file);
  // console.log(xtoken);
  flname = flname.replace(/[^A-Z0-9]+/ig, "_");
  setPreload({ visible: true });
  /** check if CAMERA_ROLL perm is allowed */
  const status = await Permissions.getAsync(Permissions.CAMERA_ROLL);
  if (status.status === "granted") {
    const dirname = "WEL"
    const extension = file.split(".")[1];
    let temp_file_url = FileSystem.documentDirectory+dirname+'/'+flname.toLowerCase() +"." +extension;

    FileSystem.getInfoAsync(temp_file_url)
    .then( (exits_info) => {
      // console.log(exits_info);
      if (!exits_info.exists) {
        FileSystem.makeDirectoryAsync(temp_file_url, {
          intermediates: true,
        })
        .then((res) => {})
        .catch((error) => {
          setPreload({ visible: false });
          Alert.alert(
            "Directory Error!",
            "Could not create file. Try again later",
            [{ text: "Okay" }]
          );
          return;
        });
      }
    }).catch((err) => {
      console.log('dir exist error ' + err );
      setPreload({ visible: false });
      return;
    });
    setPreload({visible:false});
    Alert.alert(
      "Download Started!",
      "We will notify you once it is complete",
      [{ text: "Okay" }]
    );
    FileSystem.makeDirectoryAsync(temp_file_url, {intermediates: true,}).then(() =>{}).catch((dirError) => { console.log(dirError)});
    let downloadFrom = configs.base_api + "lessons/stream/" + file;
    console.log(downloadFrom);
    FileSystem.downloadAsync(downloadFrom,temp_file_url, {
        headers: { Accept: "application/octet-stream", Authorization: "Bearer " + xtoken},
    })
    .then( async (downloadData) => {
      if( downloadData.status === 200 )
      {
        // console.log('downloaded to ' + temp_file_url);
        await myDownloads();
        Alert.alert(
          "Download Complete!",
          "Downloaded file " + flname + ' has been saved to downloads',
          [{ text: "Okay" }]
        );
        return;
      }
      else
      {
        setPreload({visible:false});
        Alert.alert(
          "Download Error!",
          "File could not be downloaded",
          [{ text: "Okay" }]
        );
        return;
      }
    })
    .catch((error) => {
      console.log('final error == '  + error );
      setPreload({ visible: false });
      Alert.alert(
        "Download Error!",
        "Could not download file. Try again later",
        [{ text: "Okay" }]
      );
    });
  } else {
    const ask_status = await Permissions.askAsync(Permissions.CAMERA_ROLL);
    if (ask_status.status !== "granted") {
      setPreload({ visible: false });
      Alert.alert("Permission Error!", "You will not be able to download lessons", [
        { text: "Okay" },
      ]);
    }
  }
  setPreload({ visible: false });
};

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
                await getLessons(token, selectedValue);
                await getUnits(token);
                await allowPermissions();
                await myDownloads();
                setPreload({visible:false});
            })
            .catch( (err) => {
              setPreload({visible:false});
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
        .then( async (netstat) => {
          if(!netstat.isInternetReachable)
          {
            Alert.alert('Connection', 'Connection error, check your data',[{text:'Okay'}]);
            return;
          }
          await AsyncStorage.getItem("userToken")
            .then( async (token) => {
                // await getLessons(token, selectedValue);
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
  const DownloadItem = ({ item }) => (
    <TouchableHighlight style={[globalStyle.listDownloadItem]} underlayColor="#f1f1f1">
      <Animatable.View animation="bounceIn" duration={1000}>
        <View style={[globalStyle.row, { marginBottom: 0 }]}>
          <View style={[globalStyle.text, {flex:8}]}>
            <Text style={styles.lessonDescription}>
              {ucWords(item)}
            </Text>
          </View>
          <View style={[globalStyle.text, {flex:2}]}>
            { isVideo(item) && (
              <TouchableOpacity onPress={() => loadLocalVideo(item) }>
                <Micon style={styles.lessonIcon} name="play-circle" size={30}/>
              </TouchableOpacity>
            )}
            { !isVideo(item) && (
              <TouchableOpacity onPress={() => handleViewer(item) }>
                <Micon style={styles.lessonIcon} name="file-pdf-o" size={30}/>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Animatable.View>
    </TouchableHighlight>
  );
  const Item = ({ id, title, description, content, link, time }) => (
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
          { content !== 'not_applicable' && (
            <View style={{flex:1, flexDirection:"row"}}>
                { isVideo(content) === true && (
                    <View style={[globalStyle.text, {flex:1}]}>
                    <TouchableOpacity style={styles.lessonMeta} onPress={() => loadRemoteVideo(content) }>
                        <Icon style={styles.lessonIcon} name="ios-play-circle" size={35} />
                        <Text>Watch Video</Text>
                    </TouchableOpacity>
                    </View>
                )}
                <View style={[globalStyle.text, {flex:1}]}>
                <TouchableOpacity style={styles.lessonMeta} onPress={() => handleDownload(content, token, title) }>
                    <Icon style={styles.lessonIcon} name="ios-cloud-download" size={35} />
                    <Text>Download</Text>
                </TouchableOpacity>
                </View>
            </View>
          )}
          { content === 'not_applicable' && (
              <View style={{flex:1, flexDirection:"row"}}>
                    <View style={[globalStyle.text, {flex:1}]}>
                        <TouchableOpacity style={styles.lessonMeta} onPress={() => openLiveLink(link) }>
                            <Icon style={styles.lessonIcon} name="ios-clock" size={35} />
                            <Moment element={Text} format="MMM Do, HH:mm a">{time}</Moment>
                        </TouchableOpacity>
                    </View>
                    <View style={[globalStyle.text, {flex:1}]}>
                        <TouchableOpacity style={styles.lessonMeta} onPress={() => openLiveLink(link) }>
                            <Icon style={styles.lessonIcon} name="ios-videocam" size={35} />
                            <Text>Join Live Class</Text>
                        </TouchableOpacity>
                    </View>
              </View>
          )}
        </View>
      </Animatable.View>
    </TouchableHighlight>
  );
  const renderDownloadItem = ({item}) => <DownloadItem item={item}/>;
  const renderItem = ({item}) => <Item id={item.id} title={item.name} description={item.description} content={item.content} link={item.live_link} time={item.live_time} />;
  return (
    <View style={[globalStyle.container, {backgroundColor:colors.white}]}>
      <StatusBar barStyle={theme.dark ? "light-content" : "default"} />
      <SafeAreaView style={{ flex: 1 }}>
      <ScrollView>
            <View style={pstyles.cardContainer}>
            { downloadspage.show === true && (
              <View style={[styles.gridColumn,{flexDirection:"row"}]}>
                <View style={[styles.gridCell, {flex:2, backgroundColor:colors.container_grey}]}>
                  <TouchableOpacity onPress={()=>{setDownPage({...downloadspage, show:false}); setViewing({show:false, file:""}); }} style={styles.signIn}>
                      <LinearGradient colors={[colors.secondary_dark, colors.secondary]} style={[styles.signIn,{flexDirection:"row"}]}>
                      <Icon style={styles.icon} name="ios-arrow-back" size={20} />
                      <Text style={[styles.gridCellText, {color:colors.white}]}>Back</Text>
                      </LinearGradient>
                  </TouchableOpacity>
                </View>
                <View style={[styles.gridCell, {flex:4, backgroundColor:colors.container_grey}]}>
                  <Text style={styles.gridCellTitle}>Downloads</Text>
                </View>
                { viewing.show && (
                  <View style={[styles.gridCell, {flex:4, backgroundColor:colors.container_grey}]}>
                  <TouchableOpacity onPress={()=>setViewing({show:false, file:""})} style={styles.signIn}>
                      <LinearGradient colors={[colors.secondary_dark, colors.secondary]} style={[styles.signIn,{flexDirection:"row"}]}>
                      <Icon style={styles.icon} name="ios-close" size={20} />
                      <Text style={[styles.gridCellText, {color:colors.white}]}>Close Viewer</Text>
                      </LinearGradient>
                  </TouchableOpacity>
                </View>
                )}
              </View>
            )}
            { downloadspage.show === false && (
              <View style={[styles.gridColumn,{flexDirection:"row"}]}>
                <View style={[styles.gridCell, {flex:6, backgroundColor:colors.container_grey}]}>
                  <Text style={styles.gridCellTitle}>All Lessons</Text>
                </View>
                <View style={[styles.gridCell, {flex:4, backgroundColor:colors.container_grey}]}>
                  <TouchableOpacity onPress={ () => setModalVisible(!modalVisible) } style={styles.signIn}>
                      <LinearGradient colors={[colors.primary_dark, colors.primary]} style={[styles.signIn,{flexDirection:"row"}]}>
                      <Icon style={styles.icon} name="ios-arrow-dropdown-circle" size={20} />
                      <Text style={[styles.gridCellText, {color:colors.white}]}>Filter</Text>
                      </LinearGradient>
                  </TouchableOpacity>
                </View>
                <View style={[styles.gridCell, {flex:2, backgroundColor:colors.container_grey}]}>
                  <TouchableOpacity onPress={ () => showDownloadsWindow() } style={styles.signIn}>
                      <LinearGradient colors={[colors.secondary_dark, colors.secondary]} style={[styles.signIn,{flexDirection:"row"}]}>
                      <Icon style={styles.icon} name="ios-download" size={20} />
                      <Text style={[styles.gridCellText, {color:colors.white}]}>{downloading.count}</Text>
                      </LinearGradient>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        </ScrollView>
        <ScrollView>
          <View style={pstyles.cardContainer}>
            {downloadspage.show === true && (
              <View style={{paddingTop:10}}>
                { viewing.show && (
                  <View>
                    <PDFReader
                      style={styles.readerWindow}
                      onError={() => {console.log('webview error');}}
                      useGoogleReader={false}
                      source={{
                        headers:{
                          "Authorization": "Bearer " + token,
                        },
                        uri: viewing.file,
                      }}
                    />
                </View>
                )}
                <FlatList
                  data={downloading.data}
                  renderItem={renderDownloadItem}
                  keyExtractor={(item) => item.toString()}
                />
              </View>
            )}
            {downloadspage.show === false && (
              <View style={{paddingTop:10}}>
                <FlatList
                  data={lesson}
                  renderItem={renderItem}
                  keyExtractor={(item) => item.id.toString()}
                />
              </View>
            )}
            {lesson.length === 0  && (
                <View style={{paddingTop:10}}>
                    <Text style={styles.warn}>No lessons found. Check back later</Text>
                </View>
            )}
            {/* end meta */}
          </View>
        <View style={{padding:0,}}>
              <Overlay isVisible={modalVisible} overlayStyle={styles.overlay}>
                <View>
                  <View style={{flexDirection:"row"}}>
                    <View style={{flex:10}}>
                      <Text style={[styles.gridCellTitle,{textAlign:"center",}]}>Filter By Unit</Text>
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
                    <View style={[styles.button, styles.inputContainer]}>
                        {/* login button */}
                      <TouchableOpacity
                        style={[styles.signIn, {width:200,}]}
                        onPress={() => { handleLessonFilter() }}>
                        <LinearGradient
                            colors={[colors.primary, colors.primary_dark]}
                            style={[styles.signIn,{height:50}]}>
                          <Text style={(styles.textSign, { color: colors.white })}>Filter Lessons</Text>
                        </LinearGradient>
                      </TouchableOpacity>
                    </View>
                    {/* end btn */}
                  </View>
                </View>
              </Overlay>
            {/* video player */}
            <Overlay isVisible={videomodal} overlayStyle={styles.overlay}>
                <View>
                  <View style={{padding:20}}>
                    <View style={{flexDirection:"row"}}>
                      <View style={{flex:10}}><Text>Video player</Text></View>
                      <View style={{flex:2}}>
                        <TouchableOpacity onPress={()=> closeCurrentVideo() }>
                          <Icon style={[styles.icon, {color:colors.secondary}]} name="ios-close-circle" size={30} />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                  <View>
                  <Video source={{
                      uri: playing.url,
                      headers: {
                        Accept: "application/octet-stream",
                        Authorization: "Bearer " + token,
                      },
                    }}
                    posterSource={{
                      uri: configs.media_api + playing.poster,
                    }}
                    usePoster={true}
                    onLoadStart={()=> setPlaying({...playing, showPoster:true})}
                    onLoad={() => setPlaying({...playing, showPoster:false})}
                    posterStyle={{
                      width: Dimensions.get('window').width*0.8,
                      height: 204,
                      resizeMode: "stretch",
                      borderRadius:10,
                    }}
                    rate={1.0}
                    onFullscreenUpdate={(e) => {
                      changeScreenOrientation(e);
                    }}
                    volume={1.0}
                    isMuted={false}
                    resizeMode={playing.mode}
                    shouldPlay={playing.autoplay}
                    isLooping={false}
                    useNativeControls={true}
                    style={{
                      width: Dimensions.get('window').width*0.8,
                      minHeight: 210,
                      borderRadius: 10,
                    }}
                  />
                  </View>
                </View>
            </Overlay>
            {/* end video player */}
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
    flexDirection: 'row',
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
  readerWindow:{
    height:Dimensions.get('window').height * 0.8,
    width: Dimensions.get('window').width,
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

export default LessonsScreen;
