const express = require("express");
const app = express();
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const path = require("path");
const socketio = require("socket.io");
const http = require("http");
const server = http.createServer(app);
const io = socketio(server);

const suggestionAcceptedModel = require("./models/suggestionAccepted");

dotenv.config({ path: "./config.env" });
const { MONGOURI, name, PORT } = require("./config/keys");

const docConnections = {};

io.on("connection", (socket) => {
  // console.log("User Connected...");
  socket.on("disconnect", function () {
    if (socket.docData) {
      console.log("user disconnect......");
      const arr = docConnections[socket.docData.docId];

      docConnections[socket.docData.docId] = arr.filter((user) => {
        return user._id !== socket.docData?.user?._id;
      });

      io.emit(socket.docData.docId, docConnections[socket.docData.docId]);
    }
  });

  socket.on("notification-sent", (data) => {
    io.emit("notification-received", data);
  });

  socket.on("notification-deleted-sent", (data) => {
    io.emit("notification-deleted-recieved", data);
  });

  socket.on("new-operations", (data) => {
    //console.log(data)
    io.emit("new-remote-operations", data);
  });

  socket.on("docConnection", (data) => {
    socket.docData = data;

    if (!docConnections[data.docId]) {
      docConnections[data.docId] = [{ ...data.user }];
    } else {
      if (
        !docConnections[data.docId].find((user) => user._id === data?.user?._id)
      ) {
        docConnections[data.docId].push(data.user);
      }
    }

    io.emit(data.docId, docConnections[data.docId]);
  });

  socket.on("docDeconnection", (data) => {
    // console.log("doc deconnection...........", data)
    const arr = docConnections[data.docId];

    if (arr) {
      docConnections[data.docId] = arr.filter((user) => {
        return user._id !== data.userId;
      });

      io.emit(data.docId, docConnections[data.docId]);
    }
  });

  socket.on("suggestionsAccepted", async (data, callback) => {
    try {
      await suggestionAcceptedModel.create({
        userId: data.userId,
        token: data.token,
        docId: data.docId,
      });
      console.log(
        "suggestion accepted =",
        `suggestionsAccepted-${data.userId}-${data.docId}`
      );
      io.emit(`suggestionsAccepted-${data.userId}-${data.docId}`, data.token);
      callback();
    } catch (err) {
      console.error(err);
    }
  });

  socket.on("updateComments", async (docId) => {
    console.log("updateComments =", docId);
    io.emit(`updateComments-${docId}`, "update");
  });
});

const {
  getAllDocs,
  createNewDocument,
  getSingleDoc,
  updateDoc,
  deleteDoc,
  doesDocExist,
  getSingleDocPopulated,
  searchDocsByName,
} = require("./controllers/docController");

const {
  deleteSuggestionAccepted,
} = require("./controllers/suggestionAcceptedController");

const {
  signup,
  login,
  protect,
  isOwnerOrCollaborator,
  isLoggedIn,
  logout,
  acceptRequest,
  isCollaborator,
  isOwner,
  createAccessNotification,
  getOwner,
  getNotifications,
  deleteNotification,
  getUser,
  removeCollaborator,
  doesNotificationExist,
  acceptViewerRequest,
  removeViewer,
} = require("./controllers/authController");

const {
  createNewComment,
  allCommentsByDocId,
  delteComment,
} = require("./controllers/commentController");

const {
  suggestionAcceptedByUserId,
} = require("./controllers/suggestionAcceptedController");



mongoose
  .connect(MONGOURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true,
  })
  .then(() => console.log("DB connection successful!"));

app.use(cookieParser());

app.use(express.json());

app.get("/api/docs", protect, getAllDocs);

app.post("/api/docs/search", protect, searchDocsByName);

app.get("/api/docs/:id", protect, isOwnerOrCollaborator, getSingleDoc);

app.get("/api/docs/populated/:id", protect, isOwner, getSingleDocPopulated);

app.post("/api/docs", protect, doesDocExist, createNewDocument);

app.post("/api/comments", protect, doesDocExist, createNewComment);

app.get("/api/comments/:id", protect, allCommentsByDocId);
app.delete("/api/comments/:id", protect, delteComment);
app.get(
  "/api/suggestions-accepted/:id/:docid",
  protect,
  suggestionAcceptedByUserId
);

app.patch(
  "/api/docs/:id",
  protect,
  isOwnerOrCollaborator,
  doesDocExist,
  updateDoc
);

app.patch(
  "/api/docs/:id/removeCollaborator",
  protect,
  isOwner,
  removeCollaborator
);
app.patch("/api/docs/:id/removeViewer", protect, isOwner, removeViewer);

app.delete("/api/docs/:id", protect, isOwner, deleteDoc);
app.delete(
  "/api/suggestion-accepted-waiting-comment/:id",
  deleteSuggestionAccepted
);

app.get("/api/docs/getOwner/:docId", protect, getOwner);

//app.post('/api/users/:userId/notifications/requestAccess', protect, createAccessNotification)
app.post("/api/users/signup", signup);

app.post("/api/users/login", login);

app.get("/api/users/getUser/:id", protect, getUser);

app.get("/api/users/isLoggedIn", isLoggedIn);

app.get("/api/users/logout", logout);

app.post(
  "/api/users/notifications/requestAccess",
  protect,
  doesNotificationExist,
  createAccessNotification
);

app.get("/api/users/notifications", protect, getNotifications);

app.post("/api/users/:docId", protect, acceptRequest);

app.post("/api/users/viewers/:docId", protect, acceptViewerRequest);

app.delete("/api/notifications/:id", protect, deleteNotification);

if (process.env.NODE_ENV === "production") {
  app.use(express.static("client/build"));

  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "client", "build", "index.html"));
  });
}



// const port = process.env.PORT || 8000;
server.listen(PORT, () => {
  console.log(`server started at port: ${PORT}`);
  console.log(`server running in ${name}`);
});
