import { StatusBar } from "expo-status-bar";
import {  SafeAreaView } from "react-native";
import { StyleSheet,View,Text,Pressable,ActivityIndicator } from "react-native";
import { useState} from "react";
import { router } from "expo-router";




export default function NavigationScreen() {
    const [loading,setloading]=useState(false);
    
    //  Navigation function with loader
  const handleNavigationRecord = ()=>{
    setloading(true);

    setTimeout(()=>{
      router.replace("./record");
      setloading(false)
    }, 1000)
  }


  return (
   <>
   <SafeAreaView style={styles.safeareaview}>
        <StatusBar style="Dark"/>
            <View style={styles.container}>
               <Pressable style={styles.button} onPress={handleNavigationRecord}>
                  <Text style={styles.buttontext}>Record</Text>
                </Pressable>
                
                 <Pressable style={styles.button} onPress={()=> router.replace("./index")}>
                  <Text style={styles.buttontext}>Support</Text>
                </Pressable>
            </View>
             {loading && <ActivityIndicator size="large" color="white" marginTop="10"/>}
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
    flexDirection:"row",
    gap:20
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
  buttontext:{
    textAlign:"center",
    fontSize:15,
    color:"white"
  }
})
