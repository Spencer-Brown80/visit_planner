import React from 'react';

const UserClientNewContactForm = () => (
  <div>
    <h2>User Client New Contact Form</h2>
    <form>
      {/* Add your new contact form fields here */}
      <input type="text" placeholder="Name" />
      <input type="email" placeholder="Email" />
      <button type="submit">Add New Contact</button>
    </form>
  </div>
);

export default UserClientNewContactForm;
