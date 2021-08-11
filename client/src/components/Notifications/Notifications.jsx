import axios from "axios"
import { useEffect, useState, useContext } from "react"
import { Redirect } from "react-router"
import AuthContext from "../../context/AuthContext"
import './Notifications.css'
import { useHistory } from 'react-router-dom'
import io from "socket.io-client"

const socket = io()

const Notifications = () => {

    const { loggedIn } = useContext(AuthContext)
    const [loading, setLoading] = useState(true)
    const [notificationsArray, setNotificationsArray] = useState([])
    const [senderusername, setSenderUserName] = useState([])
    const [btnDis, setBtnDis] = useState(false)
    const [errorMessage, setErrorMessage] = useState("")

    const history = useHistory()

    // const socketFunc = (data) => {
    //     if (currentUser._id === data.notification.reciever) {
    //         //setTimeout(getNotifications)
    //         getNotifications()
    //     }
    // }

    // const socketTest = () => {

    //     //console.log("loggedIn")
    //     socket.on('notification-received', socketFunc)

    // }

    // useEffect(() => {
    //     if (loggedIn === true && currentUser) {
    //         socketTest()
    //     }
    // })

    async function getNotifications() {

        if (loggedIn) {
            try {
                const response = await axios.get('/api/users/notifications')
                //console.log(response.data)
                setNotificationsArray(response.data.notifications)
                console.log(response.data);
                setSenderUserName(response.data.username)
                setLoading(false)
                //buttonRef.current.disabled = true
                //setBtnDis(true)

            } catch (err) {
                //console.log(err)
                setErrorMessage(err.response.data.message)
            }
        } else {
            history.push({
                pathname: "/login"
            })
        }

        // try {
        //     const response = await axios.get('/api/users/notifications')
        //     //console.log(response.data)
        //     setNotificationsArray(response.data.notifications)
        //     setLoading(false)
        //     //buttonRef.current.disabled = true
        //     //setBtnDis(true)

        // } catch (err) {
        //     //console.log(err)
        //     setErrorMessage(err.response.data.message)
        // }
    }

    useEffect(() => {
        getNotifications()
    }, [])

    const acceptHandler = (senderId, docId, notificationId) => {
        //console.log(senderId, docId)
        async function acceptRequest() {

            try {
                setBtnDis(true)
                const response = await axios.post(`/api/users/${docId}`, {
                    senderId: senderId
                })


                //console.log(response.data)

                if (response.data.status === "success") {
                    const response = await axios.delete(`/api/notifications/${notificationId}`)
                    if (response.data.status === "success") {
                        getNotifications()
                        setBtnDis(false)

                        socket.emit("notification-deleted-sent", { status: "success" })

                    }
                }

            } catch (err) {
                //console.log(err.response.data)
                setErrorMessage(err.response.data.message)
            }


            //console.log(response.data)
        }
        acceptRequest()

    }

    const declineHandler = (notificationId) => {
        async function declineRequest() {
            const response = await axios.delete(`/api/notifications/${notificationId}`)

            if (response.data.status === "success") {
                getNotifications()
                socket.emit("notification-deleted-sent", { status: "success" })
            }

        }

        declineRequest()
    }
    const acceptViewerHandler = (senderId, docId, notificationId) => {
        //console.log(senderId, docId)
        async function acceptViewerRequest() {

            try {
                setBtnDis(true)
                const response = await axios.post(`/api/users/viewers/${docId}`, {
                    senderId: senderId
                })


                //console.log(response.data)

                if (response.data.status === "success") {
                    const response = await axios.delete(`/api/notifications/${notificationId}`)
                    if (response.data.status === "success") {
                        getNotifications()
                        setBtnDis(false)

                        socket.emit("notification-deleted-sent", { status: "success" })

                    }
                }

            } catch (err) {
                //console.log(err.response.data)
                setErrorMessage(err.response.data.message)
            }


            //console.log(response.data)
        }
        acceptViewerRequest()

    }
    const declineViewerHandler = (notificationId) => {

        async function declineViewerRequest() {
            const response = await axios.delete(`/api/notifications/${notificationId}`)

            if (response.data.status === "success") {
                getNotifications()
                socket.emit("notification-deleted-sent", { status: "success" })
            }

        }

        declineViewerRequest()
    }


    return (
        <>
            {
                loading === true ? (
                    <div className="medium progress" ><div>Loading...</div></div>
                ) : (
                    <div className="ui container" >
                        {
                                errorMessage
                                    ? <Redirect to={{ pathname: "/error", state: { message: errorMessage } }} />
                                    : null
                        }
                        {
                                !loggedIn
                                    ? <Redirect to="/login" />
                                    : null
                        }
                        <table className="ui celled structured table" style={{marginTop: "20px"}}>
                                <thead>
									<tr>
										<th rowSpan="2"/>
										<th rowSpan="2">Message</th>
										<th rowSpan="2">Access Control</th>
									</tr>
								</thead>
                                {
                                    notificationsArray ? (
                                        notificationsArray.map((notification, index) => {
                                            if(notification) {
                                                return(
                                                    <tbody key={index}>
														<tr>
														  <td rowSpan="3">Access Request</td>
														  <td rowSpan="3">{notification.notification}</td>
														  <td className="top aligned">
															<button className="ui green button" onClick={
                                                                () => {
                                                                    acceptHandler(notification.sender, notification.doc, notification._id)
                                                                }
                                                            } disabled={btnDis} >Participant</button>
														  </td>
														</tr>
														<tr>
														<td>
															<button className="ui green button" onClick={
                                                                () => {
                                                                    acceptViewerHandler(notification.sender, notification.doc, notification._id)
                                                                }
                                                            } disabled={btnDis} >Viewer</button>
														  </td>
														</tr>
														<tr>
														<td>
															<button className="ui red button" onClick={
                                                                () => declineHandler(notification._id)
                                                            } disabled={btnDis} >Decline</button>
														  </td>
														</tr>
													  </tbody>
                                                )
                                            }
                                        }
                                    )
                                        ) : null
                                }
                        </table>
                    </div>
                )
            }
        </>
    )
}

export default Notifications
