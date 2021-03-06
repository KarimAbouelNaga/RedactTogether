import axios from "axios"
import { useContext } from "react"
import AuthContext from "../context/AuthContext"

const LogoutButton = () => {

    const { getLoggedInState } = useContext(AuthContext)

    async function logout() {
        await axios.get('/api/users/logout')
        getLoggedInState()
        window.location.reload()
    }

    return (
        <div>
             <button className="ui black button" onClick={logout}>Log Out</button>
        </div>
    )
}

export default LogoutButton
