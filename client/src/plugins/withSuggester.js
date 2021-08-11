import { Editor, Transforms, Node } from "slate";
import { v4 as uuidv4 } from "uuid";

export const withSuggester = (editor, suggestionToken) => {
  console.log("withcollaborator suggestionToken =", suggestionToken);
  const { deleteBackward, deleteFragment, insertText, insertNode } = editor;

  editor.deleteFragment = (...args) => {
    console.log("delete fragemnt");
    const focusPath = editor.selection.focus.path;
    const nodeFocus = Node.get(editor, focusPath);
    for (const [node, path] of Editor.nodes(editor, {
      at: editor.selection,
    })) {
      if ("text" in node && node.suggestType !== nodeFocus.suggestType) {
        console.log(node.suggestType, "is different", nodeFocus.suggestType);
        return;
      }
    }

    if (
      !nodeFocus.accepted &&
      (nodeFocus.suggestType === "suggest-insertion" ||
        nodeFocus.suggestType === "suggest-replacement") &&
      editor.user._id === nodeFocus.userId
    ) {
      deleteFragment(...args);
    } else {
      const selectedText = Editor.string(editor, editor.selection);

      insertNode({
        text: selectedText,
        suggestType: "suggest-deletion",
        userId: editor.user._id,
        username: editor.user.username,
        token: suggestionToken,
        nodeId: uuidv4(),
        date: Date.now(),
      });
    }
  };

  editor.deleteBackward = () => {
    const path = editor.selection.focus.path;
    const node = Node.get(editor, path);

    if (
      !node.accepted &&
      (node.suggestType === "suggest-insertion" ||
        node.suggestType === "suggest-replacement") &&
      editor.user._id === node.userId &&
      editor.selection.focus.offset > 0
    ) {
      deleteBackward("character");
    }
  };

  editor.deleteForward = () => {};
  editor.insertFragment = () => {};
  editor.insertText = (text) => {
    // console.log("insert text with collaborator");
    const path = editor.selection.focus.path;
    const node = Node.get(editor, path);
    const selectedText = Editor.string(editor, editor.selection);

    if (
      (node.suggestType === "suggest-insertion" ||
        node.suggestType === "suggest-replacement") &&
      node.token === suggestionToken &&
      editor.user._id === node.userId
    ) {
      return insertText(text);
    }

    if (selectedText) {
      Transforms.insertNodes(
        editor,
        {
          text: selectedText,
          suggestType: "suggest-replacement",
          typeOfReplacement: "delete",
          userId: editor.user._id,
          username: editor.user.username,
          nodeId: uuidv4(),
          token: suggestionToken,
          date: Date.now(),
        },
        { split: true }
      );
      Transforms.insertNodes(editor, {
        text: " " + text,
        suggestType: "suggest-replacement",
        typeOfReplacement: "add",
        userId: editor.user._id,
        username: editor.user.username,
        nodeId: uuidv4(),
        token: suggestionToken,
        date: Date.now(),
      });
    } else {
      Transforms.insertNodes(editor, {
        text,
        suggestType: "suggest-insertion",
        userId: editor.user._id,
        username: editor.user.username,
        nodeId: uuidv4(),
        token: suggestionToken,
        date: Date.now(),
      });
    }
  };

  return editor;
};
