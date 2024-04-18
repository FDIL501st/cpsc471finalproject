// Settings.js

// Imports
import React, { useState } from "react";
import { Redirect } from "react-router-dom";
import {
  Container,
  Grid,
  GridCol,
  Paper,
  TextInput,
  Title,
  Button,
  Notification,
} from "@mantine/core";
import { useAuth } from "./AuthContext"; // Import the useAuth hook
import { MIN_PASSWORD_LENGTH } from "./Register";
import "./styling/login.css"; // Import existing style from login
import Return from "./pageElements/Return";

// Settings component for changing user email and password
const Settings = () => {
  const { token, user, logout } = useAuth(); // Retrieves authentication token, user information, and logout function using "useAuth"
  const [confirmEmail, setConfirmEmail] = useState(""); // User old email
  const [email, setEmail] = useState(""); // User new email
  const [oldPassword, setOldPassword] = useState(""); // User old password
  const [password, setPassword] = useState(""); // User new password
  const [confirmPassword, setConfirmPassword] = useState(""); // User confirm new password
  const [error, setError] = useState(null); // Error handling state
  const [emailUpdate, setEmailUpdate] = useState(""); // Email updated handling message
  const [passwordUpdate, setPasswordUpdate] = useState(""); // Password updated handling message
  // 2 states above to tell user if update was successful

  // Check if the user is authenticated
  if (!token) {
    // Redirect to the login page if not authenticated
    return <Redirect to="/login" />;
  }

  // Updates user credentials when changed
  const handleUpdateSettings = async () => {
    // clear previous error/crendentials (in case any were previously set)
    setError(null);
    setEmailUpdate("");
    setPasswordUpdate("");

    // need to send to server email and password
    // before doing so, need to check email and password
    // if email is empty, don't send updates
    if (email !== "") {
      // First check if emails match
      if (email !== confirmEmail) {
        setError("Emails do not match.");
      }
      // Emails Match, change email
      else {
        try {
          // send request to update email
          const response = await fetch(
            "http://localhost:3000/updateUser/email",
            {
              method: "PATCH",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                user_id: user.user_id,
                email: email,
              }),
            }
          );

          if (response.ok) {
            // If no errors, update email
            console.log("Server Response:", response.status);
            setEmailUpdate("Email changed");
            // Clear data input fields
            setEmail("");
            setConfirmEmail("");
          } else {
            console.log("Server Error:", response);
            setError("Error with server response");
          }
        } catch (error) {
          console.error("Error during fetch:", error.message);
        }
      }
    }
    // if password is empty, don't send update
    if (password !== "") {
      // Check if oldPassword matches what is currently the password in the server
      try {
        const passwordResponse = await fetch(
          "http://localhost:3000/checkPassword",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              user_id: user.user_id,
              password: oldPassword,
            }),
          }
        );

        // Parse response data from server
        const passwordData = await passwordResponse.json();

        // If password matches server password
        if (passwordResponse.ok && passwordData.match) {
          console.log("Password is a match");
          // Proceed to update password
          // before doing so, check if greater than min length
          if (password.length < MIN_PASSWORD_LENGTH) {
            // need to send an error telling password has not been updated because it is too short
            setError(`Password can't be shorter than ${MIN_PASSWORD_LENGTH}`);
          }
          // Check if new passwords match before changing password
          else if (password !== confirmPassword) {
            // Send error telling passwords do not match
            setError(`New passwords do not match.`);
          }
          // Check if oldPassword differs from newPassword
          else if (password === oldPassword) {
            setError(`New password must be different from old password.`);
          }
          // If passwords match and old password mathces current password, then update
          else {
            try {
              // send request to update password
              const response = await fetch(
                "http://localhost:3000/updateUser/password",
                {
                  method: "PATCH",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    user_id: user.user_id,
                    password: password,
                  }),
                }
              );
              if (response.ok) {
                // If no errors, update password
                console.log("Server Response:", response);
                setPasswordUpdate("Password changed");
                // Clear password input data fields
                setOldPassword("");
                setPassword("");
                setConfirmPassword("");
              } else {
                console.log("Server Error:", response.status);
                setError("Error with server response");
              }
            } catch (error) {
              console.error("Error during fetch:", error.message);
              setError("Error with server request");
            }
          }
        }
        // If oldPassword doesn't match server
        else {
          setError("Old password is incorrect");
          console.log("Response:", passwordResponse);
          return; // Exit the function early if the old password doesn't match
        }
      } catch (error) {
        console.error("Error checking old password:", error.message);
        setError("Error checking old password");
      }
    }
  };

  // Deletes the user account
  const handleDeleteAccount = async () => {
    // clear error , remove in case previously set
    setError(null);

    // sends a request to server to delete the user
    try {
      const response = await fetch("http://localhost:3000/deleteUser", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: user.user_id,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // If failed to delete account, display error message
        console.log(data);
        setError("Failed to delete account");
      } else if (!data.success) {
        // failed as unable to find user_id
        console.log(data);
        setError("Unable to find account to delete");
      } else {
        console.log(data);
        // after deleting user, need to call logout to do logout stuff
        // can't let user do more things after deleting their account
        logout();
      }
    } catch (error) {
      console.error("Error during fetch:", error.message);
      setError("Error with server request");
    }
  };

  // Clear passWordUpdate to remove notification banner
  const clearUpdateNotifications = () => {
    setPasswordUpdate("");
    setEmailUpdate("");
  };

  // Return HTML settings page using the components above
  return (
    <Container size="xl" className="dashboard-container">
      {/* Return link */}
      <Return />
      {/* Title */}
      <Title order={1} orderMd={2} orderLg={2}>
        Settings
      </Title>
      <Grid>
        {/* Add your settings content here */}
        <GridCol span={12}>
          {/* Add space between Header and Paper */}
          <div style={{ margin: "20px 0" }}></div>

          <Paper className="card">
            {/* Email update field */}
            <Title order={2}>Change Email</Title>
            <br />
            <div className="login-input login-spacing">
              <TextInput
                label="⎙ New Email Address"
                placeholder="Enter your new email (keep empty to not change)"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <TextInput
                label="⎙ Confirm New Email Address"
                placeholder="Confirm your new email (keep empty to not change)"
                value={confirmEmail}
                onChange={(e) => setConfirmEmail(e.target.value)}
              />
            </div>
          </Paper>

          {/* Add space between papers */}
          <div style={{ margin: "20px 0" }}></div>

          <Paper className="card">
            {/* Password update field */}
            <Title order={2}>Change Password</Title>
            <br />
            <div className="login-input login-spacing">
              <TextInput
                label="ꗃ Old Password"
                placeholder="Enter your existing password (keep empty to not change)"
                type="password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
              />
              <TextInput
                label="ꗃ New Password"
                placeholder="Enter your new password (keep empty to not change)"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              {/* Confirm Password input */}
              <TextInput
                label="ꗃ Confirm New Password"
                placeholder="Confirm your password (keep empty to not change)"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </Paper>
        </GridCol>
        <GridCol span={12}>
          {/* Button to update settings */}
          <Button
            style={{ marginTop: 10, marginBottom: 10 }}
            onClick={() => handleUpdateSettings()}
          >
            Update Settings
          </Button>

          {/* Show email update message if email update message exists */}
          <div style={{ marginTop: 10 }}>
            {emailUpdate && (
              <Notification
                type="success"
                title={emailUpdate}
                onClose={clearUpdateNotifications} // Call function to clear notifications
              />
            )}
          </div>

          {/* Show password update message if password update message exists */}
          <div style={{ marginTop: 10 }}>
            {passwordUpdate && (
              <Notification
                type="success"
                title={passwordUpdate}
                onClose={clearUpdateNotifications} // Call function to clear notifications
              />
            )}
          </div>

          {/* Show error message if error message exists */}
          <div style={{ color: "red", marginTop: 10 }}>
            {error && <p>{error}</p>}
          </div>

          {/* Button to delete account */}
          <Button
            onClick={handleDeleteAccount}
            color="red"
            style={{ width: "100%", marginTop: 30 }}
          >
            Delete Account
          </Button>
        </GridCol>
      </Grid>
    </Container>
  );
};

export default Settings;
