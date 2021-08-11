import React, { useContext, useState } from 'react'
import axios from 'axios'
import AuthContext from '../../context/AuthContext'
import { Redirect, useHistory } from 'react-router'
import './Signup.css'


const Signup = () => {

    const [username, setUsername] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [passwordConfirm, setPasswordConfirm] = useState("")


    //const [errorStatus, setErrorStatus] = useState("")
    const [errorMessage, setErrorMessage] = useState("")

    const { loggedIn } = useContext(AuthContext)

    const history = useHistory()

    const handleSubmit = async (e) => {
        e.preventDefault()

        const signupData = {
            username,
            email,
            password,
            passwordConfirm
        }

        try {
            await axios.post("/api/users/signup", signupData)

            history.push({
                pathname: '/login'
            })

        } catch (err) {
            //console.log(err.response.data)
            if (err.response.data.status === "fail") {
                setErrorMessage(err.response.data.message)
                //setErrorStatus(err.response.data.status)
            }
        }

    }

    return (
        <div className="center" >


            <h1>Signup</h1>

            {
                loggedIn ? <Redirect to="/dashboard" /> : null
            }

            {
                errorMessage
                    ? <div className="error-box" > <p className="error-text" > {errorMessage} </p> </div>
                    : null
            }

<div className="ui fluid card" style={{marginTop: "20px"}}>
                        <div className="content">
                            <form className='ui form' onSubmit={(e) => handleSubmit(e)}>
                                <div className="field">
                                    <label>
                                        Username
                                    </label>
                                    <input type='text' name='user' placeholder="UserName"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)} />
                                </div>
                                <div className="field">
                                    <label>
                                        Email
                                    </label>
                                    <input type='text' name='user' placeholder="Email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)} />
                                </div>
                                <div className="field">
                                    <label>
                                        ORCID (optional)
                                    </label>
                                    <input type='text' placeholder="Orcid"/>
                                </div>
                                <div className="field">
                                    <label>
                                        Password
                                    </label>
                                    <input type='password' name='user' placeholder='Password' value={password}
                                        onChange={(e) => setPassword(e.target.value)} />
                                </div>
                                <div className="field">
                                    <label>
                                        Confirm Password
                                    </label>
                                    <input type='password' name='user' placeholder='Confirm Password' value={passwordConfirm}
                                        onChange={(e) => setPasswordConfirm(e.target.value)} />
                                </div>
                                <button style={{marginLeft: "30%"}} className="ui positive labeled icon button" type="submit">
                                    <i className="unlock alternate icon"/>
                                    Sign Up
                                </button>
                            </form>
                        </div>
                                    <div  className="ui bottom attached button">
                                        Sign up as Participant
                                    </div>
                    </div>
        </div>
    )
}


export default Signup
