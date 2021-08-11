import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import "./Home.css";
import AuthContext from "./context/AuthContext";
import { useHistory } from "react-router";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.min.css";
import DocListItem from "./components/DocListItem/DocListItem";
import { alpha, makeStyles } from "@material-ui/core/styles";
import { Grid, Typography, InputBase, Button, Paper } from "@material-ui/core";
import CheckIcon from "@material-ui/icons/Check";
import SearchIcon from "@material-ui/icons/Search";
import { findDocsByName } from "./api";

import socketIoClient from "socket.io-client";
const socket = socketIoClient();

const useStyles = makeStyles((theme) => ({
  search: {
    position: "relative",
    borderRadius: theme.shape.borderRadius,
    backgroundColor: alpha(theme.palette.common.white, 0.15),
    "&:hover": {
      backgroundColor: alpha(theme.palette.common.white, 0.25),
    },
    marginRight: theme.spacing(2),
    marginLeft: 0,
    width: "100%",
    [theme.breakpoints.up("sm")]: {
      marginLeft: theme.spacing(3),
      width: "auto",
    },
  },
  searchIcon: {
    padding: theme.spacing(0, 2),
    height: "100%",
    position: "absolute",
    pointerEvents: "none",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  paper: {
    width: "100%",
    height: "max-content",
    padding: theme.spacing(2),
    backgroundColor: "#f9fafb",
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
  inputRoot: {
    color: "inherit",
    width: "100%",
  },
  inputInput: {
    padding: theme.spacing(1, 1, 1, 0),
    // vertical padding + font size from searchIcon
    paddingLeft: `calc(1em + ${theme.spacing(4)}px)`,
    transition: theme.transitions.create("width"),
    width: "100%",
  },
  container: {
    padding: theme.spacing(2),
  },
  resultContainer: {
    height: "100%",
  },
}));

const Home = (props) => {
  const classes = useStyles();
  const [title, setTitle] = useState("");
  const [docs, setDocs] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");

  const [searchInput, setSearchInput] = useState("");
  const [isFetchingDocs, setIsFetchingDocs] = useState(false);
  const [fetchResults, setFetchResults] = useState(null);
  const [requestsSent, setRequestsSent] = useState([]);

  const [loading, setLoading] = useState(true);

  const { currentUser } = useContext(AuthContext);

  //   console.log("currentUser =", currentUser);

  const history = useHistory();

  const clickHandler = async () => {
    async function createNewDoc() {
      try {
        const newDoc = await axios.post(
          "/api/docs",
          {
            name: title,
          },
          { withCredentials: true }
        );

        const docId = newDoc.data.data.doc._id;
        return docId;
      } catch (err) {
        setErrorMessage(err.response.data.message);
      }
    }

    const docId = await createNewDoc();

    if (docId) {
      const docIdString = `id=${docId}`;

      props.history.push({
        pathname: "/new",
        search: docIdString,
      });
    }
  };

  async function getAllDocs() {
    const docs = await axios.get("/api/docs");
    console.log("getAlldocs =", docs);

    setDocs(docs.data.data.docs);
    setLoading(false);
  }

  useEffect(() => {
    getAllDocs();
  }, []);

  const viewDocHandler = (id) => {
    const idString = `id=${id}`;

    props.history.push({
      pathname: "/view",
      search: idString,
    });
  };

  const deleteDocHandler = async (id) => {
    try {
      await axios.delete(`/api/docs/${id}`);

      // props.history.push({
      //     pathname: "/delete"
      // })

      getAllDocs();

      toast.error("Document Deleted!", {
        position: toast.POSITION.TOP_LEFT,
        autoClose: 2000,
      });
    } catch (err) {
      console.log(err);
    }
  };

  const manageDocumentHandler = (id, title, collaborators) => {
    history.push({
      pathname: "/manage",
      state: {
        id,
        title,
        collaborators,
      },
    });
  };

  const handleSearchDocs = async (value) => {
    if (!value) return;
    setIsFetchingDocs(true);
    try {
      const { docs } = await findDocsByName(value);
      const filteredDocs = docs.filter((doc) => {
        if (doc.owner === currentUser._id) return false;
        if (doc.collaborators.includes(currentUser._id)) return false;
        if (doc.viewers.includes(currentUser._id)) return false;
        return true;
      });
      setFetchResults(filteredDocs);
    } catch (error) {
      console.error(error);
    }
    setIsFetchingDocs(false);
  };

  async function handleSendAccessRequest(docId) {
    try {
      const response = await axios.post(
        `/api/users/notifications/requestAccess`,
        {
          docId,
        }
      );

      if (response.data.status === "success") {
        socket.emit("notification-sent", {
          notification: response.data.notification,
        });
        const requests = [...requestsSent, docId];
        setRequestsSent(requests);
      }
    } catch (err) {
      //console.log(err)
      setErrorMessage(err.response.data.message);
    }

    //console.log(result.data)
  }

  return (
    <>
      {loading === true ? (
        <div className='ui active dimmer'>
          <div className='ui large text loader'>Loading..</div>
        </div>
      ) : null}

      <Grid container className={classes.container}>
        <Grid item xs={12}>
          <Typography variant='h3'>RedactTogether</Typography>
        </Grid>
        <Grid item container xs={12}>
          <Grid item xs={4}>
            <Paper className={classes.paper}>
              <form
                className={classes.search}
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSearchDocs(searchInput);
                }}
              >
                <div className={classes.searchIcon}>
                  <SearchIcon />
                </div>
                <InputBase
                  placeholder='Search…'
                  classes={{
                    root: classes.inputRoot,
                    input: classes.inputInput,
                  }}
                  inputProps={{ "aria-label": "search" }}
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                />
              </form>
            </Paper>
            <Grid item container xs={12} className={classes.resultContainer}>
              <Paper className={classes.paper} style={{ height: "80%" }}>
                {fetchResults?.length === 0 && (
                  <Typography variant='h4' component='p' align='center'>
                    No results
                  </Typography>
                )}
                {fetchResults?.map((doc) => (
                  <Grid
                    container
                    justifyContent='space-between'
                    key={doc._id}
                    style={{
                      margin: "1rem 0",
                      backgroundColor: "#FFF",
                      padding: "0.5rem",
                    }}
                  >
                    <Typography variant='h4' component='span'>
                      {doc.name}
                    </Typography>
                    {!requestsSent.includes(doc._id) ? (
                      <Button
                        variant='contained'
                        onClick={() => handleSendAccessRequest(doc._id)}
                      >
                        Send Request
                      </Button>
                    ) : (
                      <CheckIcon />
                    )}
                  </Grid>
                ))}
              </Paper>
            </Grid>
          </Grid>
          <Grid item xs={8}>
            {loading === false ? (
              <div className='dashboard-container'>
                <div className='new-doc' style={{ padding: "0 50px 50px" }}>
                  <div className='ui placeholder segment'>
                    <div className='ui icon header'>
                      <i className='pdf file outline icon'></i>
                      <div className='ui form'>
                        <div className='field'>
                          <label>Title</label>
                          <input
                            type='text'
                            placeholder='Enter title of the document'
                            onChange={(e) => {
                              setTitle(e.target.value);
                            }}
                          />
                        </div>
                        {errorMessage !== "" && (
                          <div className='ui error message'>
                            <div className='header'>Action Forbidden</div>
                            <p>{errorMessage}</p>
                          </div>
                        )}

                        <div
                          className='ui submit button'
                          onClick={(e) => {
                            e.preventDefault();
                            clickHandler();
                          }}
                          disabled={!title}
                        >
                          Add Transcript
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}

            {loading === false ? (
              <div className='docs-list' style={{ padding: "50px" }}>
                <table className='ui fixed table'>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Role</th>
                      <th>Edit</th>
                      <th>Settings</th>
                      <th>Delete</th>
                    </tr>
                  </thead>
                  {docs.map((doc, index) => {
                    return (
                      <>
                        <DocListItem
                          key={index}
                          doc={doc}
                          currentUser={currentUser}
                          viewDocHandler={viewDocHandler}
                          manageDocumentHandler={manageDocumentHandler}
                          deleteDocHandler={deleteDocHandler}
                        />
                      </>
                    );
                  })}
                </table>
              </div>
            ) : null}
          </Grid>
        </Grid>
      </Grid>
    </>
  );
};

export default Home;
