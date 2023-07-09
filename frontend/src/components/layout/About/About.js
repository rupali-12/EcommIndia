import React from "react";
import "./About.css";
import {Typography } from "@material-ui/core";

const About = () => {

  return (
    <div className="aboutSection">
      <div className="aboutSectionContainer">
        <Typography component="h1">About Us</Typography>

        <div className="textField">
          <h1>Welcome to E-CommIndia!</h1>
          <p>
            We're your go-to destination for top-quality products and
            exceptional service. Discover a world of possibilities with our
            curated collection of fashion, gadgets, and home decor. Shop
            confidently knowing we prioritize your satisfaction and offer secure
            checkout options. Join us in our commitment to sustainability and
            responsible consumerism. Experience the best in online shopping with
            E-CommIndia today!
          </p>
        </div>
      </div>
    </div>
  );
};

export default About;
