// createInvoice.js

// Imports
import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import {
  Button,
  Container,
  Grid,
  GridCol,
  Paper,
  TextInput,
  Title,
} from "@mantine/core";
import { useAuth } from "./AuthContext"; // Import the useAuth hook
import "./styling/dashboard.css"; // Import existing styles
import "./styling/createInvoice.css"; // Import the new styles
import "./pageElements/ClientDropDownMenu";
import ClientDropDownMenu from "./pageElements/ClientDropDownMenu";
import Return from "./pageElements/Return";

// Move the randomId function outside the component to ensure consistency
// Generates a random ID for invoices
const randomId = () => Math.floor(10000 + Math.random() * 90000);

// Function to create and validate invoice data
const CreateInvoice = () => {
  const history = useHistory();
  const { user } = useAuth(); // Retrieves user information using "useAuth"

  // Variables required from user in create invoice form
  const [services, setServices] = useState([{ type: "", cost: 0, date: "" }]);
  const [invoiceTitle, setInvoiceTitle] = useState("");
  const [clientDetails, setClientDetails] = useState({
    firstName: "",
    lastName: "",
    companyName: "",
    mailingAddress: "",
    dueDate: "",
    phoneNumber: "",
  });
  const [incompleteFields, setIncompleteFields] = useState(false);

  // Auto-fills the existing clients information
  const fillExistingClientDetails = (client) => {
    // no fields to input, set everything empty
    if (client === undefined || client === null) {
      setClientDetails({
        firstName: "",
        lastName: "",
        companyName: "",
        mailingAddress: "",
        dueDate: "",
        phoneNumber: "",
      });
    } else {
      setClientDetails({
        // Updates fields based on selected client
        firstName: client.fname,
        lastName: client.lname,
        companyName: client.company_name,
        mailingAddress: client.mailing_address,
        dueDate: "", // Keep clear as this is a new invoice with new date
        phoneNumber: client.phone_number,
      });
    }
  };

  // Adds an extra service to the invoice
  const addService = () => {
    setServices([...services, { type: "", cost: 0, date: "" }]);
  };

  // Removes a service from the form
  const removeService = (index) => {
    const updatedServices = services.filter((_, i) => i !== index);
    setServices(updatedServices);
  };

  // Handles changes/inputs in the services form
  const handleServiceChange = (index, key, value) => {
    const updatedServices = [...services];
    updatedServices[index][key] = value;
    setServices(updatedServices);
  };

  // Handles changes/inputs in the invoice title
  const handleInvoiceTitleChange = (value) => {
    setInvoiceTitle(value);
  };

  // Handles changes/inputs in the client details
  const handleClientDetailsChange = (key, value) => {
    setClientDetails({
      ...clientDetails,
      [key]: value,
    });
  };

  // Validates all input fields in the form
  const validateInputs = () => {
    // Check if all mandatory fields are filled
    const clientDetailsFields = [
      clientDetails.firstName,
      clientDetails.lastName,
      //clientDetails.invoiceTitle,
      clientDetails.companyName,
      clientDetails.phoneNumber,
      clientDetails.dueDate,
      clientDetails.mailingAddress,
    ];

    // Checks to make sure they are not empty
    const isClientDetailsValid = clientDetailsFields.every(
      (field) => field !== ""
    );

    // Checks to make sure service fields are not empty
    const isServicesValid = services.every(
      (service) =>
        service.type.trim() !== "" &&
        service.cost !== "" &&
        service.date.trim() !== ""
    );

    // Boolean value if all required fields are not empty
    const isValid = isClientDetailsValid && isServicesValid;
    // If form is invalid, set incompleteFields to be True
    setIncompleteFields(!isValid);

    return isValid;
  };

  // Function to construct invoice object based on the invoice data created above
  const constructInvoiceObject = () => {
    // Get the current date
    const currentDate = new Date().toISOString().split("T")[0];

    // Use the same IDs for client and invoice
    const clientId = randomId();
    const invoiceId = randomId();

    // Use the invoice_title from the state
    // Construct the invoice object
    return {
      invoice: {
        invoice_id: invoiceId,
        invoice_title: invoiceTitle, // Use the invoice_title variable
        created_by_company: user.company_id,
        date_created: currentDate,
        due_date: clientDetails.dueDate,
        client_id: clientId,
        paid: false,
      },
      services: services.map((service) => ({
        invoice_id: invoiceId,
        service_type: service.type,
        cost: service.cost,
        service_date: service.date,
      })),
      client: {
        client_id: clientId,
        created_by_company_id: user.company_id,
        fname: clientDetails.firstName,
        lname: clientDetails.lastName,
        company_name: clientDetails.companyName,
        mailing_address: clientDetails.mailingAddress,
        phone_number: clientDetails.phoneNumber,
      },
    };
  };

  // Function to handle creating the invoice when form is submitted
  const handleCreateButtonClick = async () => {
    if (validateInputs()) {
      try {
        const invoiceObject = constructInvoiceObject();

        const response = await fetch("http://localhost:3000/invoice", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(invoiceObject),
        });

        if (response.ok) {
          const result = await response.json();
          console.log("Server Response:", result);

          // Assuming you have access to `history` from the react-router-dom
          // Redirect to the invoice after successful submission using the invoice_id
          history.push(`/invoice/${invoiceObject.invoice.invoice_id}`);
        } else {
          console.error("Server Error:", response.status);
        }
      } catch (error) {
        console.error("Error during fetch:", error.message);
      }
    }
  };

  // Returns the HTML page using the variables and data defined above
  return (
    <Container size="xl" className="dashboard-container">
      {/* Return to dashboard button */}
      <Return />
      <Grid>
        <GridCol span={12} md={11} className="main-content-col">
          <Title order={1} orderMd={2} orderLg={2}>
            {/* Page title */}
            Create Invoice
          </Title>
          <GridCol span={12}>
            {/* Invoice Title */}
            <p className="title-section">Invoice Details</p>
            <Paper className="invoice-card">
              <div className="login-input login-spacing">
                {/* Invoice title input */}
                <TextInput
                  label="Invoice Title"
                  placeholder="Invoice #24"
                  style={{ width: "50%" }}
                  required
                  value={invoiceTitle}
                  onChange={(event) =>
                    handleInvoiceTitleChange(event.target.value)
                  }
                />
              </div>
            </Paper>
          </GridCol>
          <GridCol span={12} md={8}>
            {/* Existing clients dropdown menu, auto-fills client info */}
            <ClientDropDownMenu
              company_id={user.company_id}
              setExistingClientDetails={fillExistingClientDetails}
            />
          </GridCol>
          <GridCol span={12}>
            <Paper className="client-card">
              {/* Client Details (Auto-filled if existing client selected) */}
              <p className="title-section">Client Details</p>
              <div className="client-section">
                <Grid>
                  {/* Client details input sections */}
                  <GridCol span={12} md={6}>
                    <TextInput
                      label="First Name"
                      value={clientDetails.firstName}
                      onChange={(event) =>
                        handleClientDetailsChange(
                          "firstName",
                          event.target.value
                        )
                      }
                      style={{ width: "30%" }}
                      required
                    />
                  </GridCol>
                  <GridCol span={12} md={6}>
                    <TextInput
                      label="Last Name"
                      value={clientDetails.lastName}
                      onChange={(event) =>
                        handleClientDetailsChange(
                          "lastName",
                          event.target.value
                        )
                      }
                      style={{ width: "30%" }}
                      required
                    />
                  </GridCol>
                  <GridCol span={12} md={8}>
                    <TextInput
                      label="Company Name"
                      value={clientDetails.companyName}
                      onChange={(event) =>
                        handleClientDetailsChange(
                          "companyName",
                          event.target.value
                        )
                      }
                      style={{ width: "30%" }}
                      required
                    />
                  </GridCol>
                  <GridCol span={12} md={4}>
                    <TextInput
                      label="Phone Number"
                      value={clientDetails.phoneNumber}
                      onChange={(event) =>
                        handleClientDetailsChange(
                          "phoneNumber",
                          event.target.value
                        )
                      }
                      style={{ width: "30%" }}
                      required
                    />
                  </GridCol>
                  <GridCol span={12}>
                    <TextInput
                      label="Mailing Address"
                      value={clientDetails.mailingAddress}
                      onChange={(event) =>
                        handleClientDetailsChange(
                          "mailingAddress",
                          event.target.value
                        )
                      }
                      style={{ width: "50%" }}
                      required
                    />
                  </GridCol>
                  <GridCol span={12}>
                    <TextInput
                      label="Due Date"
                      placeholder="DD/MM/YYYY"
                      value={clientDetails.dueDate}
                      onChange={(event) =>
                        handleClientDetailsChange("dueDate", event.target.value)
                      }
                      style={{ width: "10%" }}
                      required
                    />
                  </GridCol>
                </Grid>
              </div>
            </Paper>
          </GridCol>
          {/* Service(s) Offered */}
          <GridCol span={12}>
            <Paper className="service-card">
              <p className="title-section">Services</p>
              {services.map((service, index) => (
                <Paper key={index} className="service-section-card">
                  <div className="service-section">
                    {/* Service type input */}
                    <TextInput
                      label="Service Type"
                      value={service.type}
                      placeholder="Software Development"
                      onChange={(event) =>
                        handleServiceChange(index, "type", event.target.value)
                      }
                      style={{ width: "50%" }}
                      required
                    />
                    {/* Service cost input */}
                    <TextInput
                      label="Cost"
                      type="number"
                      value={service.cost}
                      onChange={(event) =>
                        handleServiceChange(index, "cost", event.target.value)
                      }
                      style={{ width: "15%" }}
                      required
                    />
                    {/* Service date input */}
                    <TextInput
                      label="Service Date"
                      value={service.date}
                      placeholder="DD/MM/YYYY"
                      onChange={(event) =>
                        handleServiceChange(index, "date", event.target.value)
                      }
                      style={{ width: "30%" }}
                      required
                    />
                    {/* Conditonal view of "remove service" button */}
                    {services.length > 1 && (
                      // If there is more than 1 service card, dont display remove button
                      <Button
                        onClick={() => removeService(index)}
                        className="remove-service-btn"
                      >
                        X
                      </Button>
                    )}
                  </div>
                </Paper>
              ))}
              {/* Add service button */}
              <Button onClick={addService} className="add-service-btn">
                + Add Service
              </Button>
            </Paper>
          </GridCol>
          {/* Validate form to ensure all required fields are non-empty */}
          {incompleteFields && (
            <p style={{ fontWeight: "bold", color: "red", marginTop: "10px" }}>
              All fields are mandatory. Please fill in all details.
            </p>
          )}
          {/* Create invoice button */}
          <Button
            onClick={handleCreateButtonClick}
            className="create-btn button-submit"
          >
            ↳ Create
          </Button>
        </GridCol>
      </Grid>
    </Container>
  );
};

export default CreateInvoice;
