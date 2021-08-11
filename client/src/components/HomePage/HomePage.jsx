import React, { useContext } from 'react'
import { Redirect } from 'react-router'
import { useHistory } from 'react-router-dom'
import AuthContext from '../../context/AuthContext'
import './HomePage.css'

const HomePage = () => {

    const { loggedIn } = useContext(AuthContext)
    const history = useHistory()
    let imageName = require("../../images/simpleDocsSS1.JPG")

    const homeNotLoggedIn = (
        <div className="main-div" >

            <div className="main-heading--div" >
                <h1 className="main-heading">RedactTogether</h1>
            </div>

            <div className="main-content--div" >
                <div className="main-content-image--div" >
                    <h2>WELCOME</h2>
                </div>

                <div className="headerDivider" />

                <div className="main-content-content--div">

                    <h2 className="heading-secondary-home" >A dedicated tool for member checks!</h2>
                    <button className="login-button--sm"
                        onClick={
                            () => {
                                history.push("/login")
                            }
                        }
                    >Log In</button>

                </div>

            </div>

        </div>
    )

    return (
        <>
            {/* <Navbar /> */}

            {
                loggedIn ? <Redirect to="/dashboard" /> : homeNotLoggedIn
            }

        </>

    )
}

export default HomePage
