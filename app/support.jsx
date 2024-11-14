import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native";
import { StyleSheet,View,Text,Pressable,ActivityIndicator } from "react-native";
import { useState,useEffect } from "react";
import { router } from "expo-router";

// array that holds 2 strings rendered in the button
const buttonText = ["Capture", "Vibe"]


export default function LandingScreen() {
  // state to keep track of the buttonText index
  const [currentTextIndex,setCurrentTextIndex] = useState(0);
  // initial state of the loader
  const [loading,setloading]=useState(false)

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

//  Navigation function with loader
//   const handleNavigation = ()=>{
//     setloading(true);

//     setTimeout(()=>{
//       router.replace("./navigation");
//       setloading(false)
//     }, 1000)
//   }

  return (
   <>
   <SafeAreaView style={styles.safeareaview}>
        <StatusBar style="Dark"/>
            <View style={styles.textcontainer}>
                <Text></Text>
            </View>
            <View style={styles.containerform}>
                <Text></Text>
            </View>  
            <View style={styles.iconscontainer}>
                <Text style={{textAlign:"center"}}>hell</Text>
            </View>
   </SafeAreaView>
   </>
  );
}

// Styles 
const styles = StyleSheet.create({
  safeareaview:{
    flex:1,
    backgroundColor:"#5AB8A6",
    alignItems:"center",
    justifyContent:"center",
    width:"100%",
    height:"100%",
    gap:10
  },
  containerform:{
    backgroundColor:"white",
    color:"white",
    height:"50%",
    width:"90%",
    borderRadius:"20px"
  },
  textcontainer:{
    backgroundColor:"white",
    height:"10%",
    width:"90%",
    borderRadius:"20px",
  },
  iconscontainer:{
    backgroundColor:"white",
    height:"10%",
    width:"90%",
    borderRadius:"20px",
    
  }
})
