// Register.js

// Imports
import React, { useState } from "react";
import {
  Container,
  Grid,
  GridCol,
  TextInput,
  Button,
  Paper,
  Notification,
} from "@mantine/core";
import { useAuth } from "./AuthContext"; // Adjust the path as needed
import { Link } from "react-router-dom"; // Import Link from react-router-dom
import "./styling/login.css";

// Minimum password length
export const MIN_PASSWORD_LENGTH = 5;

// Function for user registering
const Register = ({ history }) => {
  // Retrieves logout function using "useAuth"
  const { login } = useAuth();

  // Variables for user registration and error handling
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [mailingAddress, setMailingAddress] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [error, setError] = useState("");

  // define a error checking function, pass it a bool err and a msg to add to error
  // error is written if err is true
  function checkError(err, msg) {
    // let to_append = '';
    // if (error === '') {
    //   to_append = msg;
    // }
    // else {
    //   to_append = '\n'.concat(msg);
    // }
    if (err) {
      // setError(prevError => prevError .concat(to_append));
      setError(msg);
      throw msg;
    }
  }

  const handleRegister = async () => {
    // empty error in case was set previously (eg// revist page, refresh page)
    setError("");

    try {
      // add checks for inputs

      /* Note: At the moment, throw exception at first error. 
      This means that only tells you one error, not all of them. */

      // checks if fields have been filled (non empty strings)
      const empty_field_err_msg = "All fields must be filled";

      checkError(email === "", empty_field_err_msg);
      checkError(firstName === "", empty_field_err_msg);
      checkError(lastName === "", empty_field_err_msg);
      checkError(companyName === "", empty_field_err_msg);
      checkError(mailingAddress === "", empty_field_err_msg);
      checkError(phoneNumber === "", empty_field_err_msg);

      // password check for length
      checkError(
        password.length < MIN_PASSWORD_LENGTH,
        "Password length must be at least 5 characters."
      );

      // password check for match confirm password
      checkError(
        password !== confirmPassword,
        "Password and Confirm Password must match."
      );

      console.log(error);

      // check if error is not empty, as if it is, then there was error in field
      // if (error !== '') {
      //   console.log("Enter throw error");
      //   throw "Register field input error";
      // }

      // Sending a POST request to database
      const response = await fetch("http://localhost:3000/registration", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        // Send user's registration data
        body: JSON.stringify({
          email,
          first_name: firstName,
          last_name: lastName,
          company_name: companyName,
          password,
          mailing_address: mailingAddress,
          phone_number: phoneNumber,
        }),
      });

      // Parse the response data from database
      const responseData = await response.json();

      // If registration successful
      if (response.ok && responseData.success) {
        // Redirect to login page
        history.push("/login");
      } else {
        // database fetch error
        setError(responseData.error || "Registration failed");
      }
    } catch (error) {
      console.error("Error during registration:", error);
      // don't set error if already set before (not empty)
      if (error === "") {
        setError("Registration failed");
      }
    }
  };

  //Return HTML page for registration page using the data above
  return (
    <Container size="md" className="body-reg">
      <Paper className="login-card">
        {/* Company Header */}
        <div className="logo">❖ INVOICIFY</div>
        <Grid>
          <GridCol span={12}>
            {error && <Notification type="error" title={error} />}
          </GridCol>
          <GridCol span={12} md={8}>
            <div className="login-input login-spacing">
              {/* Email address input */}
              <TextInput
                label="⎙ Email Address"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="login-input login-spacing">
              {/* First name input */}
              <TextInput
                label="⎙ First Name"
                placeholder="Enter your first name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
            </div>
            <div className="login-input login-spacing">
              {/* Last name input */}
              <TextInput
                label="⎙ Last Name"
                placeholder="Enter your last name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>
            <div className="login-input login-spacing">
              {/* Company name input */}
              <TextInput
                label="⎙ Company Name"
                placeholder="Enter your company name"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
              />
            </div>
            <div className="login-input login-spacing">
              {/* Password input */}
              <TextInput
                label="ꗃ Password"
                placeholder="Enter your password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div className="login-input login-spacing">
              {/* Confirm Password input */}
              <TextInput
                label="ꗃ Confirm Password"
                placeholder="Confirm your password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
            <div className="login-input login-spacing">
              {/* Mailing address input */}
              <TextInput
                label="🏢 Mailing Address"
                placeholder="Enter your mailing address"
                value={mailingAddress}
                onChange={(e) => setMailingAddress(e.target.value)}
              />
            </div>
            <div className="login-input login-spacing">
              {/* Phone Number input */}
              <TextInput
                label="📞 Phone Number"
                placeholder="Enter your phone number"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
              />
            </div>
            {/* Register Button */}
            <Button className="login-button" fullWidth onClick={handleRegister}>
              Register
            </Button>
          </GridCol>
        </Grid>
        {/* Login redirect */}
        <div className="login-text">
          <p>
            Already have an account?{" "}
            <Link to="/login" className="register-link">
              Log In
            </Link>
          </p>
        </div>
      </Paper>
    </Container>
  );
};

export default Register;
