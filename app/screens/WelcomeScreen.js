import React from "react";
import {
  Text,
  View,
  ScrollView,
  Image,
  FlatList,
  TouchableHighlight,
  TouchableOpacity,
  StatusBar,
  Alert,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import * as Animatable from "react-native-animatable";
import * as Network from 'expo-network';
import { useTheme } from "@react-navigation/native";
import { AuthContext } from "../components/context";
import AsyncStorage from "@react-native-community/async-storage";
import globalStyle from "../utils/styles";
import colors from "../config/colors";
import configs from "../config/configs";
/**  icons */
const enroll_icn = configs.media_api + "enrollment.png";
const course_icn = configs.media_api + "mycourses.png";
const lesson_icn = configs.media_api + "lessons.png";
const exam_icn = configs.media_api + "myexam.png";
const assign_icn = configs.media_api + "assign.png";
const perf_icn = configs.media_api + "perf.png";
const forum_icn = configs.media_api + "myforum.png";;
const surv_icn = configs.media_api + "survey.png";

function WelcomeScreen({ navigation }) {
  const { signOut } = React.useContext(AuthContext);
  const theme = useTheme();
  const [preload, setPreload] = React.useState({ visible: false });

  /** check if user is still active */
  useFocusEffect(
    React.useCallback(() => {
      // Do something when the screen is focused
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
    }, [])
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
        setPreload({visible:false});
    }
    isConnectedDevice();
    return () => {
      // Do something when the screen is un-focused
      setPreload({ visible: false });
    };
  }, []);
  const handleAction = (action) => {
    setPreload({visible:true});
    switch (action) {
      case 'myaccount':
        navigation.push('Account');
        return;
      case 'mycourse':
        navigation.navigate('Courses');
        return;
      case 'lessons':
        navigation.navigate('Lessons');
        return;
      case 'exams':
        navigation.navigate('Exams');
        return;
      case 'assignments':
        navigation.navigate('Assignments');
        return;
      case 'Performance':
        navigation.navigate('Performance');
        return;
      case 'Forum':
        navigation.navigate('Forum');
        return;
      case 'Survey':
        navigation.navigate('Survey');
        return;
      default:
        Alert.alert(
          "No route warning",
          "clicked on nothing",
          [{ text: "Gott it, thanks" }]
        );
        return;
    }
  }
  return (
    <View style={globalStyle.container}>
      <StatusBar backgroundColor={colors.primary} barStyle="light-content" />
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView>
          <View style={styles.gridColumn}>
            <View style={styles.gridCell}>
              <TouchableOpacity onPress={ () => {
                handleAction('myaccount');
              }} style={styles.tOpacity}>
                <Image source={{uri:enroll_icn}} style={styles.gridCellIcon} />
                <Text style={styles.gridCellText}>My Account</Text>
              </TouchableOpacity>
            </View>
            <View style={[styles.gridCell, {marginRight:5}]}>
              <TouchableOpacity onPress={ () => {
                handleAction('mycourse');
              }} style={styles.tOpacity}>
                <Image source={{uri:course_icn}} style={styles.gridCellIcon} />
                <Text style={styles.gridCellText}>My Courses</Text>
              </TouchableOpacity>
            </View>
          </View>
          
          <View style={styles.gridColumn}>
            <View style={styles.gridCell}>
              <TouchableOpacity onPress={ () => {
                handleAction('lessons');
              }} style={styles.tOpacity}>
                <Image source={{uri:lesson_icn}} style={styles.gridCellIcon} />
                <Text style={styles.gridCellText}>Lessons</Text>
              </TouchableOpacity>
            </View>
            <View style={[styles.gridCell, {marginRight:5}]}>
              <TouchableOpacity onPress={ () => {
                handleAction('exams');
              }} style={styles.tOpacity}>
                <Image source={{uri:exam_icn}} style={styles.gridCellIcon} />
                <Text style={styles.gridCellText}>Exams & Quizes</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.gridColumn}>
            <View style={styles.gridCell}>
              <TouchableOpacity onPress={ () => {
                handleAction('assignments');
              }} style={styles.tOpacity}>
                <Image source={{uri:assign_icn}} style={styles.gridCellIcon} />
                <Text style={styles.gridCellText}>Assignments</Text>
              </TouchableOpacity>
            </View>
            <View style={[styles.gridCell, {marginRight:5}]}>
              <TouchableOpacity onPress={ () => {
                handleAction('Performance');
              }} style={styles.tOpacity}>
                <Image source={{uri:perf_icn}} style={styles.gridCellIcon} />
                <Text style={styles.gridCellText}>Performamce</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.gridColumn}>
            <View style={styles.gridCell}>
              <TouchableOpacity onPress={ () => {
                handleAction('Forum');
              }} style={styles.tOpacity}>
                <Image source={{uri:forum_icn}} style={styles.gridCellIcon} />
                <Text style={styles.gridCellText}>Forums</Text>
              </TouchableOpacity>
            </View>
            <View style={[styles.gridCell, {marginRight:5}]}>
              <TouchableOpacity onPress={ () => {
                handleAction('Survey');
              }} style={styles.tOpacity}>
                <Image source={{uri:surv_icn}} style={styles.gridCellIcon} />
                <Text style={styles.gridCellText}>Surveys</Text>
              </TouchableOpacity>
            </View>
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
    flexDirection:"row", 
    flex:1,
    marginTop:10,
    marginRight:10,
    marginLeft:10,
  },
  gridCell:{
    flex:1, 
    justifyContent:"center", 
    alignItems:"center", 
    padding:10, marginRight:10, 
    backgroundColor:colors.white, 
    borderRadius:10
  },
  gridCellIcon:{
    width:60, 
    height:60,
    margin:5,
  },
  gridCellText:{
    marginTop:10,
    marginBottom:10,
    color:colors.primary,
    fontWeight:"bold"
  },
  tOpacity:{
    alignItems:"center",
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

export default WelcomeScreen;
