import React, { useState } from 'react';
import { SafeAreaView, View, Text, Pressable, StyleSheet, StatusBar } from 'react-native';
import { Audio } from 'expo-av';
// import { useRouter } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import { ScrollView } from 'react-native-web';

export default function RecordingScreen() {
  const [recording, setRecording] = useState(null);
  const [recordings, setRecordings] = useState([]);
  // const [loading, setLoading] = useState(false);
  // const router = useRouter();

  async function startRecording() {
    try {
      const perm = await Audio.requestPermissionsAsync();
      if (perm.status === 'granted') {
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

  async function stopRecording() {
    try {
      if (!recording) return;

      await recording.stopAndUnloadAsync();
      const { sound, status } = await recording.createNewLoadedSoundAsync();

      setRecordings((prevRecordings) => [
        ...prevRecordings,
        {
          sound,
          duration: getDurationFormatted(status.durationMillis),
          file: recording.getURI(),
        },
      ]);
      setRecording(null);
    } catch (error) {
      console.error('Error stopping recording:', error);
    }
  }

  function getDurationFormatted(milliseconds) {
    const minutes = Math.floor(milliseconds / 1000 / 60);
    const seconds = Math.floor((milliseconds / 1000) % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  }

  function getRecordingLines() {
    return recordings.map((recordingLine, index) => (
      <View key={index} style={styles.row}>
        <Text style={styles.fill}>Recording #{index + 1} | {recordingLine.duration} | {Date.now()}</Text>
        <Pressable onPress={() => recordingLine.sound.replayAsync()} title="Play">
          <Text>Play</Text>
        </Pressable>
      </View>
    ));
  }

  function clearRecordings() {
    setRecordings([]);
  }

  // const handleNavigation = () => {
  //   setLoading(true);
  //   setTimeout(() => {
  //     router.replace('./recordScreen');
  //     setLoading(false);
  //   }, 1000);
  // };

  return (
    <SafeAreaView style={styles.safeAreaView}>
      <StatusBar style="light" />
      
     
        <View style={styles.recordingListContainer}>
          <Text>Your Recordings</Text>
            {getRecordingLines()}
        </View>
  
      <View style={styles.container}>
        <Pressable
          style={styles.button}
          onPress={recording ? stopRecording : startRecording}
        >
          <Text style={styles.buttonText}>{recording ? <FontAwesome6 name="pause" size={15} color="white" /> : <FontAwesome name="play" size={15} color="white" />}</Text>
        </Pressable>
        <Pressable
          style={styles.button}
          onPress={clearRecordings}
          disabled={recordings.length === 0}
        >
          <Text style={styles.buttonText}>Clear Recordings</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeAreaView: {
    flex: 1,
    backgroundColor:"#5AB8A6"
  },
  container: {
    flex: 1,  
    flexDirection:'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap:10,
    position:"absolute",
    bottom:50,
    left: "50%",
    transform: [{ translateX: -100 }],
  },
  button: {
    padding: 15,
    backgroundColor: '#1e90ff',
    borderRadius: 5,
    marginVertical: 10,
  },
  buttonText: {
    color: 'white',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    height:50,
    gap:10
    // marginHorizontal: 5,
  },
  fill: {
    flex: 1,
  },
  recordingListContainer: {
    marginTop: 20,
    height:"80%",
    borderRadius:"20px",
    // width: '50%',
    paddingHorizontal: 20,
    alignItems: 'center',
    backgroundColor:"white",
    marginHorizontal:20,
    overflow:"scroll",

      // Shadow for iOS
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 6,
  
      // Shadow for Android
      elevation: 10, 
  },
});
