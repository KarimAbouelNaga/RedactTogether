import React from "react";

export const EditorHeader = ({ title, saved, value, saveDocHandler }) => {
  return (
    <div className='doc-info'>
      <h3 className='doc-title'>{title}</h3>

      <div>{saved ? <p style={{ color: "green" }}>Saved</p> : <p></p>}</div>

      <button
        disabled={!value}
        className='save-button'
        onClick={() => saveDocHandler(value)}
      >
        <span className='material-icons'>save</span>
      </button>
    </div>
  );
};


