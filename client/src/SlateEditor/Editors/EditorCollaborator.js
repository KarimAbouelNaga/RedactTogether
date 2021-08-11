import { useMemo, useEffect, useState, useCallback } from "react";
// import { withCollaborator } from "../../plugins/withCollaborator";
import { Slate, Editable, withReact } from "slate-react";
import { EditorHeader } from "../EditorHeader";
import Elements from "../Elements";
import socketIoClient from "socket.io-client";

import { createEditor, Editor } from "slate";
import EditorToolBar from "../EditorToolBar";
import Leaf from "../Leaf";
import { ModalAcceptReject } from "../ModalAcceptReject";
import { ModalShowComment } from "../ModalShowComment";

const socket = socketIoClient();

export const EditorCollaborator = ({
  docId,
  userData,
  value,
  id,
  setValue,
  saved,
  setSaved,
  saveDocHandler,
  title,
  ownerId,
  selectedComment,
  resetSelectedComment,
}) => {
  const [timer, setTimer] = useState();
  const [open, setOpen] = useState(false);
  const [clickedLeafToken, setClickedLeafToken] = useState(null);

  const [openComment, setOpenComment] = useState(false);

  const renderElement = useCallback((props) => {
    if (props.element.type === "heading-one") {
      return <Elements {...props} />;
    }
    if (props.element.type === "heading-two") {
      return <Elements {...props} />;
    } else {
      return <Elements {...props} />;
    }
  }, []);

  const currentUserId = userData._id;
  const handleOpenModal = useCallback((token) => {
    setOpen(true);
    setClickedLeafToken(token);
  }, []);

  const renderLeaf = useCallback(
    (props) => {
      return (
        <Leaf
          {...props}
          currentUserId={currentUserId}
          ownerId={ownerId}
          handleOpenModal={handleOpenModal}
          selectedComment={selectedComment}
        />
      );
    },
    [currentUserId, handleOpenModal, selectedComment, ownerId]
  );

  const editor = useMemo(() => withReact(createEditor()), []);
  editor.user = userData;

  useEffect(() => {
    if (!docId || !editor?.user?._id) {
      return;
    }
    console.log("set socket ...........", editor.user);
    const listener = ({ editorId, operations, documentId }) => {
      if (editorId !== id.current && documentId === docId) {
        Editor.withoutNormalizing(editor, () => {
          operations.forEach((operation) => {
            if (editor !== null) {
              editor.apply(operation);
            } else {
              console.log("its null!");
            }
          });
        });
      }
    };
    socket.on("new-remote-operations", listener);
    return () => {
      socket.off("new-remote-operations", listener);
    };
  }, [docId, editor, id]);

  useEffect(() => {
    if (selectedComment) {
      setOpenComment(true);
    }
  }, [selectedComment]);

  return (
    <>
      <EditorHeader
        title={title}
        value={value}
        saveDocHandler={saveDocHandler}
        saved={saved}
      />
      <Slate
        editor={editor}
        value={value}
        onChange={(value) => {
          console.log(value);
          setValue(value);
          //setSaved(false)

          if (timer) {
            window.clearTimeout(timer);
          }

          setTimer(
            setTimeout(() => {
              //console.log("done")
              saveDocHandler(value);
            }, 1000 * 2)
          );

          console.log("editor operations =", editor.operations);
          editor.operations.forEach((operation) => {
            if (
              operation.type !== "set_selection" &&
              operation.type !== "set_value"
            ) {
              //console.log("performed")
              const saveState = () => {
                if (saved) {
                  setSaved(false);
                  //console.log("saved: false")
                }
              };

              saveState();
            }
          });

          const filterOps = editor.operations
            .filter((o) => {
              // console.log(o)
              if (o === null) {
                //console.log("this was null")
                return false;
              }

              const is_sourced = o.data != null && "source" in o.data;
              return (
                o.type !== "set_selection" &&
                o.type !== "set_value" &&
                !is_sourced
              );
            })
            .map((o) => ({ ...o, data: { source: "one" } }));

          //console.log(filterOps)
          if (filterOps.length > 0) {
            socket.emit("new-operations", {
              editorId: id.current,
              operations: filterOps,
              documentId: docId,
            });
          }
        }}
      >
        <EditorToolBar />
        <ModalAcceptReject
          open={open}
          value={value}
          handleClose={() => setOpen(false)}
          clickedLeafToken={clickedLeafToken}
          docId={docId}
        />
        {openComment && (
          <ModalShowComment
            open={openComment}
            value={value}
            handleClose={() => {
              setOpenComment(false);
              resetSelectedComment();
            }}
            selectedComment={selectedComment}
          />
        )}

        <Editable
          readOnly
          renderElement={renderElement}
          renderLeaf={renderLeaf}
        />
      </Slate>
    </>
  );
};
