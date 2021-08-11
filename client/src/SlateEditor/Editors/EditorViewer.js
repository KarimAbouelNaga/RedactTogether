import { useMemo, useCallback, useState, useEffect } from "react";
import { Slate, Editable, withReact } from "slate-react";
import { EditorHeader } from "../EditorHeader";
import Elements from "../Elements";

import { createEditor } from "slate";
import EditorToolBar from "../EditorToolBar";
import Leaf from "../LeafViewer";
import { ModalShowComment } from "../ModalShowComment";

export const EditorViewer = ({
  userData,
  value,
  saved,
  title,
  handleOpenModal,
  ownerId,
  selectedComment,
  resetSelectedComment,
}) => {
  const [openComment, setOpenComment] = useState(false);

  useEffect(() => {
    if (selectedComment) {
      setOpenComment(true);
    }
  }, [selectedComment]);

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

  const currentUserId = userData?._id;

  const renderLeaf = useCallback(
    (props) => {
      return (
        <Leaf
          {...props}
          currentUserId={currentUserId}
          handleOpenModal={handleOpenModal}
          ownerId={ownerId}
          selectedComment={selectedComment}
        />
      );
    },
    [currentUserId, handleOpenModal, ownerId, selectedComment]
  );

  const editor = useMemo(() => withReact(createEditor()), []);

  return (
    <>
      <EditorHeader
        title={title}
        value={value}
        saveDocHandler={() => {}}
        saved={saved}
      />
      <Slate editor={editor} value={value} onChange={() => {}}>
        <EditorToolBar />
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
