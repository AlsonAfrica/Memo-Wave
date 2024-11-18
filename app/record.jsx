import React, { useState } from 'react';
import { SafeAreaView, View, Text, Pressable, StyleSheet, StatusBar, ScrollView,Alert } from 'react-native';
import { Audio } from 'expo-av';
import { useEffect } from 'react';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import EvilIcons from '@expo/vector-icons/EvilIcons';
import Ionicons from '@expo/vector-icons/Ionicons';
import { ActivityIndicator } from 'react-native-web';
import { router } from 'expo-router';
import Octicons from '@expo/vector-icons/Octicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import { TextInput } from 'react-native';
import * as Sharing from 'expo-sharing'
import * as FileSystem from 'expo-file-system';
// import * as Progress from 'react-native-progress';


export default function RecordingScreen() {
  const [recording, setRecording] = useState(null);
  const [recordings, setRecordings] = useState([]);
  const [loading,setloading]=useState(false);
  // const [progress,setprogress] = useState(false);
  // const [currentPlayingIndex, setCurrentTextIndex]=useState(null)


//  Destructure Date.now() to receive date and time
const now = Date.now();

const date = new Date(now);

// Extract the date components
const day = date.getDate();
const month = date.getMonth();
const year = date.getFullYear();

// Extract the time components
const hours = date.getHours();
const minutes = date.getMinutes();
const seconds = date.getSeconds();

// Format the date and time as a string
const formattedDate = `${day}/${month}/${year}`;
const formattedTime = `${hours}:${minutes}:${seconds}`

  // Function to start recording audio
  async function startRecording() {
    try {
      const permission = await Audio.requestPermissionsAsync();
      if (permission.status === 'granted') {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
        });
        const { recording } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
        setRecording(recording);
      }
    } catch (error) {
      console.error('Error starting recording:', error);
    }
  }

  useEffect(() => {
    // Load recordings from AsyncStorage on component mount
    const loadRecordings = async () => {
      try {
        const savedRecordings = await AsyncStorage.getItem('recordings');
        if (savedRecordings) {
          setRecordings(JSON.parse(savedRecordings));
        }
      } catch (error) {
        console.error('Error loading recordings:', error);
      }
    };
  
    loadRecordings();
  }, []);

  // NAVIGATE BACK TO THE PREVIOUS PAGE
  const handleBack = ()=>{
    setloading(true);

    setTimeout(()=>{
      router.replace("./navigation");
      setloading(false)
    }, 1000)
  }

  // Function to stop recording audio
  async function stopRecording() {
    try {
      if (!recording) return;
  
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
  
      const { sound, status } = await Audio.Sound.createAsync({ uri });
  
      const newRecording = {
        uri, // Save file URI
        duration: getDurationFormatted(status.durationMillis), // Save formatted duration
      };
  
      // Update state with new recording
      setRecordings((prevRecordings) => [...prevRecordings, newRecording]);
  
      // Save to AsyncStorage
      const savedRecordings = await AsyncStorage.getItem('recordings');
      const recordingsArray = savedRecordings ? JSON.parse(savedRecordings) : [];
      recordingsArray.push(newRecording);
      await AsyncStorage.setItem('recordings', JSON.stringify(recordingsArray));
  
      Toast.show({
        type: 'success',
        text1: 'Recording Saved!',
        text2: 'Your recording has been successfully saved.',
        position: 'top',
      });
  
      setRecording(null);
    } catch (error) {
      console.error('Error stopping recording:', error);
  
      Toast.show({
        type: 'error',
        text1: 'Error!',
        text2: 'Failed to save the recording.',
        position: 'top',
      });
    }
  }

  const shareRecording = async (recordingLine) => {
    try {
      // Check if sharing is available
      if (!(await Sharing.isAvailableAsync())) {
        Toast.show({
          type: 'error',
          text1: 'Sharing Unavailable',
          text2: 'Sharing is not supported on this device.',
          position: 'top',
        });
        return;
      }
  
      // Ensure we have a valid URI
      if (!recordingLine?.uri) {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'No recording file found.',
          position: 'top',
        });
        return;
      }
  
      // Check file exists and is readable
      const fileInfo = await FileSystem.getInfoAsync(recordingLine.uri);
      if (!fileInfo.exists) {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'Recording file is missing.',
          position: 'top',
        });
        return;
      }
  
      // Generate a shareable filename
      const fileName = `Recording_${new Date().toISOString().replace(/:/g, '-')}.mp4`;
      const newUri = `${FileSystem.documentDirectory}${fileName}`;
  
      // Copy the file to a shareable location
      await FileSystem.copyAsync({
        from: recordingLine.uri,
        to: newUri,
      });
  
      // Share the file
      await Sharing.shareAsync(newUri, {
        mimeType: 'audio/mp4', // Adjust mime type as needed
        dialogTitle: 'Share Your Recording',
      });
  
    } catch (error) {
      console.error('Error sharing recording:', error);
      Toast.show({
        type: 'error',
        text1: 'Sharing Failed',
        text2: 'Unable to share the recording.',
        position: 'top',
      });
    }
  };
  
  // Helper function to format recording duration
  function getDurationFormatted(milliseconds) {
    const minutes = Math.floor(milliseconds / 1000 / 60);
    const seconds = Math.floor((milliseconds / 1000) % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  }

  // Function to delete a recording by index
  const deleteRecording = async (index) => {
    Alert.alert(
      `Delete Recording #${index + 1}`, // Display a clear message with recording number
      'Are you sure you want to delete this recording?', // Additional confirmation text
      [
        {
          text: 'Yes',
          onPress: async () => {
            // Remove recording from state
            setRecordings((prevRecordings) => {
              const updatedRecordings = prevRecordings.filter((_, i) => i !== index);
              
              // Update AsyncStorage with the new list
              AsyncStorage.setItem('recordings', JSON.stringify(updatedRecordings))
                .catch((error) => console.error('Error updating AsyncStorage:', error));
  
              return updatedRecordings;
            });
          //  Toaster Positioning 
            Toast.show({
              type: 'success',
              text1: 'Recording Deleted!',
              text2: 'Your recording has been successfully Deleted.',
              position: 'top',
            });
  
            console.log(`Recording #${index + 1} deleted`); // Log the deletion
          },
          style: 'destructive', // Optional style for emphasis on destructive action
        },
        {
          text: 'No',
          onPress: () => console.log('Deletion canceled'), // Log cancellation
          style: 'cancel', // Default cancel style
        },
      ]
    );
  };
  
  // Function to render each recording item
  function getRecordingLines() {
    const playSound = async (uri) => {
      try {
        const { sound } = await Audio.Sound.createAsync({ uri });
        await sound.playAsync();
        sound.setOnPlaybackStatusUpdate((status) => {
          if (status.didJustFinish) {
            sound.unloadAsync(); // Unload sound when playback is finished
          }
        });
      } catch (error) {
        console.error('Error playing sound:', error);
      }
    };
  
    return recordings.map((recordingLine, index) => (
      <Pressable key={index} onLongPress={() => deleteRecording(index)}>
        <View style={styles.row}>
          <Text style={styles.fill}>
            Recording #{index + 1} | {recordingLine.duration} | {formattedDate} | {formattedTime}
          </Text>
          <Pressable onPress={() => playSound(recordingLine.uri)}>
            <Text>Play</Text>
          </Pressable>
          <Pressable onPress={() => shareRecording(recordingLine)}>
            <EvilIcons name="share-apple" size={15} color="black" />
          </Pressable>
          <Pressable>
            <Ionicons name="ellipsis-vertical" size={15} color="black" />
          </Pressable>
        </View>
      </Pressable>
    ));
  }
  

  // Function to clear all recordings
  // function clearRecordings() {
  //   setRecordings([]);
  // }

  return (
    <SafeAreaView style={styles.safeAreaView}>
      <StatusBar style="Dark" />
      
      {/* Scrollable list of recordings */}
      <ScrollView style={styles.recordingListContainer}>

        <View>
          <Pressable style={styles.backbutton}>
            <Ionicons name="caret-back" size={20} color="#5AB8A6" onPress={()=>handleBack()} />
          </Pressable>
          <Text style={{ textAlign: "center", fontSize:20,fontWeight:"bold" }}>Your Recordings</Text>
           <TextInput style={styles.input} placeholder='Search...'/>
          {getRecordingLines()}
          {loading && <ActivityIndicator size="large" color="#5AB8A6"/>}
        </View>
       
      </ScrollView>
      
      {/* Control buttons */}
      <View style={styles.container}>
        <Pressable
          style={styles.button}
          onPress={recording ? stopRecording : startRecording}
        >
          <Text style={styles.buttonText}>
            {recording ? <FontAwesome6 name="pause" size={20} color="white" /> : <Octicons name="dot-fill" size={36} color="red" />}
          </Text>
        </Pressable>
        <Toast/>
      </View>
    </SafeAreaView>
  );
}


// Syles
const styles = StyleSheet.create({
  safeAreaView: {
    flex: 1,
    backgroundColor: "#5AB8A6",
    alignItems: 'center',
  },
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    position: "absolute",
    bottom: 50,
    left: "50%",
    transform: [{ translateX: -20 }],
  },
  button: {
    padding: 15,
    backgroundColor: '#1e90ff',
    borderRadius: 5,
    marginVertical: 10,
    borderRadius:"50%",
    height:50,
    width:50,
    alignItems:"center",
    justifyContent:"center",
    padding:10
  },
  buttonText: {
    color: 'white'
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 50,
    gap:10,
    width: "100%",
    borderRadius: 10,
    padding: 15,
    backgroundColor: '#f0f0f0',
    marginTop:10
  },
  fill: {
    flex: 1,
  },
  recordingListContainer: {
    flex: 1,
    marginTop: 20,
    marginBottom: 130,
    borderRadius: 20,
    width: '90%',
    backgroundColor: "white",
    paddingHorizontal: 20,
    
    // Shadow for iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,

    // Shadow for Android
    elevation: 10,
  },
  backbutton:{
    margin:10,
   marginHorizontal:-10
  },
  input:{
      flex: 1,
      height: 40,
      fontSize: 16,
      borderWidth: 2,
      marginTop:10,
      borderRadius:"20px",
      padding:7,
      width:"100%",
      borderColor:"#5AB8A6",
  }
});
