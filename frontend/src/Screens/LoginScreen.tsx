import React, { SetStateAction, useEffect, useState } from 'react'
import "./LoginScreen.css"
import { Client } from '../Client'



type LoginScreenParams = {
    setClient: React.Dispatch<SetStateAction<Client | null>>
}




export function LoginScreen({ setClient }: LoginScreenParams) {

    const [email, setEmail] = useState<string>("")
    const [password, setPassword] = useState<string>("")
    const [loading, setLoading] = useState<boolean>(false)



    async function handleSumbit(event: Parameters<NonNullable<React.ComponentProps<"form">["onSubmit"]>>[0]) {
        event.preventDefault()

        const result = Client.createClient(email, password)
        setLoading(true)
        
        const client: Client | undefined | null = await result
        console.log(`Client type ${typeof client}`)
        if (client == null) 
        {
            console.log(`Unsuccessful login.`) 
            setLoading(false); return; 
        }

        setClient(client)
        setLoading(false)
    }








    return (
        <div className="login-screen">
            <div className="login-area">

                <div className="login-company-area">
                    <div className="company-logo">N</div>
                    <span>Note Manager</span>
                </div>


                <header className="login-header">Log In</header>


                <div className="login-form-area">

                    <form className="login-fields" onSubmit={handleSumbit}>
                        <div className="login-field">
                            <label htmlFor="login-email">Email</label>
                            <input
                                id="login-email"
                                type="email"
                                placeholder="User@domain"
                                autoComplete="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                disabled={loading}
                            />
                        </div>

                        <div className="login-field">
                            <label htmlFor="login-password">Password</label>
                            <input
                                id="login-password"
                                type="password"
                                placeholder="password"
                                autoComplete="current-password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                disabled={loading}
                            />
                        </div>

                        <button
                            className="login-submit"
                            type="submit"
                            disabled={loading}
                        >
                            {loading ? "Logging in..." : "Log in"}
                            {!loading && <span aria-hidden="true">→</span>}
                        </button>

                    </form>


                    <footer className="login-footer">
                        5724102
                    </footer>

                </div>
            </div>
        </div>
    )
}