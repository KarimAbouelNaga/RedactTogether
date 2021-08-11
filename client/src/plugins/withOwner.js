import { Editor, Node } from "slate";

export const withOwner = (editor, isOwner) => {
  console.log("withOwner------------------------------------------:");

  const { deleteBackward, deleteFragment, insertText, insertNode } = editor;
  editor.deleteFragment = (...args) => {
    console.log("delete fragemnt owner");
    const path = editor.selection.focus.path;
    const nodeFocus = Node.get(editor, path);
    for (const [node, path] of Editor.nodes(editor, {
      at: editor.selection,
    })) {
      if ("text" in node && node.suggestType !== nodeFocus.suggestType) {
        console.log(node.suggestType, "is different", nodeFocus.suggestType);
        return;
      }
    }
    if (
      nodeFocus.accepted ||
      ![
        "suggest-insertion",
        "suggest-deletion",
        "suggest-replacement",
      ].includes(nodeFocus.suggestType)
    ) {
      deleteFragment(...args);
    }
  };

  editor.deleteBackward = () => {
    const path = editor.selection.focus.path;
    const node = Node.get(editor, path);

    if (
      node.accepted ||
      (node.suggestType !== "suggest-insertion" &&
        node.suggestType !== "suggest-deletion" &&
        node.suggestType !== "suggest-replacement" &&
        editor.selection.focus.offset > 0)
    ) {
      deleteBackward("character");
    }
  };

  // editor.deleteForward = () => {};
  // editor.insertFragment = () => {};
  editor.insertText = (text) => {
    const path = editor.selection.focus.path;
    const node = Node.get(editor, path);

    if (
      node.suggestType !== "suggest-insertion" &&
      node.suggestType !== "suggest-replacement" &&
      node.suggestType !== "suggest-deletion"
    ) {
      return insertText(text);
    }
    if (
      ["suggest-insertion", "suggest-deletion", "suggest-replacement"].includes(
        node.suggestType
      ) &&
      (editor.selection.focus.offset === node.text?.length ||
        editor.selection.focus.offset === 0)
    ) {
      insertNode({
        text,
      });
    }
  };
  return editor;
};
