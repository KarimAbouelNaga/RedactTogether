import { useMemo, useEffect, useState, useCallback } from "react";
import { withOwner } from "../../plugins/withOwner";
import { Slate, Editable, withReact } from "slate-react";
import { EditorHeader } from "../EditorHeader";
import Elements from "../Elements";

import { createEditor, Editor } from "slate";
import EditorToolBar from "../EditorToolBar";
import Leaf from "../Leaf";
import { ModalAcceptReject } from "../ModalAcceptReject";
import { ModalShowComment } from "../ModalShowComment";

import socketIoClient from "socket.io-client";
const socket = socketIoClient();

export const EditorOwner = ({
  docId,
  userData,
  value,
  id,
  setValue,
  saved,
  setSaved,
  saveDocHandler,
  title,
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
          ownerId={currentUserId}
          handleOpenModal={handleOpenModal}
          selectedComment={selectedComment}
        />
      );
    },
    [handleOpenModal, currentUserId, selectedComment]
  );

  const editor = useMemo(() => withOwner(withReact(createEditor())), []);
  editor.user = userData;

  useEffect(() => {
    if (selectedComment) {
      setOpenComment(true);
    }
  }, [selectedComment]);

  useEffect(() => {
    if (!docId || !editor?.user?._id) {
      return;
    }

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
            isOwner
            open={openComment}
            value={value}
            handleClose={() => {
              setOpenComment(false);
              resetSelectedComment();
            }}
            selectedComment={selectedComment}
            docId={docId}
          />
        )}
        <Editable
          renderElement={renderElement}
          renderLeaf={renderLeaf}
          onKeyDown={(event) => {
            if (!event.ctrlKey) {
              return;
            }

            switch (event.key) {
              case "b":
                event.preventDefault();
                toggleMark(editor, "bold");
                break;

              case "i":
                event.preventDefault();
                toggleMark(editor, "italic");
                break;

              case "u":
                event.preventDefault();
                toggleMark(editor, "underline");
                break;

              case "`":
                event.preventDefault();
                toggleMark(editor, "code");
                break;

              default:
                break;
            }
          }}
        />
      </Slate>
    </>
  );
};

const isMarkActive = (editor, format) => {
  let marks = Editor.marks(editor);
  let returnValue = marks ? marks[format] === true : false;
  return returnValue;
};

const toggleMark = (editor, format) => {
  const isActive = isMarkActive(editor, format);

  if (isActive) {
    Editor.removeMark(editor, format);
  } else {
    Editor.addMark(editor, format, true);
  }
};
