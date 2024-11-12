import { StatusBar } from "expo-status-bar";
import { Image, SafeAreaView } from "react-native";
import { StyleSheet,View,Text,Pressable } from "react-native";
import { useState,useEffect } from "react";
import { router } from "expo-router";

// array that holds 2 strings rendered in the button
const buttonText = ["Capture", "Vibe"]


export default function LandingScreen({navigation}) {
  // state to keep track of the buttonText index
  const [currentTextIndex,setCurrentTextIndex] = useState(0);

  // Use effect with timer to display each and every word in the buttonText
  useEffect(()=>{
    // Timer
    const interval = setInterval(()=>{ 
      setCurrentTextIndex((prevIndex)=>
      prevIndex === buttonText.length - 1 ? 0 : prevIndex + 1
      );
    },2000);
    // Unmount and clear the timer
    return()=>clearInterval(interval)
  },[])

  return (
   <>
   <SafeAreaView style={styles.safeareaview}>
        <StatusBar style="light"/>
            <View style={styles.container}>
              <Image
              resizeMode="contain"
              style={{height:150,width:150}}
              source={require("../assets/microphone.png")}
              />
                <Text style={styles.logoText}>Memo-Wave-2</Text>
                <Text>"Press the button below to record"</Text>
                 <Pressable style={styles.button} onPress={()=> router.replace("./indexScreen")}>
                  <Text style={styles.buttontext}>{buttonText[currentTextIndex]}</Text>
                </Pressable>
            </View>
   </SafeAreaView>
   </>
  );
}
// Styles 
const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  safeareaview:{
    backgroundColor:"#5AB8A6",
    alignItems:"center",
    justifyContent:"center",
    width:"100%",
    height:"100%"
  },
  button:{
    width:100,
    height:60,
    backgroundColor:"#21609e",
    borderRadius:10,
    color:"white",
    justifyContent:'center',
    marginTop:10,
     // Shadow for iOS
     shadowColor: '#000',
     shadowOffset: { width: 0, height: 4 },
     shadowOpacity: 0.3,
     shadowRadius: 6,
 
     // Shadow for Android
     elevation: 10, 
  },
  logoText:{
    fontSize:40,
    fontFamily:"Sans"
  },
  buttontext:{
    textAlign:"center",
    fontSize:15,
    color:"white"
  }
})
