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
  const [timer,setTimer] = useState(0);
  const [intervalid, setIntervalId] = useState(null)
  const [searchQuery, setSearchQuery] = useState('');


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

const filteredRecordings = recordings.filter((recording) =>
  (recording.title || "").toLowerCase().includes(searchQuery.toLowerCase()) // Ensure title exists before calling toLowerCase()
);

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

        const id = setInterval(()=>{
          setTimer((prev)=>prev+1)
        },1000)
        setIntervalId(id)
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
       
      // Stop Timer
      clearInterval(intervalid);
      setIntervalId(null);
      setTimer(0)
      
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
        mimeType: 'audio/mp4', 
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


  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
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
  
    const updateRecordingTitle = async (index, newTitle) => {
      try {
        // Update title in the state
        const updatedRecordings = recordings.map((recording, i) =>
          i === index ? { ...recording, title: newTitle } : recording
        );
        setRecordings(updatedRecordings);
  
        // Persist updated recordings in AsyncStorage
        await AsyncStorage.setItem('recordings', JSON.stringify(updatedRecordings));
      } catch (error) {
        console.error('Error updating recording title:', error);
      }
    };
  
    return filteredRecordings.map((recordingLine, index) => (
      <Pressable key={index} onLongPress={() => deleteRecording(index)}>
        <View style={styles.row}>
          {/* Editable title */}
          <View style={styles.textDate}>
            <TextInput
              style={styles.recordInput}
              value={recordingLine.title || `Recording #${index + 1}`}
              onChangeText={(newTitle) => updateRecordingTitle(index, newTitle)}
              placeholder="Enter title"
            />
            <Text style={styles.metadata}>
              {recordingLine.duration} | {formattedDate} | {formattedTime}
            </Text>
          </View>

          <View style={styles.buttonscontainer}>
            <Pressable onPress={() => playSound(recordingLine.uri)}>
              <Text>Play</Text>
            </Pressable>
            {/* Share button */}
            <Pressable onPress={() => shareRecording(recordingLine)}>
              <EvilIcons name="share-apple" size={20} color="black" />
            </Pressable>
          </View>
          {/* Play button */}
       
        </View>
      </Pressable>
    ));
  }


  return (
    <SafeAreaView style={styles.safeAreaView}>
      <StatusBar style="Dark" />
    
      {/* Scrollable list of recordings */}
      <ScrollView style={styles.recordingListContainer}>
        <View>  
          <Text style={{ textAlign: "center", fontSize:20,fontWeight:"bold" , marginTop:20}}>Your Recordings</Text>
           <TextInput style={styles.input} placeholder='Search Recordings...' value={searchQuery} onChangeText={(text)=>setSearchQuery(text)}/>
          {getRecordingLines()}
          {loading && <ActivityIndicator size="large" color="#5AB8A6"/>}
        </View>
       
      </ScrollView>
      
      {/* Control buttons */}
      <View style={styles.container}>
      {/* Timer Display */}
      <Text style={styles.timer}>{formatTime(timer)}</Text>

      {/* Recording Button */}
      <Pressable
        style={styles.button}
        onPress={recording ? stopRecording : startRecording}
      >
        <Text style={styles.buttonText}>
          {recording ? (
            <FontAwesome6 name="pause" size={20} color="blue" />
          ) : (
            <Octicons name="dot-fill" size={36} color="red" />
          )}
        </Text>
      </Pressable>

      <Toast />
    </View>
    </SafeAreaView>
  );
}


// Syles
const styles = StyleSheet.create({
  safeAreaView: {
    flex: 1,
    backgroundColor: "#2C3E50", // Deep blue-gray background
    alignItems: 'center',
  },
  statusBar:{
    backgroundColor:"#2C3E50"
  },
  container: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    bottom: 40,
    width: 120,
    alignSelf: 'center',
  },
  button: {
    backgroundColor: '#3498DB', // Bright blue for recording button
    borderRadius: 50,
    height: 90,
    width: 90,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 4,
    borderColor: '#ECF0F1',
    // Enhanced shadow
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 10,
  },
  buttonText: {
    color: '#ECF0F1',
  },
  timer: {
    fontSize: 24,
    fontWeight: '600',
    color: '#ECF0F1',
    marginBottom: 20,
    letterSpacing: 2,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 90,
    gap: 15,
    width: "100%",
    borderRadius: 20,
    padding: 16,
    backgroundColor: '#34495E', // Darker blue-gray
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#445565',
    // Enhanced shadow
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
  recordingListContainer: {
    flex: 1,
    marginTop: 24,
    marginBottom: 180,
    borderRadius: 30,
    width: '94%',
    backgroundColor: "#243342", // Medium blue-gray
    paddingHorizontal: 20,
    paddingTop: 16,
    // Enhanced shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 15,
  },
  input: {
    height: 55,
    fontSize: 16,
    borderWidth: 0,
    marginTop: 16,
    marginBottom: 16,
    borderRadius: 16,
    paddingHorizontal: 20,
    width: "100%",
    backgroundColor: '#ffffff',
    color: '#000000',
    // Subtle inner shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  recordInput: {
    width: 180,
    fontSize: 16,
    fontWeight: '500',
    color: '#ECF0F1',
    padding: 4,
    backgroundColor: 'transparent',
  },
  textDate: {
    flex: 1,
    flexDirection: "column",
    gap: 10,
  },
  buttonscontainer: {
    flexDirection: "row",
    alignItems: 'center',
    gap: 20,
    backgroundColor: '#2C3E50',
    padding: 10,
    borderRadius: 12,
  },
  metadata: {
    fontSize: 13,
    color: '#BDC3C7',
    fontWeight: '400',
    letterSpacing: 0.5,
  },
  headerText: {
    textAlign: "center",
    fontSize: 28,
    fontWeight: "700",
    marginTop: 24,
    marginBottom: 16,
    color: '#ECF0F1',
    letterSpacing: 0.5,
  },
  playButton: {
    backgroundColor: '#3498DB',
    padding: 12,
    borderRadius: 12,
    width: 80,
    alignItems: 'center',
  },
  playButtonText: {
    color: '#ECF0F1',
    fontWeight: '600',
    fontSize: 15,
  },
  shareButton: {
    backgroundColor: '#2C3E50',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingIndicator: {
    marginTop: 24,
    color: '#3498DB',
  },
  searchIcon: {
    position: 'absolute',
    right: 20,
    top: 28,
    color: '#BDC3C7',
  }
});