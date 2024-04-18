// ClientDropDownMenu.js

// Imports
import React, { useEffect, useState } from "react";
// import Dropdown from 'react-bootstrap/Dropdown';
// import DropdownButton from 'react-bootstrap/DropdownButton';

// Component for selecting an existing client from a dropdown menu
const ClientDropDown = ({ company_id, setExistingClientDetails }) => {
  // State to hold list of existing clients
  const [existingClients, setExistingClients] = useState([]);
  // State that holds selected client index, set to null as default. This will be used to see if no client is selected later on
  const [selectedClientIndex, setSelectedClientIndex] = useState(null);

  // Fetch existing clients from the database based on company_id
  useEffect(() => {
    const getExistingClients = async (company_id) => {
      try {
        // fetch results from server
        const getClientResponse = await fetch(
          `http://localhost:3000/getClients/${company_id}`
        );

        if (getClientResponse.ok) {
          const getClientResponseJson = await getClientResponse.json();
          console.log("Success in fetch of getClients:", getClientResponseJson);
          // return response data
          setExistingClients(getClientResponseJson.data);
        }
      } catch (error) {
        console.error("getClients fetch fail:", error.message);
      }
    };
    getExistingClients(company_id);
  }, [company_id]); //  get existing clients at first render and whenever company_id changes

  // const handleClick = (index) => {
  //     setExistingClientDetails(existingClients[index]);
  // };

  // Handles selection change in dropdown menu
  const handleSelectOption = (event) => {
    const index = event.target.value;

    // Do something with the selected index
    console.log("Selected Index:", index);
    setSelectedClientIndex(index); // Updates selected client index
    // Use the index to access the corresponding client in the existingClients array
    setExistingClientDetails(existingClients[index]);
  };

  return (
    <div>
      {/* Dropdown menu heading */}
      <h4>Select Existing Client</h4>
      {/* Display all existing clients when in menu and display the selected client when clicked */}
      {/* If no client is selected, value is the clientIndex, otherwise value is "" */}
      <select
        onChange={handleSelectOption}
        value={selectedClientIndex !== null ? selectedClientIndex : ""}
      >
        {/* The "" option, makes first option in list disabled stock text below */}
        <option value="" disabled>
          Select a client
        </option>
        {/* Display the company's clients */}
        {existingClients.map((client, index) => (
          <option key={index} value={index}>
            {client.fname + " " + client.lname}
          </option>
        ))}
      </select>
    </div>
  );
};

export default ClientDropDown;
