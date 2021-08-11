import React, { useState } from "react";
import { Transforms } from "slate";
import { useEditor } from "slate-react";
import { makeStyles } from "@material-ui/core/styles";
import {
  DialogTitle,
  Dialog,
  DialogContent,
  DialogActions,
  DialogContentText,
  Typography,
  Grid,
  Button,
} from "@material-ui/core";
import socketIoClient from "socket.io-client";

const socket = socketIoClient();

const useStyles = makeStyles((theme) => ({
  paper: {
    width: 400,
  },
}));

export const ModalAcceptReject = ({
  open,
  handleClose,
  value,
  clickedLeafToken,
  docId,
}) => {
  const classes = useStyles();
  const [disableButtons, setDisableButtons] = useState(false);
  const editor = useEditor();
  const changes = value
    .map((parent, parentIndex) =>
      parent.children.filter(
        (n) =>
          n.token === clickedLeafToken &&
          [
            "suggest-insertion",
            "suggest-deletion",
            "suggest-replacement",
          ].includes(n.suggestType)
      )
    )
    .flat(Infinity);

  console.log("changes =", changes);
  const handleReject = (token) => {
    console.log("handleReject token =", token);
    if (!token) return;
    Transforms.removeNodes(editor, {
      at: [],
      match: (node, path) =>
        node.token === token &&
        (node.suggestType === "suggest-insertion" ||
          (node.suggestType === "suggest-replacement" &&
            node.typeOfReplacement === "add")),
    });
    Transforms.unsetNodes(
      editor,
      ["suggestType", "userId", "username", "token", "nodeId", "date"],
      {
        at: [],
        match: (node, path) =>
          node.token === token &&
          (node.suggestType === "suggest-deletion" ||
            (node.suggestType === "suggest-replacement" &&
              node.typeOfReplacement === "delete")),
      }
    );
  };
  const handleAccept = (token, userId, docId) => {
    socket.emit("suggestionsAccepted", { token, userId, docId }, () => {
      Transforms.setNodes(
        editor,
        { accepted: true },
        {
          at: [],
          match: (node, path) => node.token === token,
        }
      );
      handleClose();
    });
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      aria-labelledby='alert-dialog-title'
      aria-describedby='alert-dialog-description'
      BackdropProps={{
        style: {
          background: "transparent",
        },
      }}
    >
      <DialogTitle id='alert-dialog-title'>
        {changes[0]?.username}
        <br />
        {changes[0]?.date &&
          new Date(changes[0].date).toLocaleDateString()},{" "}
        {changes[0]?.date && new Date(changes[0].date).toLocaleTimeString()}
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
                      Deleted:{" "}
                    </Typography>
                    <Typography variant='body1' component='span'>
                      {change.text}
                    </Typography>
                  </Grid>
                );
              case "suggest-replacement":
                if (change.typeOfReplacement === "delete") {
                  return (
                    <Grid item key={change.nodeId}>
                      <Typography variant='body1' component='span'>
                        Replaced:{" "}
                      </Typography>
                      <Typography variant='body1' component='span'>
                        {change.text}
                      </Typography>
                    </Grid>
                  );
                } else {
                  return (
                    <Grid item key={change.nodeId}>
                      <Typography variant='body1' component='span'>
                        {" "}
                        with:{" "}
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
        <Button
          disabled={disableButtons}
          onClick={() =>
            handleAccept(changes?.[0]?.token, changes?.[0]?.userId, docId)
          }
          color='primary'
        >
          Accpet
        </Button>
        <Button
          disabled={disableButtons}
          onClick={() => handleReject(changes?.[0]?.token)}
          color='primary'
          autoFocus
        >
          Reject
        </Button>
      </DialogActions>
    </Dialog>
  );
};
