import { makeStyles } from "@material-ui/core/styles";
import clsx from "clsx";

const useStyles = makeStyles({
  deletionCollaborator: {
    textDecoration: "line-through",
    color: "green",
  },
  deletionOwner: {
    textDecoration: "line-through",
    color: "blue",
  },
  insertionCollaborator: {
    color: "green",
  },
  insertionOwner: {
    color: "blue",
  },
  bold: {
    fontWeight: "bold",
  },
  italic: {
    fontStyle: "italic",
  },
  uppercase: {
    textTransform: "uppercase",
  },
  lowercase: {
    lowercase: "lowercase",
  },
  underline: {
    textDecoration: "underline",
  },
  cursor: {
    cursor: "pointer",
  },
  comment: {
    background: "yellow",
  },
});
const Leaf = ({
  attributes,
  children,
  leaf,
  ownerId,
  currentUserId,
  handleOpenModal,
  selectedComment,
}) => {
  const isOwnerOfSuggestion = currentUserId === leaf.userId; // is the suggestion is made by the current user of the document
  const isOwnerOfDocument = ownerId === leaf.userId; // is the suggedtion is made by the owner of the document
  // console.log({
  //   isOwnerOfSuggestion,
  //   isOwnerOfDocument,
  //   currentUserId,
  //   userLeaf: leaf.userId,
  //   username: leaf.username,
  // });
  const classes = useStyles();

  if (leaf.code) {
    children = (
      <code
        style={{
          width: "fit-content",
          height: "fit-content",
          background: "#eee",
        }}
      >
        {children}
      </code>
    );
  }
  const className =
    !leaf.accepted &&
    clsx(
      leaf.suggestType === "suggest-deletion" ||
        (leaf.suggestType === "suggest-replacement" &&
          leaf.typeOfReplacement === "delete")
        ? !isOwnerOfDocument
          ? classes.deletionCollaborator
          : classes.deletionOwner
        : "",

      leaf.suggestType === "suggest-insertion" ||
        (leaf.suggestType === "suggest-replacement" &&
          leaf.typeOfReplacement === "add")
        ? !isOwnerOfDocument
          ? classes.insertionCollaborator
          : classes.insertionOwner
        : "",
      (leaf.suggestType === "suggest-deletion" ||
        leaf.suggestType === "suggest-insertion" ||
        leaf.suggestType === "suggest-replacement") &&
        !isOwnerOfSuggestion &&
        classes.cursor,

      leaf.bold && classes.bold,
      leaf.italic && classes.italic,
      leaf.uppercase && classes.uppercase,
      leaf.lowercase && classes.lowercase,
      leaf.underline && classes.underline
    );

  const classNameComment =
    selectedComment && leaf.token === selectedComment && classes.comment;

  if (
    leaf.accepted &&
    (leaf.suggestType === "suggest-deletion" ||
      (leaf.suggestType === "suggest-replacement" &&
        leaf.typeOfReplacement === "delete"))
  ) {
    return null;
  }

  return (
    <span
      {...attributes}
      className={clsx(className, classNameComment)}
      onClick={() => {
        if (
          !isOwnerOfSuggestion &&
          [
            "suggest-insertion",
            "suggest-deletion",
            "suggest-replacement",
          ].includes(leaf.suggestType) &&
          !leaf.accepted
        ) {
          handleOpenModal(leaf.token);
        }
      }}
    >
      {children}
    </span>
  );
};

export default Leaf;
