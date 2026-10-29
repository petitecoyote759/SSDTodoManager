import "./App.css";
import { useEffect, useState } from "react";
import { Client } from "./Client.ts"
import { LoginScreen } from "./Screens/LoginScreen";
import { MainScreen } from "./Screens/MainScreen"





export default function App() {

  const [client, setClient] = useState<Client | null>(null)
  const [loading, setLoading] = useState<boolean>(false)


  useEffect(() => {
    var cancelled = false

    async function autoLogin() {
      try {
        const restoredClient = await Client.checkExistingClient()

        if (!cancelled && restoredClient) {
          setClient(restoredClient)
        }
      } catch (e) {
        console.error(`Auto-login failed: ${e}`)
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    autoLogin();

    return () => {
      cancelled = true;
    }
  }, [])

  if (loading) {
    return <div>Loading...</div>
  }







  if (client == null) {
    return <LoginScreen setClient={setClient}/>
  }
  else {
    return <MainScreen client={client} setClient={setClient}/>
  }
}
