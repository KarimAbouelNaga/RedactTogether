import React from "react";

const DocListItem = ({
  doc,
  currentUser,
  viewDocHandler,
  manageDocumentHandler,
  deleteDocHandler,
}) => {
  return (
    <tbody>
      <tr>
        <td>{doc.name}</td>

        {doc.collaborators.includes(currentUser._id) ? (
          <td>Participant</td>
        ) : doc.viewers.includes(currentUser._id) ? (
          <td>Viewer</td>
        ) : (
          <td>Owner</td>
        )}
        <td>
          <button
            className='ui positive secondary button'
            onClick={(id) => viewDocHandler(doc._id)}
          >
            Edit
          </button>
        </td>
        {doc.collaborators.includes(currentUser._id) ||
        doc.viewers.includes(currentUser._id) ? (
          <td>
            <button className='ui disabled secondary button'>Settings</button>
          </td>
        ) : (
          <td>
            <button
              className='ui secondary button'
              onClick={(id) => manageDocumentHandler(doc._id)}
            >
              Settings
            </button>
          </td>
        )}
        {doc.collaborators.includes(currentUser._id) ||
        doc.viewers.includes(currentUser._id) ? (
          <td>
            <button className='ui disabled secondary button'>Delete</button>
          </td>
        ) : (
          <td>
            <button
              className='ui negative secondary button'
              onClick={(id) => deleteDocHandler(doc._id)}
            >
              Delete
            </button>
          </td>
        )}
      </tr>
    </tbody>
  );
};

export default DocListItem;
