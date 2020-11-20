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
  TextInput,
  KeyboardAvoidingView,
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
import { apiUnits, apiForums, apiForumReply, apiReply,apiNewPost } from "../utils/network";
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
function ForumScreen({ navigation }) {
  const { signOut } = React.useContext(AuthContext);
  const theme = useTheme();
  const [preload, setPreload] = React.useState({ visible: false });
  const [forum, setForum ] = React.useState([]);
  const [unit, setUnit ] = React.useState([]);
  const [token, setToken ] = React.useState(null);
  const [render, setRender ] = React.useState(false);
  const [modalVisible, setModalVisible] = React.useState(false);
  const [postmodalVisible, setPostModalVisible] = React.useState(false);
  const [selectedValue, setSelectedValue] = React.useState("all");
  const [happening, setHappening] = React.useState({show: false, showing:"No forum selected", reply: [], showId:""});
  const [replying, setReplying] = React.useState({reply:"", isValid:false});
  const [posting, setPosting] = React.useState({post:"", isValid:false, unit:"", unitValid: false});

  
  const getForum = (xtoken, unit) =>{
      setPreload({visible:true});
      let unitid = 'all';
      if(unit){unitid = unit;}
      apiForums(xtoken, unitid)
      .then( (res) => {
        setForum(res.payload.all);
        return;
      }).catch((error) => {
        setForum([]);
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
const handlePostDetails = (forum_id, title) => {
    setPreload({visible:true});
    apiForumReply(token, forum_id)
    .then((res) => {
      setHappening({...happening, show: true, showing: title, reply: res.payload.all, showId: forum_id});
      setPreload({visible:false});
      return;
    })
    .catch((error) => {
      setPreload({visible:false});
      console.log(error);
      return;
    });
}
const handlePostSubmit = () => {
  if(!posting.isValid)
  {
    Alert.alert("Forum warning", "You CANNOT submit an empty post", 
    [{text:"Okay"}]);
    return;
  }
  if(!posting.unitValid)
  {
    Alert.alert("Forum warning", "You MUST select a unit", 
    [{text:"Okay"}]);
    return;
  }
  setPreload({visible:true});
  apiNewPost(token, {forum: posting.post, unit: posting.unit})
  .then( async (res) => {
    console.log(res);
    if( res.status === 200 )
    {
      await getForum(token, "");
      setPosting({post:"", unit:"all", unitValid:false, isValid:false});
      setPreload({visible:false});
      Alert.alert("Success", res.message, 
      [{text:"Okay", onPress:() => setPostModalVisible(!postmodalVisible)}]);
      return;
    }else
    {
      Alert.alert("Forum error", res.message, 
      [{text:"Try again"}]);
      setPreload({visible:false});
      return;
    }
  })
  .catch((error) => {
    setPreload({visible:false});
    console.log(error);
    return;
  });
}
const handleSubmitReply = () => {
  if(!replying.isValid)
  {
    Alert.alert("Forum warning", "You CANNOT submit an empty reply", 
    [{text:"Okay"}]);
    return;
  }
  setPreload({visible:true});
  apiReply(token, {reply: replying.reply, forum: happening.showId})
  .then( async (res) => {
    if( res.status === 200 )
    {
      await handlePostDetails(happening.showId, happening.showing);
      setReplying({reply:"", isValid:false});
      setPreload({visible:false});
      Alert.alert("Success", res.message, 
      [{text:"Okay"}]);
      return;
    }else
    {
      Alert.alert("Forum error", res.message, 
      [{text:"Try again"}]);
      setPreload({visible:false});
      return;
    }
  })
  .catch((error) => {
    setPreload({visible:false});
    console.log(error);
    return;
  });
}
const handleFilter = async () => {
    setPreload({visible:true})
    setModalVisible(!modalVisible);
    await getForum(token, selectedValue);
    setPreload({visible:false});
    setRender(!render);
}
const handlePostUnit = (v) => {
  if( v !== "all" )
  {
    setPosting({...posting, unit: v, unitValid:true});
    return;
  }
  else{
    setPosting({...posting, unit: v, unitValid:false});
    return;
  }
}
const handlePostText = (v) => {
  if( v.length > 10 )
  {
    setPosting({...posting, post: v, isValid:true});
    return;
  }
  else{
    setPosting({...posting, post: v, isValid:false});
    return;
  }
}
const handleReplyText = (v) => {
  if( v.length > 0 )
  {
    setReplying({reply: v, isValid: true});
    return;
  }
  else{
    setReplying({reply: v, isValid: false});
    return;
  }
}
  useFocusEffect(
    React.useCallback(() => {
      // Do something when the screen is focused
      function isConnectedDevice() {
        setPreload({visible:true});
        Network.getNetworkStateAsync()
          .then( (netstat) => {
            if(!netstat.isInternetReachable)
            {
              setPreload({visible:false});
              Alert.alert('Connection', 'Connection error, check your data',[{text:'Okay'}]);
              return;
            }
            AsyncStorage.getItem("userToken")
            .then( async (token) => {
                setToken(token);
                await getForum(token, selectedValue);
                await getUnits(token);
                setPreload({visible:false});
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

  const ReplyItem = ({ id, reply, user, time}) => (
    <View style={styles.forumrow}>
      <Icon style={styles.forumavatar} name="ios-chatbubbles" size={30} />
      <View style={styles.forumrowText}>
        <Text style={[styles.forummessage, {color:colors.black}]}>{reply}</Text>
        <View style={{flexDirection:"row", marginTop:5}}>
          <View style={{flexDirection:"row"}}>
            <Icon style={styles.lessonIcon} name="ios-clock" size={15} />
            <Moment style={styles.lessonIcon} element={Text} format="MMM Do, HH MM A">{time}</Moment>
          </View>
          <View style={{flexDirection:"row"}}>
            <Icon style={styles.lessonIcon} name="ios-person" size={15} />
            <Text style={[styles.lessonIcon,{fontSize:12, fontWeight:"300"}]}>{user}</Text>
          </View>
        </View>
      </View>
    </View>
  );
  const renderReplyItem = ({item}) => <ReplyItem id={item.id} reply={item.reply} user={item.user} time={item.created_at} />;

  const Item = ({ id, title, reply, user, time}) => (
    <TouchableHighlight style={[globalStyle.listItem, {marginBottom:15, marginTop:10}]} underlayColor="#f1f1f1">
      <Animatable.View animation="bounceIn" duration={10}>
        <View style={[globalStyle.row, { marginBottom: 4 }]}>
          <View style={[globalStyle.text, {flex:1}]}>
            <TouchableOpacity onPress={() => handlePostDetails(id, title) }>
              <Text style={[styles.lessonTitle, {color:colors.primary_darker, textDecorationLine:"underline", fontWeight:"400"}]}>
                {title}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={[globalStyle.row, { marginBottom: 4 }]}>
            <View style={{flex:1, flexDirection:"row"}}>
                <View style={[globalStyle.text, {flex:1}]}>
                    <TouchableOpacity style={styles.lessonMeta} onPress={() => console.log(undefined) }>
                        <Icon style={styles.chaticon} name="ios-calendar" size={15} />
                        <Moment style={styles.lessonIcon} element={Text} format="MMM Do">{time}</Moment>
                    </TouchableOpacity>
                </View>
                <View style={[globalStyle.text, {flex:1}]}>
                    <TouchableOpacity style={styles.lessonMeta} onPress={() => console.log(undefined) }>
                        <Icon style={styles.chaticon} name="ios-person" size={15} />
                        <Text style={styles.lessonIcon}>{user}</Text>
                    </TouchableOpacity>
                </View>
                <View style={[globalStyle.text, {flex:1}]}>
                    <TouchableOpacity style={styles.lessonMeta} onPress={() => console.log(undefined) }>
                        <Icon style={styles.chaticon} name="ios-chatbubbles" size={15} />
                        <Text style={styles.lessonIcon}>{reply} replies</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
      </Animatable.View>
    </TouchableHighlight>
  );
  const renderItem = ({item}) => <Item id={item.id} title={item.forum} reply={item.reply} user={item.user} time={item.created_at} />;

  return (
    <View style={[globalStyle.container, {backgroundColor:colors.white}]}>
      <StatusBar barStyle={theme.dark ? "light-content" : "default"} />
      <SafeAreaView style={{ flex: 1 }}>
      <ScrollView>
        <View style={pstyles.cardContainer}>
            { happening.show === true && (
              <View style={[styles.gridColumn,{flexDirection:"row"}]}>
                <View style={[styles.gridCell, {flex:5, backgroundColor:colors.container_grey}]}>
                  <Text style={styles.gridCellTitle}>{"# "}{happening.showing}</Text>
                </View>
                <View style={[styles.gridCell, {flex:1, backgroundColor:colors.container_grey}]}>
                  <TouchableOpacity onPress={ () => setHappening({show:false, reply: []}) } style={styles.signIn}>
                      <LinearGradient colors={[colors.primary_dark, colors.primary]} style={[styles.signIn,{flexDirection:"row"}]}>
                      <Icon style={styles.icon} name="ios-arrow-back" size={20} />
                      <Text style={[styles.gridCellText, {color:colors.white}]}>Back</Text>
                      </LinearGradient>
                  </TouchableOpacity>
                </View>
              </View>
            )}
            { happening.show === false && (
              <View style={[styles.gridColumn,{flexDirection:"row"}]}>
              <View style={[styles.gridCell, {flex:4, backgroundColor:colors.container_grey}]}>
                <Text style={styles.gridCellTitle}>Forums</Text>
              </View>
              <View style={[styles.gridCell, {flex:6, backgroundColor:colors.container_grey}]}>
                <TouchableOpacity onPress={ () => setPostModalVisible(!postmodalVisible) } style={styles.signIn}>
                    <LinearGradient colors={[colors.primary_dark, colors.primary]} style={[styles.signIn,{flexDirection:"row"}]}>
                    <Icon style={styles.icon} name="ios-add-circle" size={20} />
                    <Text style={[styles.gridCellText, {color:colors.white}]}>New Post</Text>
                    </LinearGradient>
                </TouchableOpacity>
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
            )}
        </View>
        </ScrollView>
        <ScrollView>
          <View style={pstyles.cardContainer}>
            <View style={{paddingTop:10}}>
                {happening.show === true && (
                  <View>
                    <FlatList
                      data={happening.reply}
                      renderItem={renderReplyItem}
                      keyExtractor={(item) => item.id.toString()}
                    />
                    <KeyboardAvoidingView behavior="padding">
                      <View style={[styles.forumfooter, {margin:10, borderRadius:20}]}>
                        <TextInput
                          value={replying.reply}
                          style={styles.foruminput}
                          underlineColorAndroid="transparent"
                          placeholder="Type a reply to this post"
                          onChangeText={text => handleReplyText(text)}
                        />
                        <TouchableOpacity onPress={() => handleSubmitReply()}>
                          <Text style={styles.forumsend}>Reply</Text>
                        </TouchableOpacity>
                      </View>
                    </KeyboardAvoidingView>
                  </View>
                )}
                {happening.show === false && (
                  <FlatList
                    data={forum}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id.toString()}
                  />
                )}
            </View>
            {forum.length === 0  && (
                <View style={{paddingTop:10}}>
                    <Text style={styles.warn}>No forums, create one</Text>
                </View>
            )}
            {/* end meta */}
          </View>
        <View style={{padding:0,}}>
            <Overlay isVisible={modalVisible} overlayStyle={styles.overlay}>
              <View>
                <View style={{flexDirection:"row"}}>
                  <View style={{flex:10}}>
                    <Text style={[styles.gridCellTitle,{textAlign:"center"}]}>Filter Forums</Text>
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
                        <Text style={(styles.textSign, { color: colors.white })}>Filter</Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </Overlay>
            {/* === NEW POST ===== */}
            <Overlay isVisible={postmodalVisible} overlayStyle={styles.overlay}>
                <View style={{minWidth:"95%"}}>
                  <View style={{flexDirection:"row"}}>
                    <View style={{flex:10}}>
                      <Text style={[styles.gridCellTitle,{textAlign:"center"}]}>Create New Post</Text>
                    </View>
                    <View style={{flex:2}}>
                      <TouchableOpacity onPress={()=> setPostModalVisible(!postmodalVisible)}>
                        <Icon style={[styles.icon, {color:colors.secondary}]} name="ios-close-circle" size={30} />
                      </TouchableOpacity>
                    </View>
                  </View>
                  <View style={{padding:5, flexDirection:"row"}}>
                    <View style={{flex:1, marginBottom:0}}>
                      <Picker
                      itemStyle={styles.picker}
                      selectedValue={posting.unit}
                      onValueChange={(itemValue, itemIndex) => handlePostUnit(itemValue)}>
                        <Picker.Item label='SELECT A UNIT FOR YOUR POST' value='all'/>
                        {unit.map((item, index) => {
                            return (
                            <Picker.Item
                                label={item.name}
                                value={item.id}
                                key={index}
                            />
                            );
                        })}
                      </Picker>
                    </View>
                  </View>
                  <View style={{padding:5, flexDirection:"row"}}>
                    <View style={{flex:1, marginBottom:20}}>
                      <TextInput
                        style={styles.postInput}
                        value={posting.post}
                        underlineColorAndroid="transparent"
                        placeholder="Type your post here"
                        onChangeText={text => handlePostText(text)}
                      />
                    </View>
                  </View>
                  <View>
                    <View style={[styles.button, styles.inputContainer, styles.mT]}>
                      <TouchableOpacity
                        style={[styles.signIn, {width:200,}]}
                        onPress={() => { handlePostSubmit() }}>
                        <LinearGradient
                          colors={[colors.primary, colors.primary_dark]}
                          style={[styles.signIn,{height:50}]}>
                          <Text style={(styles.textSign, { color: colors.white })}>Create Post</Text>
                        </LinearGradient>
                      </TouchableOpacity>
                    </View>
                  </View>
                  <View>
                    {/* activity indicator */}
                    { preload.visible === true && (
                        <View style={styles.loading}>
                          <ActivityIndicator color={colors.black} animating={preload.visible} size="large" />
                        </View>
                    )}
                      {/* end indicator */}
                  </View>
                </View>
            </Overlay>
            {/* ========= END =========== */}
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
    color: colors.grey,
    marginRight:5,
    fontSize:12,
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
  postInput: {
    width: "100%",
    height: 60,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 13,
    backgroundColor:colors.white_dark,
    padding: 20,
  },
  tOpacity:{
    alignItems:"flex-start",
  },
  warn:{
      textAlign:"center",
      padding:30,
      color:colors.secondary,
  },
  chaticon:{
    color: colors.grey,
    marginRight:5,
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
  forumrow: {
    flexDirection: 'row',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee'
  },
  forumavatar: {
    borderRadius: 20,
    marginRight: 10,
    color:colors.grey,
  },
  forumrowText: {
    flex: 1
  },
  forummessage: {
    fontSize: 18
  },
  forumsender: {
    fontWeight: 'bold',
    paddingRight: 10
  },
  forumfooter: {
    flexDirection: 'row',
    backgroundColor: '#eee'
  },
  foruminput: {
    paddingHorizontal: 20,
    fontSize: 18,
    color:colors.black_light,
    flex: 1
  },
  forumsend: {
    alignSelf: 'center',
    color: 'lightseagreen',
    fontSize: 16,
    fontWeight: 'bold',
    padding: 20,
  },

});

export default ForumScreen;
