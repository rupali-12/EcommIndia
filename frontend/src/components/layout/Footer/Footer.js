import React from "react";
import "./Footer.css";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer__content">
        <div className="footer__column">
          <h3 className="footer__title">EcommIndia</h3>
          <p className="footer__text">
            Your trusted online shopping destination
          </p>
        </div>
        <div className="footer__column">
          <p className="footer__contact">
            <span>Contact us:</span>
            <a
              href="mailto:chatwith.cakkle100@gmail.com"
              onclick="navigateToEmail()"
            >
              chatwith.cakkle100@gmail.com
            </a>
          </p>
        </div>
        <div className="footer__column">
          <p className="footer__copyright">
            &copy; 2023 EcommIndia. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
