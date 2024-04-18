// Invoice.js

// Imports
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { Container, Grid, GridCol, Title, Text, Paper } from "@mantine/core";
import "./styling/invoice.css";

const Invoice = ({ match }) => {
  // Fetch authentication token
  const { token } = useAuth();
  // Extract invoice_id from route that was randomly generated in Create-invoice.js
  const { invoice_id } = match.params;
  // State for the invoice data
  const [invoiceData, setInvoiceData] = useState(null);

  // Fetch invoice data using invoice_id on component mount or on update
  useEffect(() => {
    const fetchInvoiceData = async () => {
      try {
        // Fetch invoice data from database using invoice_id
        const response = await fetch(
          `http://localhost:3000/getInvoice/${invoice_id}`
        );
        const data = await response.json();

        // Update invoice data with the fetched data
        setInvoiceData(data.data);
        console.log("Invoice Data:", data.data);
      } catch (error) {
        console.error("Error fetching invoice data:", error);
      }
    };

    fetchInvoiceData(); // Call for fetching invoice data
  }, [invoice_id]); // Run the effect above when invoice_id changes

  // Calculates total cost of service(s) in the invoice
  const calculateTotal = (services) => {
    return services.reduce((total, service) => total + service.cost, 0);
  };

  // Handle payment of invoice
  const handlePayInvoice = async () => {
    try {
      // Making a PUT request to pay invoice on the server
      const response = await fetch(
        `http://localhost:3000/payInvoice/${invoice_id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      // Parse response from payment attempt
      const data = await response.json();
      console.log("Payment Response:", data);

      // If payment is successful, reload page with the changes
      if (data.success) {
        window.location.reload();
      } else {
        console.error("Error paying invoice:", data.message);
      }
    } catch (error) {
      console.error("Error paying invoice:", error);
    }
  };

  // Return the invoice HTML page with data fetched from above
  return (
    <Container size="xl" className="dashboard-container">
      {token ? (
        // Return to dashboard button
        <Link to="/Dashboard">
          <p>← Return</p>
        </Link>
      ) : (
        <p></p>
      )}
      <Grid>
        <GridCol span={12}>
          <Paper shadow="sm" padding="lg">
            {/* Invoice title */}
            <Title order={2}>
              Invoice: {invoiceData?.invoice?.invoice_title}
            </Title>
            <br></br>
            {/* Billing To Section (Client Info) */}
            {invoiceData && invoiceData.clientInfo && (
              <div className="marginBottom">
                <Title order={3}>Billing To</Title>
                <hr></hr>
                <Text size="lg">
                  <strong>Client Id:</strong> {invoiceData.clientInfo.client_id}
                </Text>
                <Text size="lg">
                  <strong>Created by Company Id:</strong>{" "}
                  {invoiceData.clientInfo.created_by_company_id}
                </Text>
                <Text size="lg">
                  <strong>First Name:</strong> {invoiceData.clientInfo.fname}
                </Text>
                <Text size="lg">
                  <strong>Last Name:</strong> {invoiceData.clientInfo.lname}
                </Text>
                <Text size="lg">
                  <strong>Company Name:</strong>{" "}
                  {invoiceData.clientInfo.company_name}
                </Text>
                <Text size="lg">
                  <strong>Mailing Address:</strong>{" "}
                  {invoiceData.clientInfo.mailing_address}
                </Text>
                <Text size="lg">
                  <strong>Phone Number:</strong>{" "}
                  {invoiceData.clientInfo.phone_number}
                </Text>
              </div>
            )}

            {/* Billing From Section (Company Info) */}
            {invoiceData && invoiceData.companyInfo && (
              <div className="marginBottom">
                <Title order={3}>Billing From</Title>
                <hr></hr>
                <Text size="lg">
                  <strong>Company Name:</strong>{" "}
                  {invoiceData.companyInfo.company_name}
                </Text>
                <Text size="lg">
                  <strong>Company Id:</strong>{" "}
                  {invoiceData.companyInfo.company_id}
                </Text>
                <Text size="lg">
                  <strong>Mailing Address:</strong>{" "}
                  {invoiceData.companyInfo.mailing_address}
                </Text>
                <Text size="lg">
                  <strong>Phone Number:</strong>{" "}
                  {invoiceData.companyInfo.phone_number}
                </Text>
              </div>
            )}

            {/* Services Section */}
            <Title order={3}>Services</Title>
            <hr></hr>
            {invoiceData && (
              <>
                <table className="table">
                  <thead>
                    <tr>
                      <th className="th">Service Type</th>
                      <th className="th">Cost</th>
                      <th className="th">Service Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoiceData.services.map((service, index) => (
                      <tr key={index}>
                        <td className="td">{service.service_type}</td>
                        <td className="td">${service.cost}</td>
                        <td className="td">{service.service_date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {/* Additional Details Section */}
                <div className="additionalDetails">
                  <Text size="lg">
                    <strong>Date Created: </strong>
                    {invoiceData.invoice.date_created}
                  </Text>
                  <Text size="lg">
                    <strong>Due Date:</strong> {invoiceData.invoice.due_date}
                  </Text>
                  <Text size="lg">
                    <strong>Total: </strong>$
                    {calculateTotal(invoiceData.services)}
                  </Text>
                  <strong>Paid: </strong>
                  <span
                    style={{
                      color: invoiceData.invoice.paid ? "green" : "red",
                      fontWeight: "bold",
                    }}
                  >
                    {invoiceData.invoice.paid ? "Yes" : "No"}
                  </span>
                </div>
              </>
            )}
            {/* Conditional display of pay invoice button on unpaid invoices only */}
            {invoiceData && !invoiceData.invoice.paid && (
              <button className="pay-button" onClick={handlePayInvoice}>
                Pay Invoice
              </button>
            )}
          </Paper>
        </GridCol>
      </Grid>
    </Container>
  );
};

export default Invoice;
