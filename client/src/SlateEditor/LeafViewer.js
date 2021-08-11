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
const Leaf = ({ attributes, children, leaf, selectedComment }) => {
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

  if (
    !leaf.accepted &&
    ["suggest-deletion", "suggest-replacement", "suggest-insertion"].includes(
      leaf.suggestType
    )
  ) {
    return null;
  }

  return (
    <span {...attributes} className={clsx(className, classNameComment)}>
      {children}
    </span>
  );
};

export default Leaf;
