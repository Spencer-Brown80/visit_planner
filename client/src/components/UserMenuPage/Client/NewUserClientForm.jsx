import React from 'react';

const NewUserClientForm = () => (
  <div>
    <h2>New User Client Form</h2>
    <form>
      {/* Add your new user client form fields here */}
      <input type="text" placeholder="Name" />
      <input type="email" placeholder="Email" />
      <button type="submit">Add User Client</button>
    </form>
  </div>
);

export default NewUserClientForm;
