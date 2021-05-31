import React from "react";
import {
  SafeAreaView,
  useColorScheme,
} from "react-native";

// import OpenCVCamera from "./OpenCVCamera";
import PickerCamera from "./PickerCamera";

const App = () => {
  // const isDarkMode = useColorScheme() === "dark";
  return (
    <SafeAreaView style={{flex:1}}>
      <PickerCamera />
    </SafeAreaView>
  );
};

export default App;
