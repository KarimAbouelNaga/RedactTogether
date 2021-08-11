import React from "react";
import Button from "./Buttons/Button";
import { Editor, Transforms, Element as SlateElement } from "slate";
import { useSlate } from "slate-react";

const EditorToolBar = () => {
  return (
    <div className='toolbar'>
      <MarkButton
        format='bold'
        icon='format_bold'
        //   saveDoc={saveDocHandler}
        //   timer={timer}
        //   setTimer={setTimer}
      />

      <MarkButton
        format='italic'
        icon='format_italic'
        //   saveDoc={saveDocHandler}
        //   timer={timer}
        //   setTimer={setTimer}
      />

      <MarkButton
        format='underline'
        icon='format_underline'
        //   saveDoc={saveDocHandler}
        //   timer={timer}
        //   setTimer={setTimer}
      />

      <MarkButton
        format='code'
        icon='code'
        //   saveDoc={saveDocHandler}
        //   timer={timer}
        //   setTimer={setTimer}
      />

      <MarkButton
        format='uppercase'
        icon='keyboard_arrow_up'
        //   saveDoc={saveDocHandler}
        //   timer={timer}
        //   setTimer={setTimer}
      />

      <MarkButton
        format='lowercase'
        icon='keyboard_arrow_down'
        //   saveDoc={saveDocHandler}
        //   timer={timer}
        //   setTimer={setTimer}
      />

      <BlockButton
        format='heading-one'
        icon='looks_one'
        //   saveDoc={saveDocHandler}
        //   timer={timer}
        //   setTimer={setTimer}
      />

      <BlockButton
        format='heading-two'
        icon='looks_two'
        //   saveDoc={saveDocHandler}
        //   timer={timer}
        //   setTimer={setTimer}
      />

      <BlockButton
        format='left'
        icon='format_align_left'
        //   saveDoc={saveDocHandler}
        //   timer={timer}
        //   setTimer={setTimer}
      />

      <BlockButton
        format='center'
        icon='format_align_center'
        //   saveDoc={saveDocHandler}
        //   timer={timer}
        //   setTimer={setTimer}
      />

      <BlockButton
        format='right'
        icon='format_align_right'
        //   saveDoc={saveDocHandler}
        //   timer={timer}
        //   setTimer={setTimer}
      />

      <BlockButton
        format='justify'
        icon='format_align_justify'
        //   saveDoc={saveDocHandler}
        //   timer={timer}
        //   setTimer={setTimer}
      />
    </div>
  );
};

export default EditorToolBar;

const MarkButton = ({ format, icon }) => {
  const editor = useSlate();

  return (
    <Button
      active={isMarkActive(editor, format)}
      onMouseDown={(e) => {
        e.preventDefault();
        toggleMark(editor, format);
      }}
      icon={icon}
    />
  );
};
const BlockButton = ({ format, icon }) => {
  const editor = useSlate();
  return (
    <Button
      active={isBlockActive(editor, format)}
      onMouseDown={(e) => {
        e.preventDefault();
        toggleBlock(editor, format);
      }}
      icon={icon}
    />
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

const isBlockActive = (editor, format) => {
  const [match] = Editor.nodes(editor, {
    match: (node) => {
      return (
        !Editor.isEditor(node) &&
        SlateElement.isElement(node) &&
        node.type === format
      );
    },
  });

  return !!match;
};

const toggleBlock = (editor, format) => {
  const isActive = isBlockActive(editor, format);

  Transforms.setNodes(
    editor,
    { type: isActive ? "paragraph" : format },
    { match: (node) => Editor.isBlock(editor, node) }
  );
};
