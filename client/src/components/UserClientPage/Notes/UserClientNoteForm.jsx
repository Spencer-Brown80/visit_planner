import React from 'react';

const UserClientNoteForm = () => (
  <div>
    <h2>User Client Note Form</h2>
    <form>
      {/* Add your note form fields here */}
      <textarea placeholder="Write your note here"></textarea>
      <button type="submit">Add Note</button>
    </form>
  </div>
);

export default UserClientNoteForm;
