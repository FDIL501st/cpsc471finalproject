//TeamMember.js

// Imports
import React, { useEffect, useState } from "react";
import {
  Container,
  Grid,
  GridCol,
  Title,
  Button,
  TextInput,
} from "@mantine/core";
import "./styling/teamMember.css";
import { useAuth } from "./AuthContext";
import { MIN_PASSWORD_LENGTH } from "./Register";
import Return from "./pageElements/Return";

const TeamMember = () => {
  const { token, user } = useAuth(); // Retrieves authentication token, user information using "useAuth"
  const [teamMembers, setTeamMembers] = useState([]); // Stores team members
  const [showSuccessBanner, setShowSuccessBanner] = useState(false); // Handles successful banner display
  const [errorMessage, setErrorMessage] = useState(""); // Handles error messages

  // Fetch team members from the server based on company_id
  const fetchData = async () => {
    try {
      const response = await fetch(
        `http://localhost:3000/listTeamMembers?companyId=${user.company_id}`
      );
      if (response.ok) {
        const data = await response.json();
        setTeamMembers(data);
      } else {
        console.error("Error fetching team members:", response.status);
      }
    } catch (error) {
      console.error("Error fetching team members:", error);
    }
  };

  // Fetch team members when the component mounts or when token, user, or successBanner change
  useEffect(() => {
    fetchData();
  }, [token, user, showSuccessBanner]);

  // Removes team member from company list
  const handleRemoveClick = async (userId) => {
    try {
      const response = await fetch(
        `http://localhost:3000/deleteTeamMember/${userId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        // Update the teamMembers state after successful deletion
        setTeamMembers((prevMembers) =>
          prevMembers.filter((member) => member.user_id !== userId)
        );
      } else {
        console.error("Error deleting team member:", response.status);
      }
    } catch (error) {
      console.error("Error deleting team member:", error);
    }
  };

  // Adds a team member to company
  const handleAddTeamMemberClick = async () => {
    try {
      // Variables for new team members login
      const username = document.getElementById("username").value;
      const password = document.getElementById("password").value;
      const confirmPassword = document.getElementById("confirmPassword").value;

      // If passwords do not match
      if (password !== confirmPassword) {
        // Throw error telling user they don't match
        setErrorMessage("Passwords do not match");
        return;
      }
      // If the password is too short
      if (password.length < MIN_PASSWORD_LENGTH) {
        // Throw error telling user they don't match
        setErrorMessage("Password length must be at least 5 characters.");
        return;
      }

      // Connect to database and add using POST the new team member
      const response = await fetch("http://localhost:3000/addTeamMember", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          company_id: user.company_id,
          username,
          hashedpass: password,
        }),
      });

      if (response.ok) {
        // Refetch the team members to update the state
        fetchData();
        // Clear error message
        setErrorMessage("");
        const data = await response.json();
        if (data.success) {
          // Handle susscess of data
        } else {
          // Handle failure of data
        }
      } else {
        // Handles other errors
      }
    } catch (error) {
      // Handle error
    }
  };

  // Return HTML page for managing company team members using components above
  return (
    <Container size="xl" className="dashboard-container">
      {/* Return to dashboard button */}
      <Return />
      <Grid>
        <GridCol span={12}>
          {/* Page Title */}
          <Title order={1}>Team Members</Title>
          {/* Display company_id */}
          <div className="company-id">Company ID: {user.company_id}</div>
          {/* Conditionally display table of team members when there is one or more */}
          {teamMembers.length > 0 && (
            <div className="table-container">
              <table>
                <thead>
                  {/* Table headers */}
                  <tr className="table-header">
                    <td className="table-data">User ID</td>
                    <td className="table-data">Username</td>
                    <td className="table-data">Remove</td>
                  </tr>
                </thead>
                <tbody>
                  {/* Team members in table */}
                  {teamMembers.map((member) => (
                    <tr key={member.user_id} className="table-row">
                      <td className="table-data">{member.user_id}</td>
                      <td className="table-data">{member.username}</td>
                      <td className="table-data">
                        {/* Remove team member button */}
                        <Button
                          onClick={() => handleRemoveClick(member.user_id)}
                          className="remove-button"
                        >
                          Remove
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </GridCol>
          <div className="center">
          <GridCol span={12} md={6}>
            <br />
            {/* Add Member title */}
            <Title order={1}>Add Member</Title>
            {/* Username input */}
            <TextInput
              id="username"
              label="Username"
              style={{ width: "100%" }}
              required
            />
          </GridCol>
          <GridCol span={12} md={8}>
            {/* Password input */}
            <TextInput
              id="password"
              label="Password"
              style={{ width: "100%" }}
              required
            />
          </GridCol>
          <GridCol span={12} md={4}>
            {/* Confirm password input */}
            <TextInput
              id="confirmPassword"
              label="Confirm Password"
              style={{ width: "100%" }}
              required
            />
            {/* Add team member button */}
            <Button
              onClick={handleAddTeamMemberClick}
              className="add-service-btn"
            >
              + Add Team Member
            </Button>
            {errorMessage && <div style={{ color: "red" }}>{errorMessage}</div>}
          </GridCol>`
        </div>
      </Grid>
    </Container>
  );
};

export default TeamMember;
