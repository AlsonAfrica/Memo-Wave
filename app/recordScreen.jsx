import React, { useState } from 'react';
import { SafeAreaView, View, Text, Pressable, StyleSheet, StatusBar, ScrollView,Alert } from 'react-native';
import { Audio } from 'expo-av';
// import { useRouter } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import EvilIcons from '@expo/vector-icons/EvilIcons';

export default function RecordingScreen() {
  const [recording, setRecording] = useState(null);
  const [recordings, setRecordings] = useState([]);
  // const [loading, setLoading] = useState(false);
  // const router = useRouter();

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

  // Function to stop recording audio
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

  // Helper function to format recording duration
  function getDurationFormatted(milliseconds) {
    const minutes = Math.floor(milliseconds / 1000 / 60);
    const seconds = Math.floor((milliseconds / 1000) % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  }

  // Function to delete a recording by index
  const deleteRecording = (index) => {
    Alert.alert(
      `Delete Recording #${index + 1}`, // Display a clear message with recording number
      'Are you sure you want to delete this recording?', // Additional confirmation text
      [
        {
          text: 'Yes',
          onPress: () => {
            setRecordings((prevRecordings) => prevRecordings.filter((_, i) => i !== index));
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
    return recordings.map((recordingLine, index) => (
      <Pressable key={index} onLongPress={() => deleteRecording(index)}>
        <View style={styles.row}>
          <Text style={styles.fill}>Recording #{index + 1} | {recordingLine.duration}</Text>
          <Pressable onPress={() => recordingLine.sound.replayAsync()} title="Play">
            <Text>Play</Text>
          </Pressable>
          <Pressable onPress={() => console.log("Shared")}>
            <EvilIcons name="share-apple" size={15} color="black" />
          </Pressable>
        </View>
      </Pressable>
    ));
  }

  // Function to clear all recordings
  function clearRecordings() {
    setRecordings([]);
  }

  return (
    <SafeAreaView style={styles.safeAreaView}>
      <StatusBar style="light" />
      
      {/* Scrollable list of recordings */}
      <ScrollView style={styles.recordingListContainer}>
        <View>
          <Text style={{ textAlign: "center" }}>Your Recordings</Text>
          {getRecordingLines()}
        </View>
      </ScrollView>
      
      {/* Control buttons */}
      <View style={styles.container}>
        <Pressable
          style={styles.button}
          onPress={recording ? stopRecording : startRecording}
        >
          <Text style={styles.buttonText}>
            {recording ? <FontAwesome6 name="pause" size={20} color="white" /> : <FontAwesome name="play" size={15} color="white" />}
          </Text>
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
    height: 50,
    gap: 10,
    width: "100%",
    borderRadius: 10,
    padding: 10,
    backgroundColor: '#f0f0f0',
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
});
