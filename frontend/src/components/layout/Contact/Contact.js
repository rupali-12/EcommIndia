import React, { useState } from "react";
import "./Contact.css";
import { Button } from "@material-ui/core";
import emailjs from "emailjs-com";
import {
  REACT_APP_SERVICE_ID,
  REACT_APP_TEMPLATE_ID,
  REACT_APP_USER_ID,
} from "./envVar";

const Contact = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleNameChange = (e) => {
    setName(e.target.value);
  };

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };

  const handleMessageChange = (e) => {
    setMessage(e.target.value);
  };
  const submitHandler = (e) => {
    e.preventDefault();

    // Your emailjs service ID
    const serviceId = REACT_APP_SERVICE_ID;
    console.log(serviceId);
    // Your emailjs template ID
    const templateId = REACT_APP_TEMPLATE_ID;
    console.log(templateId);
    // Your emailjs user ID
    const userId = REACT_APP_USER_ID;
    console.log(userId);

    // Prepare the template parameters
    const templateParams = {
      name: name,
      email: email,
      message: message,
    };

    // Send the email using emailjs
    emailjs
      .send(serviceId, templateId, templateParams, userId)
      .then((response) => {
        console.log("Email sent successfully!");
        // Reset the form fields
        setName("");
        setEmail("");
        setMessage("");
      })
      .catch((error) => {
        console.error("Email send error:", error);
      });
  };

  return (
    <div className="contactContainer">
      <form className="contactForm">
        <h1 className="heading">Contact Us</h1>
        {/* <div className="contactForm"> */}
        <div className="contact">
          <input
            className="inputField"
            type="text"
            name="name"
            value={name}
            onChange={handleNameChange}
            required
            placeholder="Enter Your Name"
          />
        </div>
        <div className="contact">
          <input
            className="inputField"
            type="email"
            onChange={handleEmailChange}
            value={email}
            name="email"
            required
            placeholder="Enter Your Email"
          />
        </div>
        <div className="contact">
          <textarea
            className="textareaField"
            value={message}
            name="message"
            required
            onChange={handleMessageChange}
            placeholder="Please Enter Your Concern...."
            rows={12}
            cols={30}
          ></textarea>
        </div>
        <Button
          variant="contained"
          color="primary"
          className="submitButton"
          onClick={submitHandler}
        >
          Submit
        </Button>
        {/* </div> */}
      </form>
    </div>
  );
};

export default Contact;
