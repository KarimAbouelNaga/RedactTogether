import React, { useContext, useState } from 'react'
import axios from 'axios'
import AuthContext from '../../context/AuthContext'
import { Redirect, useHistory } from 'react-router'
import {useSlate} from "slate-react";

const Signup = () => {
    //const [username, setUsername = useState("")]
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    //const [errorStatus, setErrorStatus] = useState("")
    const [errorMessage, setErrorMessage] = useState("")

    const { loggedIn, getLoggedInState } = useContext(AuthContext)

    const history = useHistory()

    const handleSubmit = async (e) => {
        e.preventDefault()

        const loginData = {
            email,
            password,
        }

        try {
            await axios.post("/api/users/login", loginData)

            getLoggedInState()
            history.push("/dashboard")
        } catch (err) {
            //console.log(err.response.data)
            if (err.response.data.status === "fail") {
                setErrorMessage(err.response.data.message)
                //setErrorStatus(err.response.data.status)
            }
        }

    }

    return (
        <div className='page-center' style={{marginTop : "50px"}}>
        <div className="ui centered grid container">
        <div className="nine wide column">
                    {
                        loggedIn ? <Redirect to="/dashboard" /> : null
                    }

                    {
                        errorMessage
                            ? <div className="ui icon warning message">
                                <i className="lock icon"/>
                                <div className="content">
                                    <div className="header">
                                        {errorMessage}
                                    </div>
                                </div>
                            </div>
                            : null
                    }

                    <div className="ui fluid card">
                        <div className="content">
                            <form className='ui form' onSubmit={(e) => handleSubmit(e)}>
                                <div className="field">
                                    <label>
                                        E-Mail
                                    </label>
                                    <input type='text' name='user' placeholder="Email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)} />
                                </div>
                                <div className="field">
                                    <label>
                                        Password
                                    </label>
                                    <input type='password' name='user' placeholder='Password' value={password}
                                        onChange={(e) => setPassword(e.target.value)} />
                                </div>
                                <button style={{marginLeft:"40%"}} className="ui positive labeled icon button" type="submit">
                                    <i className="unlock alternate icon"/>
                                    Login
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
            </div>
    )
}


export default Signup
