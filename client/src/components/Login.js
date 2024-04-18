// Login.js

// Imports
import React, { useState } from "react";
import {
  Container,
  Grid,
  GridCol,
  TextInput,
  Button,
  Paper,
} from "@mantine/core";
import { useAuth } from "./AuthContext"; // Adjust the path as needed
import { Link } from "react-router-dom"; // Import Link from react-router-dom
import "./styling/login.css";

const Login = ({ history }) => {
  // Retrieves login function using "useAuth"
  const { login /*loginTeam*/ } = useAuth();

  // Variables for email, password, and error handling
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);

  // Function handles a user logging in
  const handleLogin = async () => {
    try {
      // Send login request to the server
      const response = await fetch("http://localhost:3000/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        // Sending user email and password as JSON file
        body: JSON.stringify({
          email,
          password,
        }),
      });

      // Parse response data from server
      const responseData = await response.json();
      //console.log(response.ok);
      if (response.ok && responseData.token) {
        // If login is successful
        // Determine who is logging in, user or team memeber
        if (responseData.isUser) {
          // If user is logging in
          login(responseData); // Store the whole response as the token
          history.push("/dashboard"); // Redirect to dashboard
        } else {
          // Otherwise team member is loggin in
          login(responseData); // Store the whole responce as the token
          history.push("/dashboard");
        }
      } else {
        // Login failed, set error message
        console.log("ResponseData.error: ", responseData.error);
        setError(responseData.error || "Authentication failed");
      }
    } catch (error) {
      // Handle any errors that occured during authentication
      console.error("Error during authentication:", error);
      setError("Authentication failed");
    }
  };

  // Return HTML page for logging in
  return (
    <Container size="md" className="body-reg">
      <Paper className="login-card">
        {/* Comapny Banner */}
        <div className="logo">❖ INVOICIFY</div>
        <Grid>
          <GridCol span={12}></GridCol>
          <GridCol span={12} md={8}>
            <div className="login-input login-spacing">
              {/* Email Input */}
              <TextInput
                label="⎙ Email Address"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
            {/* Login button */}
            <Button className="login-button" fullWidth onClick={handleLogin}>
              Log In
            </Button>
            {error && (
              <div className="error-message" style={{ color: "red" }}>
                {error}
              </div>
            )}
          </GridCol>
        </Grid>
        {/* Register redirect */}
        <div className="login-text">
          <p>
            Don't have an account?{" "}
            <Link to="/register" className="register-link">
              Register
            </Link>
          </p>
        </div>
      </Paper>
    </Container>
  );
};

export default Login;
