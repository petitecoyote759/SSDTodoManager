import React, { SetStateAction, useEffect, useState } from 'react'
import "./LoginScreen.css"
import { Client } from '../Client'


type loginFormParams = {
    email: string,
    setEmail: React.Dispatch<React.SetStateAction<string>>,
    password: string,
    setPassword: React.Dispatch<React.SetStateAction<string>>,
    loading: boolean,
    handleSubmitLogin: (event: Parameters<NonNullable<React.ComponentProps<"form">["onSubmit"]>>[0]) => void,
    setRegister: React.Dispatch<React.SetStateAction<boolean>>,
}



function LoginForm({email, setEmail, password, setPassword, loading, handleSubmitLogin, setRegister}: loginFormParams) {

    return (
        <div className="login-form-content">
            <form className="login-fields" onSubmit={handleSubmitLogin}>
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



            <button
                className="login-switch"
                onPointerDown={e => e.stopPropagation()}
                onClick={e => setRegister(true)}
            >
                Register
            </button>
        </div>
    )
}


type registerFormParams = {
    username: string,
    setUsername: React.Dispatch<React.SetStateAction<string>>,
    email: string,
    setEmail: React.Dispatch<React.SetStateAction<string>>,
    password: string,
    setPassword: React.Dispatch<React.SetStateAction<string>>,
    loading: boolean,
    handleSubmitRegister: (event: Parameters<NonNullable<React.ComponentProps<"form">["onSubmit"]>>[0]) => void,
    setRegister: React.Dispatch<React.SetStateAction<boolean>>,
}

function RegisterForm({username, setUsername, email, setEmail, password, setPassword, loading, handleSubmitRegister, setRegister}: registerFormParams) {


    return (
        <div className="login-form-content">
            <form className="login-fields" onSubmit={handleSubmitRegister}>
                <div className="login-field">
                    <label htmlFor="login-username">Username</label>
                    <input
                        id="login-username"
                        type="username"
                        placeholder="username"
                        autoComplete="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                        disabled={loading}
                    />
                </div>

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
                    {loading ? "Registering..." : "Register"}
                    {!loading && <span aria-hidden="true">→</span>}
                </button>

            </form>



            <button
                className="login-switch"
                onPointerDown={e => e.stopPropagation()}
                onClick={e => setRegister(false)}
            >
                Log In
            </button>
        </div>
    )
}






type LoginScreenParams = {
    setClient: React.Dispatch<SetStateAction<Client | null>>
}

export function LoginScreen({ setClient }: LoginScreenParams) {

    const [email, setEmail] = useState<string>("")
    const [password, setPassword] = useState<string>("")
    const [username, setUsername] = useState<string>("")

    const [loading, setLoading] = useState<boolean>(false)
    const [register, setRegister] = useState<boolean>(false)



    async function handleSubmitLogin(event: Parameters<NonNullable<React.ComponentProps<"form">["onSubmit"]>>[0]) {
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


    async function handleSubmitRegister(event: Parameters<NonNullable<React.ComponentProps<"form">["onSubmit"]>>[0]) {
        event.preventDefault()

        const result = Client.createNewClient(username, email, password)
        setLoading(true)
        
        const client: Client | undefined | null = await result
        console.log(`Client type ${typeof client}`)
        if (client == null) 
        {
            console.log(`Unsuccessful creation.`) 
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


                <header className="login-header">{register ? "Register" : "Log In"}</header>


                <div className="login-form-area">

                    {(() => {
                    if (register) {
                        return <RegisterForm 
                            username={username} setUsername={setUsername} email={email} setEmail={setEmail} password={password} setPassword={setPassword}
                            loading={loading} handleSubmitRegister={handleSubmitRegister} setRegister={setRegister}
                        />
                    }
                    else {
                        return <LoginForm
                            email={email} setEmail={setEmail} password={password} setPassword={setPassword}
                            loading={loading} handleSubmitLogin={handleSubmitLogin} setRegister={setRegister}
                        />
                    }
                    })()}

                    <footer className="login-footer">
                        5724102
                    </footer>

                </div>
            </div>
        </div>
    )
}