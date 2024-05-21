import React from 'react';

const UserClientContactForm = () => (
  <div>
    <h2>User Client Contact Form</h2>
    <form>
      {/* Add your contact form fields here */}
      <input type="text" placeholder="Name" />
      <input type="email" placeholder="Email" />
      <button type="submit">Add Contact</button>
    </form>
  </div>
);

export default UserClientContactForm;
