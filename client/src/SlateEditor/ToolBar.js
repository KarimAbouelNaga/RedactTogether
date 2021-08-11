import React, { useState } from "react";
import { saveComment } from "../api";
import {
  Grid,
  IconButton,
  Dialog,
  DialogTitle,
  TextField,
  Typography,
  Button,
  DialogActions,
  DialogContent,
  DialogContentText,
  Paper,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";

import { ArrowUpward, ArrowDownward, Comment, Edit} from "@material-ui/icons";
import InfoIcon from '@material-ui/icons/Info';
import AudiotrackIcon from '@material-ui/icons/Audiotrack';

import socketIoClient from "socket.io-client";
const socket = socketIoClient();

const useStyles = makeStyles((theme) => ({
  active: {
    background: "blue",
    "&:hover": {
      background: "blue",
    },
  },
}));

export const ToolBar = ({
  isSuggesting,
  handleIsSuggesting,
  isWaitingComment,
  docId,
  userId,
  removeWaitingComment,
}) => {
  const classes = useStyles();
  const [open, setOpen] = useState(false);
  const [textFieldValue, setTextFieldValue] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  console.log("open =", open);
  return (
    <>
      <Paper
        style={{ width: "max-content", padding: ".5rem", marginLeft: "auto" }}
      >
        <Grid item container direction='column'>
          <IconButton
            className={isSuggesting ? classes.active : ""}
            onClick={() => handleIsSuggesting(isSuggesting)}
          >
            <Edit />
          </IconButton>
          <IconButton>
            <ArrowUpward />
          </IconButton>
          <IconButton>
            <ArrowDownward />
          </IconButton>
          <IconButton
            className={isWaitingComment?.length ? classes.active : ""}
            onClick={() => {
              console.log("onclick is waiting comment", isWaitingComment);
              if (isWaitingComment?.length) {
                setOpen(true);
              }
            }}
          >
            <Comment />
          </IconButton>
          <IconButton>
              <AudiotrackIcon/>
          </IconButton>
        </Grid>
      </Paper>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        aria-labelledby='form-dialog-title'
        BackdropProps={{
          style: {
            background: "transparent",
          },
        }}
      >
        <DialogTitle id='form-dialog-title'>Add Comment</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {isWaitingComment?.map((change) => {
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
          <form
            id='my-form'
            onSubmit={(e) => {
              e.preventDefault();
              setIsSubmitting(true);
              saveComment({
                docId,
                userId,
                comment: textFieldValue,
                token: isWaitingComment?.[0].token,
              })
                .then(() => {
                  socket.emit("updateComments", docId);
                  setIsSubmitting(false);
                  setTextFieldValue("");
                  setOpen(false);
                  removeWaitingComment(isWaitingComment?.[0].token);
                })
                .catch(console.error);
            }}
          >
            <TextField
              autoFocus
              margin='dense'
              id='name'
              fullWidth
              value={textFieldValue}
              onChange={(e) => setTextFieldValue(e.target.value)}
            />
          </form>
        </DialogContent>
        <DialogActions>
          <Button
            disabled={isSubmitting}
            type='submit'
            color='primary'
            form='my-form'
          >
            Comment
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
