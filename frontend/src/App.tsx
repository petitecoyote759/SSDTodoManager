import "./App.css";
import { useState } from "react";
import { Client } from "./Client.ts"
import { LoginScreen } from "./Screens/LoginScreen";
import { MainScreen } from "./Screens/MainScreen"





export default function App() {

  const [client, setClient] = useState<Client | null>(null)









  if (client == null) {
    return <LoginScreen setClient={setClient}/>
  }
  else {
    return <MainScreen client={client} setClient={setClient}/>
  }
}
