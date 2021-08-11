import React from "react";

import { deleteComment } from "../api";

import {
  DialogTitle,
  Dialog,
  Typography,
  Grid,
  Button,
  DialogContent,
  DialogContentText,
  DialogActions,
  Paper,
} from "@material-ui/core";
import CheckIcon from "@material-ui/icons/Check";

import socketIoClient from "socket.io-client";
const socket = socketIoClient();

export const ModalShowComment = ({
  docId,
  isOwner,
  open,
  handleClose,
  value,
  selectedComment,
}) => {
  let changes = value
    .map((parent) => parent.children.filter((n) => n.token === selectedComment))
    .flat(Infinity);

  console.log("changes =", changes);
  const handleDeleteComment = () => {
    deleteComment(selectedComment).then(() => {
      socket.emit("updateComments", docId);
      handleClose();
    });
  };
  return (
    <div
      style={{
        width: "300px",
        position: "fixed",
        top: 100,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 100,
      }}
    >
      <Paper>
        {changes.length > 0 && (
          <>
            <DialogTitle id='alert-dialog-title'>
              <Typography variant='body1' component='p' align='center'>
                Participant's Approval.{" "}
                <CheckIcon htmlColor='#42FF00' fontSize='large' />
              </Typography>
              <Typography variant='body1' component='p' align='center'>
                changed on
              </Typography>
              <Typography variant='body1' component='p' align='center'>
                {changes[0]?.date &&
                  new Date(changes[0].date).toLocaleDateString()}
                ,{" "}
                {changes[0]?.date &&
                  new Date(changes[0].date).toLocaleTimeString()}
              </Typography>
              <Typography variant='body1' component='p' align='center'>
                by {changes[0]?.username}
              </Typography>
            </DialogTitle>
            <DialogContent>
              <DialogContentText id='alert-dialog-description'>
                {changes.map((change) => {
                  switch (change.suggestType) {
                    case "suggest-insertion":
                      return (
                        <Grid item sm={12} key={change.nodeId}>
                          <Typography variant='body1' component='span'>
                            Added:{" "}
                          </Typography>
                          <Typography variant='body1' component='span'>
                            {change.text}
                          </Typography>
                        </Grid>
                      );
                    case "suggest-deletion":
                      return (
                        <Grid item sm={12} key={change.nodeId}>
                          <Typography variant='body1' component='span'>
                            Deleted something
                          </Typography>
                        </Grid>
                      );
                    case "suggest-replacement":
                      if (change.typeOfReplacement === "delete") {
                        return (
                            <Grid item key={change.nodeId}>
                             <Typography variant='body1' component='span'>
                               Replaced something
                             </Typography>
                           </Grid>
                        );
                      } else {
                        return (
                          <Grid item key={change.nodeId}>
                            <Typography variant='body1' component='span'>
                              {" "}
                              By adding:{" "}
                            </Typography>
                            <Typography variant='body1' component='span'>
                              {change.text}
                            </Typography>
                          </Grid>
                        );
                      }

                    default:
                      return <Typography>{change.text} </Typography>;
                  }
                })}
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleClose} color='primary'>
                close
              </Button>
            </DialogActions>
          </>
        )}
        {changes && changes.length === 0 && (
          <>
            <DialogContent>
              <DialogContentText>
                {isOwner
                  ? "This comment is no longer attached to any change. do you want to remove it?"
                  : "This comment is no longer attached to any change. please ask the document owner to delete it"}
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              {isOwner && (
                <Button onClick={handleDeleteComment} color='primary'>
                  delete
                </Button>
              )}
              <Button onClick={() => handleClose(false)} color='primary'>
                {isOwner ? "cancel" : "close"}
              </Button>
            </DialogActions>
          </>
        )}
      </Paper>
    </div>
  );
};
