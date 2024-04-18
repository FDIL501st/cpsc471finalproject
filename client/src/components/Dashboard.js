// Dashboard.js

// Imports
import React, { useState, useEffect } from "react";
import { Redirect, Link, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext";
import {
  Container,
  Table,
  Grid,
  GridCol,
  Paper,
  Title,
  Text,
  Drawer,
  Burger,
  Button,
} from "@mantine/core";
import "./styling/dashboard.css";

// Function mocks an authentication API call to fetch dashoard data
const yourAuthApiCall = async (token, user, isUser) => {
  return new Promise((resolve) => {
    // 1 Second delay
    setTimeout(() => {
      if (token && user && isUser) {
        // THIS IS A USER LOGIN
        // Resolve with mock data if token and user are present
        // This will be populated with correct data in dashboard component
        resolve({
          data: {
            user: {
              fname: user.fname,
              lname: user.lname,
              company_id: user.company_id,
            },
            cards: [
              { title: "42", content: "Number of Invoices" },
              { title: "$149.00", content: "Total Invoice Amounts" },
              { title: "35/40", content: "Pending Invoices" },
            ],
            invoices: [
              {
                invoice_id: 35849,
                invoice_title: "Some Invoice",
                created_by_company: 5887,
                date_created: "2023-11-17",
                due_date: "23/13/12",
                client_id: 96755,
                paid: 0,
              },
            ],
          },
        });
      } else if (token && user) {
        // THIS IS A TEAM MEMBER LOGIN
        // Resolve with mock data if token and user are present
        // This will be populated with correct data in dashboard component
        resolve({
          data: {
            user: {
              fname: user.fname,
              lname: user.lname,
              company_id: user.company_id,
            },
            cards: [
              { title: "42", content: "Number of Invoices" },
              { title: "$149.00", content: "Total Invoice Amounts" },
              { title: "35/40", content: "Pending Invoices" },
            ],
            invoices: [
              {
                invoice_id: 35849,
                invoice_title: "Some Invoice",
                created_by_company: 5887,
                date_created: "2023-11-17",
                due_date: "23/13/12",
                client_id: 96755,
                paid: 0,
              },
            ],
          },
        });
      } else {
        // If authentication fails, resolves with error
        resolve({ data: { error: "Authentication failed" } });
      }
    }, 1000);
  });
};

// Dashboard component
const Dashboard = () => {
  // Retrieves authentication token, user information, and logout function using "useAuth"
  const { token, logout, user, isUser } = useAuth();
  const [isDrawerOpened, setIsDrawerOpened] = useState(false); // Sidebar state manager
  const location = useLocation(); // Get current location object from React Router
  const [cardData, setCardData] = useState(null); // Used to manage dashboard data
  const [teamMembers, setTeamMembers] = useState([]); // Used to manage team member data

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // API call to fetch initial dashboard data
        const response = await yourAuthApiCall(token, user, isUser);
        setCardData(response.data);

        if (response.data.user && response.data.user.company_id) {
          // Fetch invoice list data of company
          const invoicesResponse = await fetch(
            `http://localhost:3000/listInvoices/${response.data.user.company_id}`
          );
          const invoicesData = await invoicesResponse.json();
          console.log("Invoices:", invoicesData);
          // Updates invoice list with fetched data
          setCardData((prevState) => ({
            ...prevState,
            invoices: invoicesData.data,
          }));

          // Fetch stats related to data of company
          const statsResponse = await fetch(
            `http://localhost:3000/getStats/${response.data.user.company_id}`
          );
          const statsData = await statsResponse.json();
          console.log("Stats: ", statsData);
          // Maps stats data to cards and update card data
          const mappedStatsToCards = [
            {
              title: statsData.data[0].number_of_invoices,
              content: "Number of Invoices",
            },
            {
              title: statsData.data[0].total_sales,
              content: "Total Sales ($)",
            },
            {
              title: statsData.data[0].total_clients,
              content: "Total Clients",
            },
          ];
          // Set the fetched stats
          setCardData((prevState) => ({
            ...prevState,
            cards: mappedStatsToCards,
          }));

          // Fetch team members data based on Company_ID
          const teamMembersResponse = await fetch(
            `http://localhost:3000/listTeamMembers?companyId=${user.company_id}`
          );
          if (teamMembersResponse.ok) {
            const teamMembersData = await teamMembersResponse.json();
            // Set the fetched team members data
            setTeamMembers(teamMembersData);
          } else {
            console.error(
              "Error fetching team members:",
              teamMembersResponse.status
            );
          }
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      }
    };

    fetchDashboardData(); // Call for fetching dashboard data
  }, [token, user, isUser]); // Run effect above when token or user details change

  // If no token, redirect to login
  if (!token) {
    return <Redirect to="/login" />;
  }

  // Toggles state of sidebar
  const toggleDrawer = () => {
    setIsDrawerOpened(!isDrawerOpened);
  };

  // Handles user logout
  const handleLogout = () => {
    logout();
  };

  // Returns the Dashboard HTML page using the variables and data retrieved above above
  return (
    <Container size="xl" className="dashboard-container">
      {/* Company Banner */}
      <div className="logo-2">❖ INVOICIFY</div>
      <Grid>
        {/* Burger menu */}
        <GridCol span={12} md={1} className="menu-container">
          <Burger onClick={toggleDrawer} />
          <div className="menu-text">Menu</div>
          {/* Logout button */}
          <Button
            onClick={handleLogout}
            className="logout-button"
            style={{ marginLeft: "auto" }}
          >
            ↥ Logout
          </Button>
        </GridCol>

        {/* Burger Menu View */}
        <Drawer
          position="left"
          opened={isDrawerOpened}
          onClose={() => setIsDrawerOpened(false)}
          padding="md"
          size="xl"
          className="bar"
        >
          <div className="sidebar">
            {/* Company Logo & Name on top */}
            <div className="logo">❖ INVOICIFY</div>

            {/* Menu options: Dashboard, team managment, Account Settings
                Redirect to dashboard */}
            <Link to="/dashboard" className={`sidebar-item active`}>
              ⾕ - Dashboard
            </Link>
            <br></br>
            {/* Redirect to team management */}
            {isUser && ( // Renders Team Management option only if user is signed in
              <Link to="/team-members" className={`sidebar-item`}>
                ▶ - Team Management
              </Link>
            )}
            <br></br>
            {/* Redirect to Account Settings */}
            <Link to="/settings" className={`sidebar-item`}>
              ♦ - Account Settings
            </Link>
          </div>
        </Drawer>

        {/* Regular view (Burger menu closed) */}
        <GridCol span={12} md={11} className="main-content-col">
          {/* Page Title */}
          <Title order={1} orderMd={2} orderLg={2}>
            Dashboard
          </Title>
          {/* User Greeting */}
          {isUser ? ( // If User is signed in, use this greeting
            <Text align="center" className="welcome-text">
              Hello, {user ? `${user.fname} ${user.lname}` : "Loading..."}
            </Text>
          ) : (
            // If team member signed in, use this greeting
            <Text align="center" className="welcome-text">
              Hello, {user ? `${user.fname} ` : "Loading..."}
            </Text>
          )}

          {/* Company Stats Cards */}
          {isUser && ( // Only render stats if user is signed in
            <div className="vertical-cards">
              {cardData && cardData.cards ? (
                cardData.cards.map((card, index) => (
                  <Paper key={index} className="card">
                    <Title order={2}>{card.title}</Title>
                    <div>{card.content}</div>
                  </Paper>
                ))
              ) : (
                <div>Loading...</div>
              )}
            </div>
          )}

          {/* Company team members and inovice cards */}
          <div className="remaining-cards">
            {
              isUser ? (
                // Show table only if a user is signed in, not team member
                teamMembers.length > 0 ? (
                  <Paper className="card">
                    {/* If one or more team members display below */}
                    {/* Team members card Title*/}
                    <Title order={2}>Team Members</Title>
                    <br />
                    <Table striped>
                      <tbody>
                        <tr>
                          <td>
                            {/* Team member ID table title */}
                            <strong>User ID</strong>
                          </td>
                          <td>
                            {/* Team member username table title */}
                            <strong>Username</strong>
                          </td>
                        </tr>
                        {/* Team members that fill table */}
                        {teamMembers.map((member) => (
                          <tr key={member.user_id}>
                            <td>{member.user_id}</td>
                            <td>{member.username}</td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </Paper>
                ) : (
                  <div>
                    {/* If no team members, conditional button to add team member */}
                    <p>No team members available.</p>
                    <Link to="/team-members">
                      {/* Button redirects to team management*/}
                      <Button className="add-service-btn">
                        + Add team member
                      </Button>
                    </Link>
                  </div>
                )
              ) : null // Render Nothing if not a user
            }

            {/* Invoice Card */}
            {cardData && cardData.invoices && cardData.invoices.length > 0 ? (
              <Paper className="card">
                {/* Invoice card title */}
                <Title order={2}>Invoices</Title>
                <br />
                <Table striped>
                  <tbody>
                    <tr>
                      <td>
                        {/* Table header Titles */}
                        <strong>Invoice ID</strong>
                      </td>
                      <td>
                        <strong>Invoice Title</strong>
                      </td>
                      <td>
                        <strong>Due Date</strong>
                      </td>
                      <td>
                        <strong>Paid</strong>
                      </td>
                      <td>
                        <strong>Details</strong>
                      </td>
                    </tr>
                    {/* Invoices in table */}
                    {cardData.invoices.map((invoice) => (
                      <tr key={invoice.invoice_id}>
                        <td>{invoice.invoice_id}</td>
                        <td>{invoice.invoice_title}</td>
                        <td>{invoice.due_date}</td>
                        <td>{invoice.paid ? "Yes" : "No"}</td>
                        <td>
                          <Link to={`/invoice/${invoice.invoice_id}`}>
                            View
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Paper>
            ) : (
              <p className="center-p">No invoices available.</p>
            )}
          </div>

          <div>
            <div style={{ display: "flex", alignItems: "center" }}>
              <Link to="/create-invoice">
                {/* Button to create invoice, redirects to invoice creation */}
                <Button className="invoice-button">+ Create Invoice</Button>
              </Link>
            </div>
          </div>
        </GridCol>
      </Grid>
    </Container>
  );
};

export default Dashboard;
