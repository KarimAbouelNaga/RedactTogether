import React, {
  useContext,
  useEffect,
  useState,
  useRef,
  useCallback,
} from "react";
import { v4 as uuidv4 } from "uuid";
import {
  getUserData,
  getDocById,
  saveDoc,
  getComments,
  getSuggestionsAccepted,
  deletSuggestionAcceptedWaitingComment,
} from "../api";
import "./SlateEditor.css";
import AuthContext from "../context/AuthContext";
import { Redirect } from "react-router";

import { EmailShareButton } from "react-share";
import Button from '@material-ui/core/Button';
import InfoIcon from '@material-ui/icons/Info';
import MailOutlineIcon from '@material-ui/icons/MailOutline';


import {
  EditorCollaborator,
  EditorOwner,
  EditorViewer,
  EditorSuggester,
} from "./Editors";

import { Grid, Avatar, Typography, Paper } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { ToolBar } from "./ToolBar";

import socketIoClient from "socket.io-client";
const socket = socketIoClient();

const useStyles = makeStyles((theme) => ({
  sticky: {
    position: "sticky",
    top: 80,
    height: "100%",
  },
}));

const SlateEditor = (props) => {
  const classes = useStyles();
  const queryParams = new URLSearchParams(props.location.search);
  const docId = queryParams.get("id");

  const [doc, setDoc] = useState({});
  const [usersOnDoc, setUsersOnDoc] = useState([]);

  const [idStatus, setIdStatus] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [errorStatus, setErrorStatus] = useState("");
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  const [toolbarState, setToolbarState] = useState({
    isSuggesting: false,
    isCommenting: false,
  });
  const [suggestionToken, setSuggestionToken] = useState(null);
  const [suggestionAcceptedToken, setSuggestionAcceptedToken] = useState(null);
  const [isWaitingComment, setIsWaitingComment] = useState(null);

  const [comments, setComments] = useState([]);
  const [selectedComment, setSelectedComment] = useState(null);

  const [saved, setSaved] = useState();

  const editorOwnerId = useRef(uuidv4());
  const editorCollaboratorId = useRef(uuidv4());

  const { loggedIn } = useContext(AuthContext);

  const { content: value = [], name: title = "", owner: ownerId } = doc;
  const setValue = (value) => setDoc({ ...doc, content: value });

  const { isSuggesting } = toolbarState;

  const isOwner = userData?._id && userData?._id === doc?.owner;

  const isCollaborator =
    userData?._id && doc.collaborators?.includes(userData._id)
      ? userData._id
      : null;

  const isViewer =
    userData?._id && doc.viewers?.includes(userData._id) ? userData._id : null;

  const isWaitingCommentToken = isWaitingComment?.[0]?.token;
  const userId = userData?._id;
  useEffect(() => {
    if (!suggestionAcceptedToken || !userId) return;
    if (suggestionAcceptedToken === isWaitingCommentToken) return;
    console.log(
      "isWaitComment useEffect ......................................",
      suggestionAcceptedToken,
      isWaitingCommentToken
    );
    const comments = value
      .map((parent) =>
        parent.children.filter((node) => {
          return (
            node.accepted &&
            !node.validate &&
            node.userId === userId &&
            node.token === suggestionAcceptedToken
          );
        })
      )
      .flat(Infinity);
    comments.length && setIsWaitingComment(comments);
  }, [isWaitingCommentToken, suggestionAcceptedToken, userId, value]);

  const removeWaitingComment = (token) => {
    console.log("iswaiting comment =", isWaitingComment);
    const comments = isWaitingComment.filter(
      (comment) => comment.token !== token
    );
    console.log("comments =", comments, "token =", token);
    deletSuggestionAcceptedWaitingComment(token)
      .then(() => {
        setSuggestionAcceptedToken(null);
        setIsWaitingComment(comments);

        getSuggestionsAccepted(userId, docId)
          .then((data) => {
            setSuggestionAcceptedToken(data?.[0]?.token);
          })
          .catch(console.error);
      })
      .catch(console.error);
  };

  useEffect(() => {
    if (!userId) return;

    getSuggestionsAccepted(userId, docId)
      .then((data) => {
        setSuggestionAcceptedToken(data?.[0]?.token);
        console.log(
          " get suggestions accepted  use effect ..........................;",
          data?.[0]?.token
        );
      })
      .catch(console.error);
  }, [userId, docId]);

  useEffect(() => {
    if (!userId) {
      getUserData()
        .then((user) => {
          setUserData(user);
          setLoading(false);
          socket.emit("docConnection", { docId, user });
          socket.on(docId, (data) => {
            setUsersOnDoc(data);
          });

          console.log(
            "suggestion accepted =",
            `suggestionsAccepted-${user._id}-${docId}`
          );

          socket.on(`suggestionsAccepted-${user._id}-${docId}`, (token) => {
            console.log(
              "set suggestion accepted token.......................................",
              token
            );
            setSuggestionAcceptedToken(token);
          });
        })
        .catch(console.error);
    }

    return () => {
      if (userId) {
        socket.emit("docDeconnection", { docId, userId: userId });
      }
    };
  }, [docId, userId]);

  useEffect(() => {
    if (!loggedIn) {
      return;
    }
    if (!docId) {
      setIdStatus("false");
    } else if (!doc.name) {
      getDocById(docId)
        .then((res) => {
          console.log("doc =", res.data.doc);
          setDoc(res.data.doc);
          setSaved(true);
        })
        .catch((err) => {
          setErrorStatus(err.response?.status);
          setErrorMessage(err.response?.data.message);
        });
    }
  }, [doc.name, docId, loggedIn]);

  useEffect(() => {
    async function fetchComments() {
      try {
        const comments = await getComments(docId);
        setComments(comments);
      } catch (error) {
        console.error(error);
      }
    }
    fetchComments();
    socket.on(`updateComments-${docId}`, () => {
      fetchComments();
    });
    return socket.off("updateComments");
  }, [docId]);

  useEffect(() => {
    socket.on("updateComments", () => {
      getComments(docId)
        .then((data) => setComments(data))
        .catch(console.error);
    });
  }, [docId]);

  const saveDocHandler = (value) => {
    saveDoc(docId, value)
      .then(() => {
        setSaved(true);
      })
      .catch((err) => {
        setErrorStatus(err.response.status);
        setErrorMessage(err.response.data.message);
      });
  };

  const handleIsSuggesting = (value) => {
    setToolbarState({ ...toolbarState, isSuggesting: !value });
    if (!value) {
      setSuggestionToken(uuidv4());
    }
  };

  console.log({ isViewer, isOwner, isSuggesting, isCollaborator });

  return (
    <>
      <div className='ui container'>
        <div className='ui horizontal segments'>
          <div className='ui segment'>
            <EmailShareButton
              title='E-Doc access link.'
              body={`Let's work on this Transcript!  \n www.RedactTogether.com/view?id=${docId}`}
            >
              <Button
                  size="medium"
                  variant="contained"
                  color="default"
                  className={classes.button}
                  startIcon={<MailOutlineIcon/>}
              >
                Invite to this Transcript
              </Button>
            </EmailShareButton>

            <Button
                style={{marginLeft: '63%'}}
                size="medium"
                variant="contained"
                color="default"
                className={classes.button}
                startIcon={<InfoIcon />}
            >
              Information
            </Button>
          </div>
        </div>
      </div>
      {loading === true ? (
        <div className='ui active dimmer'>
          <div className='ui large text loader'>Loading..</div>
        </div>
      ) : null}
      <Grid
        container
        spacing={2}
        justify='center'
        style={{ position: "relative" }}
      >
        <Grid item xs={7}>
          {loggedIn &&
          errorMessage === "You are not authorised to access this document!" ? (
            <Redirect
              to={{
                pathname: "/permission",
                state: { message: errorMessage, docId },
              }}
            />
          ) : (
            console.log("first condition")
          )}

          {loggedIn &&
          errorMessage !== "You are not authorised to access this document!" &&
          errorMessage !== "" ? (
            <Redirect
              to={{
                pathname: "/error",
                state: { message: errorMessage, statusCode: errorStatus },
              }}
            />
          ) : (
            console.log("condition 2")
          )}

          {loggedIn && idStatus === "false" ? <Redirect to='/' /> : null}

          {loggedIn ? null : <Redirect to='/login' />}

          {isOwner && !isSuggesting && (
            <EditorOwner
              value={value}
              setValue={setValue}
              saved={saved}
              setSaved={setSaved}
              docId={docId}
              userData={userData}
              id={editorOwnerId}
              saveDocHandler={saveDocHandler}
              title={title}
              suggestionAcceptedToken={suggestionAcceptedToken}
              selectedComment={selectedComment}
              resetSelectedComment={() => setSelectedComment(null)}
            />
          )}
          {isCollaborator && !isSuggesting && (
            <EditorCollaborator
              isSuggesting={isSuggesting}
              suggestionToken={suggestionToken}
              value={value}
              setValue={setValue}
              saved={saved}
              setSaved={setSaved}
              docId={docId}
              userData={userData}
              id={editorCollaboratorId}
              saveDocHandler={saveDocHandler}
              title={title}
              ownerId={ownerId}
              suggestionAcceptedToken={suggestionAcceptedToken}
              selectedComment={selectedComment}
              resetSelectedComment={() => setSelectedComment(null)}
            />
          )}
          {isSuggesting && (
            <EditorSuggester
              isOwner={isOwner}
              isSuggesting={isSuggesting}
              suggestionToken={suggestionToken}
              value={value}
              setValue={setValue}
              saved={saved}
              setSaved={setSaved}
              docId={docId}
              userData={userData}
              id={editorCollaboratorId}
              saveDocHandler={saveDocHandler}
              title={title}
              ownerId={ownerId}
              selectedComment={selectedComment}
              resetSelectedComment={() => setSelectedComment(null)}
            />
          )}
          {isViewer && (
            <EditorViewer
              userData={userData}
              value={value}
              saved={saved}
              title={title}
              ownerId={ownerId}
              selectedComment={selectedComment}
              resetSelectedComment={() => setSelectedComment(null)}
            />
          )}
        </Grid>
        <Grid item container xs={4} className={classes.sticky}>
          <Grid item xs={7}>
            <Paper
              style={{
                width: "100%",
                minHeight: "50vh",
                padding: "1rem",
                backgroundColor: "#f9fafb",
              }}
            >
              <Typography
                variant='h5'
                component='p'
                align='center'
                style={{ borderBottom: "1px solid black" }}
              >
                Changelog
              </Typography>
              {comments.map((comment) => (
                <Grid
                  container
                  justifyContent='space-between'
                  key={comment._id}
                  className='hover'
                  style={{
                    margin: ".5rem 0",
                    backgroundColor: "#FFF",
                    padding: "0.5rem",
                    cursor: "pointer",
                  }}
                  onClick={() => {
                    setSelectedComment(comment.token);
                  }}
                >
                  <Typography variant='body1' component='span'>
                    {comment.comment}
                  </Typography>
                </Grid>
              ))}
            </Paper>
          </Grid>
          <Grid item xs={5} style={{ padding: "1rem" }}>
            <Grid container style={{ marginBottom: "1rem" }}>
              {usersOnDoc.map((user) => (
                <Avatar
                  item
                  key={user._id}
                  style={{
                    backgroundColor: user._id === doc.owner ? "blue" : "green",
                    margin: "0 2px",
                  }}
                >
                  {user?.username?.[0]?.toUpperCase()}
                </Avatar>
              ))}
            </Grid>
            {!isViewer && (
              <ToolBar
                isSuggesting={isSuggesting}
                handleIsSuggesting={handleIsSuggesting}
                isWaitingComment={isWaitingComment}
                docId={docId}
                userId={userId}
                removeWaitingComment={removeWaitingComment}
              />
            )}
          </Grid>
        </Grid>
      </Grid>
    </>
  );
};

export default SlateEditor;
