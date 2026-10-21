import "./App.css";
import { LoginScreen } from "./Screens/LoginScreen";
import { MainScreen } from "./Screens/MainScreen"
import { useState } from "react";





export default function App() {

  const [loggingIn, setLoggingIn] = useState<boolean>(true)










  if (loggingIn) {
    return (<LoginScreen/>)
  }
  else {
    return (
      <MainScreen/>
    )
  }
}
