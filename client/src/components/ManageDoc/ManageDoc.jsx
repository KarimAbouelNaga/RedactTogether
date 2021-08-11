import axios from "axios"
import { useEffect, useRef, useState } from "react"
import './ManageDoc.css'
import { Redirect } from 'react-router-dom'
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.min.css';
import CollabListItem from '../CollabListItem/CollabListItem'
import ViewersListItem from '../ViewersListItem/ViewersListItem'

const ManageDoc = (props) => {

    const stateProp = props.location.state ? props.location.state.id : null
    const [id] = useState(stateProp)
    const [inputTerm, setInputTerm] = useState("")
    const [title, setTitle] = useState("")
    const [errorMessage, setErrorMessage] = useState("")
    const [collaborators, setCollaborators] = useState([])
    const [viewers, setViewers] = useState([])
    const [loading, setLoading] = useState(true)

    async function getInitialStates() {
        const response = await axios.get(`/api/docs/populated/${id}`)
        console.log(response)
        setTitle(response.data.data.doc.name)
        setCollaborators(response.data.data.doc.collaborators)
        setViewers(response.data.data.doc.viewers)
        setLoading(false)
    }

    useEffect(() => {
        getInitialStates()
    }, [])

    const inputRef = useRef(null)

    const viewDocHandler = (id) => {
        const idString = `id=${id}`

        props.history.push({
            pathname: '/view',
            search: idString,
            //state: { docId: id }
        })
    }

    const updateNameHandler = (inputTerm) => {
        async function updateName() {
            try {
                await axios.patch(`/api/docs/${id}`, {
                    name: inputTerm
                })

                //console.log(response.data)

                setTitle(inputTerm)

                toast.success("Document Renamed!", {
                    position: toast.POSITION.TOP_LEFT,
                    autoClose: 2000
                })

                setInputTerm("")
                inputRef.current.value = ""
                setErrorMessage("")
            } catch (err) {
                //console.log(err.response.data)
                setErrorMessage(err.response.data.message)
            }
        }

        updateName()
    }

    const removeCollab = (collaborator) => {
        async function removeInner() {

            try {
                // console.log(collaborator)
                const response = await axios.patch(
                    `/api/docs/${id}/removeCollaborator`,
                    { collabId: collaborator._id }
                )

                //console.log(response.data)
                if (response.data.status === "success") {
                    setCollaborators(
                        (prevState) => {
                            return prevState.filter(ele => ele._id !== collaborator._id)
                        }
                    )

                    toast.error("Collaborator Removed!", {
                        position: toast.POSITION.TOP_LEFT,
                        autoClose: 2000
                    })
                }

            } catch (err) {
                //console.log(err)
                setErrorMessage(err.response.data.message)
            }

        }

        removeInner()

    }
    const removeViewer = (viewer) => {
        async function removeViewerInner() {

            try {
                console.log(viewer)
                const response = await axios.patch(
                    `/api/docs/${id}/removeViewer`,
                    { viewerId: viewer }
                )

                // console.log(response.data)
                if (response.data.status === "success") {
                    setViewers(
                        (prevState) => {
                            return prevState.filter(ele => ele._id !== viewer._id)
                        }
                    )

                    toast.error("Viewer Removed!", {
                        position: toast.POSITION.TOP_LEFT,
                        autoClose: 2000
                    })
                }

            } catch (err) {
                //console.log(err)
                setErrorMessage(err.response.data.message)
            }

        }

        removeViewerInner()

    }

    return (

        <div>
            {
                props.location.state
                    ? (
                        <div>

                            {
                                errorMessage
                                    ? <Redirect to={{ pathname: "/error", state: { message: errorMessage } }} />
                                    : null
                            }

                            {
                                loading === true ? <div className="medium progress"><div>Loading…</div></div>
                                    : (
                                        <div className="container" >
                                            <div className="new-doc-card mt-50" >

                                                <div className="add-new-doc">

                                                    <h3 className="heading-secondary" >Rename document</h3>
                                                </div>

                                                <form className="add-new-doc-form"
                                                    onSubmit={
                                                        (e) => {
                                                            e.preventDefault()
                                                            updateNameHandler(inputTerm)
                                                        }
                                                    }
                                                >
                                                    <div style={{ display: "flex" }} >
                                                        <label className="doc-title doc-title-new"
                                                            style={{ cursor: "pointer" }}
                                                            onClick={ () => viewDocHandler(id) }
                                                        > {title} </label>


                                                    </div>

                                                    <input
                                                        type="text"
                                                        placeholder="Enter new name"
                                                        ref={inputRef}
                                                        onChange={(e) => setInputTerm(e.target.value)}
                                                        className="doc-title-input"
                                                    />

                                                    <button
                                                        type="submit"
                                                        disabled={!inputTerm}
                                                        className="add-new-doc-btn"
                                                    >
                                                        Update
                                                    </button>

                                                </form>
                                            </div>

                                            <div className="docs-card" style={{ marginTop:"10px" }} >

                                                <div className="saved-docs-div" >
                                                    <h3 className="heading-secondary" >Participants</h3>
                                                </div>

                                                {
                                                    collaborators.map(
                                                        (collaborator, index) => {
                                                            return (
                                                                <CollabListItem
                                                                    key={index}
                                                                    collaborator={collaborator}
                                                                    removeCollab={removeCollab}
                                                                />
                                                            )
                                                        }
                                                    )
                                                }

                                            </div>
                                            <div className="docs-card" >

                                                <div className="saved-docs-div" >
                                                    <h3 className="heading-secondary" >Viewers</h3>
                                                </div>

                                                {
                                                    viewers.map(
                                                        (viewer, index) => {
                                                            return (
                                                                <ViewersListItem
                                                                    key={index}
                                                                    viewer={viewer}
                                                                    removeViewer={removeViewer}
                                                                />
                                                            )
                                                        }
                                                    )
                                                }

                                            </div>

                                        </div>
                                    )
                            }
                        </div>
                    )
                    : null
        }
        </div>


    )
}

export default ManageDoc
