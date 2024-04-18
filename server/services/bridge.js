// bridge.js

const db = require("./db");

async function registerUser(userDetails) {
  console.log("Received user details:", userDetails);

  const {
    email,
    password,
    first_name,
    last_name,
    company_name,
    mailing_address,
    phone_number,
  } = userDetails;

  try {
    await db.beginTransaction();

    // Generate random user_id and company_id
    const user_id = generateRandomIntegerId();
    const company_id = generateRandomIntegerId();

    // Insert the user into the database using parameterized query
    const insertUserResult = await db.query(
      "INSERT INTO user (fname, lname, email, hashedpass, user_id, company_id) VALUES (?, ?, ?, ?, ?, ?)",
      [first_name, last_name, email, password, user_id, company_id]
    );

    // Insert the company into the database using parameterized query
    const insertCompanyResult = await db.query(
      "INSERT INTO company (company_name, mailing_address, phone_number, company_id) VALUES (?, ?, ?, ?)",
      [company_name, mailing_address, phone_number, company_id]
    );

    // Insert user statistics into the database using parameterized query
    const insertCompanyStats = await db.query(
      "INSERT INTO account_statistics (company_id, number_of_invoices, total_sales, total_clients) VALUES (?, ?, ?, ?)",
      [company_id, 0, 0, 0]
    );

    await db.commit();

    if (
      insertUserResult.affectedRows === 1 &&
      insertCompanyResult.affectedRows === 1 &&
      insertCompanyStats.affectedRows === 1
    ) {
      return {
        success: true,
        message: "User registration successful",
      };
    } else {
      return {
        success: false,
        message: "User registration failed",
      };
    }
  } catch (error) {
    await db.rollback();

    console.error("Error during user registration:", error);
    return {
      success: false,
      message: "User registration failed",
      error: error.message,
    };
  }
}

async function loginUser(userCredentials) {
  console.log("Received user credentials:", userCredentials);
  const { email, password } = userCredentials;

  try {
    // Fetch user details from the database based on the provided email using parameterized query
    const userQueryResult = await db.query(
      "SELECT user.*, company.company_id FROM user LEFT JOIN company ON user.company_id = company.company_id WHERE email = ?",
      [email]
    );

    // Fetch team details from the database based on the provided username using parameterized query
    const teamQueryResult = await db.query(
      "SELECT company_staff.*, company.company_id FROM company_staff LEFT JOIN company ON company_staff.company_id = company.company_id WHERE username = ?",
      [email]
    );

    if (userQueryResult.length === 0 && teamQueryResult.length === 0) {
      // User not found
      return {
        success: false,
        error: "Login failed. User not found.",
      };
    }

    if (userQueryResult.length !== 0) {
      // If user was found, try password matching with them first
      const user = userQueryResult[0];

      // Compare the provided password with the password from the database
      if (password === user.hashedpass) {
        // Passwords match, login successful
        const userAuthToken = generateAuthToken(user);
        return {
          success: true,
          token: userAuthToken,
          isUser: true,
          message: "Login successful",
          user: {
            fname: user.fname,
            lname: user.lname,
            email: user.email,
            user_id: user.user_id,
            company_id: user.company_id,
            mailing_address: user.mailing_address,
            phone_number: user.phone_number,
          },
        };
      } else {
        // Incorrect password for the user
        return {
          success: false,
          error: "Login failed. Incorrect password.",
        };
      }
    } else {
      // Team member must have been found by this point
      // Try logging in with team member instead
      const team = teamQueryResult[0];

      // Compare the provided password with the password from the database
      if (password === team.hashedpass) {
        // Passwords match, login successful
        const teamAuthToken = generateAuthToken(team);
        return {
          success: true,
          token: teamAuthToken,
          isUser: false,
          message: "Login successful",
          user: {
            fname: team.username,
            user_id: team.user_id,
            company_id: team.company_id,
          },
        };
      } else {
        // Incorrect password for the team member
        return {
          success: false,
          error: "Login failed. Incorrect password.",
        };
      }
    }
  } catch (error) {
    console.error("Error during user login:", error);
    return {
      success: false,
      message: "Login failed",
      error: error.message,
    };
  }
}

// Function to generate a random 10-digit integer ID
function generateRandomIntegerId() {
  return Math.floor(Math.random() * 100000) + 1;
}

// Function to generate an authentication token
function generateAuthToken(user) {
  // You can use a token library like JWT here
  // For simplicity, let's just concatenate user_id and a secret key
  return `${user.user_id}_yourSecretKey`;
}

async function createInvoice({ invoiceData, servicesData, clientData }) {
  console.log("Received invoice data:", invoiceData);

  try {
    await db.beginTransaction();

    // Insert services into the database
    for (const service of servicesData) {
      await db.query(
        `INSERT INTO service (invoice_id, service_type, cost, service_date) VALUES (?, ?, ?, ?)`,
        [
          service.invoice_id,
          service.service_type,
          service.cost,
          service.service_date,
        ]
      );
    }

    // Insert the client into the database only if unique to the company
    const insertClientResult = await db.query(
      `INSERT INTO client (client_id, created_by_company_id, fname, lname, company_name, mailing_address, phone_number) 
      SELECT ?, ?, ?, ?, ?, ?, ? 
      WHERE NOT EXISTS (
        SELECT 1 
        FROM client 
        WHERE created_by_company_id = ? AND fname = ? AND lname = ? AND company_name = ? AND mailing_address = ? AND phone_number = ?
      )`,
      [
        clientData.client_id,
        clientData.created_by_company_id,
        clientData.fname,
        clientData.lname,
        clientData.company_name,
        clientData.mailing_address,
        clientData.phone_number,
        clientData.created_by_company_id, // Duplicate parameters for WHERE clause
        clientData.fname,
        clientData.lname,
        clientData.company_name,
        clientData.mailing_address,
        clientData.phone_number,
      ]
    );

    if (insertClientResult.affectedRows === 0) {
      // Client with same details exists, update clientData.client_id to match existing record
      const existingClient = await db.query(
        `SELECT client_id
        FROM client 
        WHERE created_by_company_id = ? 
        AND fname = ? 
        AND lname = ? 
        AND company_name = ? 
        AND mailing_address = ? 
        AND phone_number = ?`,
        [
          clientData.created_by_company_id,
          clientData.fname,
          clientData.lname,
          clientData.company_name,
          clientData.mailing_address,
          clientData.phone_number,
        ]
      );

      // Update clientData.client_id with the existing client_id from the database
      clientData.client_id = existingClient[0].client_id;
      // Update invoice.client_id as well (But I guess FDIL removed this, so I won't need to update it once we merge)
      invoiceData.client_id = existingClient[0].client_id;
      console.log("Updated client_id to match the id in the database.");
    }

    // Insert the invoice into the database
    const insertInvoiceResult = await db.query(
      `INSERT INTO invoice (invoice_id, invoice_title, created_by_company, date_created, due_date, client_id, paid) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        invoiceData.invoice_id,
        invoiceData.invoice_title,
        invoiceData.created_by_company,
        invoiceData.date_created,
        invoiceData.due_date,
        invoiceData.client_id,
        invoiceData.paid,
      ]
    );

    // add 1 to all company's number of invoices and get the number of clients
    const updateCompanyStatsResult = await db.query(
      "UPDATE account_statistics " +
        "SET number_of_invoices = number_of_invoices+1, total_clients = " + //Made it so it counts clients from DB. This
        "(SELECT COUNT(*) " + //avoids double counting when the same client is used
        "FROM client " +
        "WHERE created_by_company_id = ?) " +
        "WHERE company_id = ?",
      [invoiceData.created_by_company, invoiceData.created_by_company]
    );

    await db.commit();

    if (
      insertInvoiceResult.affectedRows === 1 &&
      insertClientResult.affectedRows === 1 &&
      updateCompanyStatsResult.affectedRows === 1
      // Add any additional checks for services if needed
    ) {
      return {
        success: true,
        message: "Invoice creation successful",
      };
    } else {
      return {
        success: false,
        message: "Invoice creation failed",
      };
    }
  } catch (error) {
    await db.rollback();

    console.error("Error during invoice creation:", error);
    return {
      success: false,
      message: "Invoice creation failed",
      error: error.message,
    };
  }
}


async function getInvoice(invoice_id) {
  console.log("Received request for invoice_id:", invoice_id);

  try {
    // Fetch invoice details from the database based on the provided invoice_id
    const invoiceQueryResult = await db.query(
      "SELECT * FROM invoice WHERE invoice_id = ?",
      [invoice_id]
    );

    if (invoiceQueryResult.length === 0) {
      return {
        success: false,
        message: "Invoice not found",
      };
    }

    const invoice = invoiceQueryResult[0];

    // Fetch services associated with the invoice_id
    const servicesQueryResult = await db.query(
      "SELECT * FROM service WHERE invoice_id = ?",
      [invoice_id]
    );

    // Fetch client data details
    const clientQueryResult = await db.query(
      "SELECT client.* " +
        "FROM invoice LEFT JOIN client ON invoice.client_id = client.client_id " +
        "WHERE invoice.client_id = ?",
      [invoice.client_id]
    );

    // Fetch company info
    const companyQueryResult = await db.query(
      "SELECT company.* " +
        "FROM invoice LEFT JOIN company " +
        "ON created_by_company = company_id " +
        "WHERE company_id = ?",
      [invoice.created_by_company]
    );

    // Combine invoice, services, client, and company data into a single object
    return {
      success: true,
      message: "Invoice data fetched successfully",
      data: {
        invoice: {
          ...invoice, // Include all fields from the invoice table
        },
        clientInfo: {
          client_id: clientQueryResult[0].client_id,
          created_by_company_id: clientQueryResult[0].created_by_company_id,
          fname: clientQueryResult[0].fname,
          lname: clientQueryResult[0].lname,
          company_name: clientQueryResult[0].company_name,
          mailing_address: clientQueryResult[0].mailing_address,
          phone_number: clientQueryResult[0].phone_number,
        },
        companyInfo: {
          company_name: companyQueryResult[0].company_name,
          company_id: companyQueryResult[0].company_id,
          mailing_address: companyQueryResult[0].mailing_address,
          phone_number: companyQueryResult[0].phone_number,
        },
        services: servicesQueryResult,
      },
    };
  } catch (error) {
    console.error("Error during invoice data retrieval:", error);
    return {
      success: false,
      message: "Error fetching invoice data",
      error: error.message,
    };
  }
}

async function payInvoice(invoiceId) {
  try {
    // Update the paid status in the database
    const updateInvoiceResult = await db.query(
      "UPDATE invoice SET paid = true WHERE invoice_id = ?",
      [invoiceId]
    );
    // Update total_sales stat of company's statistics

    // first get total sales and company id
    const getInvoiceTotalSale = await db.query(
      "SELECT created_by_company, SUM(cost) AS 'total_cost' " +
        "FROM invoice LEFT JOIN service " +
        "ON invoice.invoice_id = service.invoice_id " +
        "WHERE invoice.invoice_id = ? " +
        "GROUP BY created_by_company",
      [invoiceId]
    );

    console.log("Invoice Sale: ", getInvoiceTotalSale[0]);

    // we can use to update
    const updateCompanyTotalSales = await db.query(
      "UPDATE account_statistics " +
        "SET total_sales = total_sales + ? " +
        "WHERE company_id = ?",
      [
        getInvoiceTotalSale[0].total_cost,
        getInvoiceTotalSale[0].created_by_company,
      ]
    );

    if (
      updateInvoiceResult.affectedRows === 1 &&
      updateCompanyTotalSales.affectedRows === 1
    ) {
      return {
        success: true,
        message: "Invoice payment successful",
      };
    } else {
      return {
        success: false,
        message: "Invoice payment failed. Invoice not found.",
      };
    }
  } catch (error) {
    console.error("Error during invoice payment:", error);
    return {
      success: false,
      message: "Invoice payment failed",
      error: error.message,
    };
  }
}

async function listInvoices(created_by_company) {
  try {
    // Fetch invoices based on the provided company ID
    const invoicesQueryResult = await db.query(
      "SELECT * FROM invoice WHERE created_by_company = ?",
      [created_by_company]
    );

    return {
      success: true,
      message: "Invoices fetched successfully",
      data: invoicesQueryResult,
    };
  } catch (error) {
    console.error("Error listing invoices:", error.message);
    return {
      success: false,
      message: "Error listing invoices",
      error: error.message,
    };
  }
}

async function getClients(company_id) {
  try {
    const invoicesQueryResult = await db.query(
      "SELECT DISTINCT client.* " +
        "FROM invoice LEFT JOIN client ON invoice.client_id = client.client_id " +
        "LEFT JOIN company ON created_by_company = company_id " +
        "WHERE created_by_company = ?",
      [company_id]
    );

    return {
      success: true,
      message: "Clients of a company fetched successfully",
      data: invoicesQueryResult,
    };
  } catch (error) {
    console.error("Error getting clients of a company:", error.message);
    return {
      success: false,
      message: "Error getting clients of a company",
      error: error.message,
    };
  }
}

async function updateUserEmail(user_id, email) {
  try {
    const updateUserEmailResult = await db.query(
      "UPDATE user SET email = ? WHERE user_id = ?",
      [email, user_id]
    );

    const updateTeamEmailResult = await db.query(
      "UPDATE company_staff SET username = ? WHERE user_id = ?",
      [email, user_id]
    );

    if (
      updateUserEmailResult.affectedRows === 1 ||
      updateTeamEmailResult.affectedRows === 1
    ) {
      return {
        success: true,
        message: "User email update successful",
      };
    } else {
      return {
        success: false,
        message: "User email update failed. User not found.",
      };
    }
  } catch (error) {
    console.error("Error updating user email:", error.message);
    return {
      success: false,
      message: "Error updating user email",
      error: error.message,
    };
  }
}

async function updateUserPassword(user_id, password) {
  try {
    const updateUserPasswordResult = await db.query(
      "UPDATE user SET hashedpass = ? WHERE user_id = ?",
      [password, user_id]
    );

    const updateTeamPasswordResult = await db.query(
      "UPDATE company_staff SET hashedpass = ? WHERE user_id = ?",
      [password, user_id]
    );

    if (
      updateUserPasswordResult.affectedRows === 1 ||
      updateTeamPasswordResult.affectedRows === 1
    ) {
      return {
        success: true,
        message: "User password update successful",
      };
    } else {
      return {
        success: false,
        message: "User password update failed. User not found.",
      };
    }
  } catch (error) {
    console.error("Error updating user password:", error.message);
    return {
      success: false,
      message: "Error updating user password",
      error: error.message,
    };
  }
}

async function deleteUser(user_id) {
  console.log("Received request to delete user with id:", user_id);
  try {
    const deleteUserRequest = await db.query(
      "DELETE FROM user WHERE user_id = ?",
      [user_id]
    );

    if (deleteUserRequest.affectedRows === 1) {
      console.log(`Removed user with id: ${user_id}`);
      return {
        success: true,
        message: "User deleted",
      };
    }
    console.log(`Failed to delete as unable to find user with id: ${user_id}`);
    return {
      success: false,
      message: "User not found",
    };
  } catch (error) {
    console.error("Error removing user:", error.message);
    return {
      success: false,
      message: "Error deleting user",
      error: error.message,
    };
  }
}

async function listTeamMembers(companyId) {
  try {
    const teamMembersQueryResult = await db.query(
      "SELECT * FROM company_staff WHERE company_id = ?",
      [companyId]
    );

    return {
      success: true,
      message: "Team members fetched successfully",
      data: teamMembersQueryResult,
    };
  } catch (error) {
    console.error("Error listing team members:", error.message);
    return {
      success: false,
      message: "Error listing team members",
      error: error.message,
    };
  }
}

async function addTeamMember({ company_id, username, hashedpass }) {
  try {
    await db.beginTransaction();

    const user_id = generateRandomIntegerId();

    const insertTeamMemberResult = await db.query(
      "INSERT INTO company_staff (company_id, user_id, username, hashedpass) VALUES (?, ?, ?, ?)",
      [company_id, user_id, username, hashedpass]
    );

    await db.commit();

    if (insertTeamMemberResult.affectedRows === 1) {
      return {
        success: true,
        message: "Team member added successfully",
      };
    } else {
      return {
        success: false,
        message: "Error adding team member",
      };
    }
  } catch (error) {
    await db.rollback();

    console.error("Error adding team member:", error);
    return {
      success: false,
      message: "Error adding team member",
      error: error.message,
    };
  }
}

async function deleteTeamMember(user_id) {
  try {
    const deleteTeamMemberResult = await db.query(
      "DELETE FROM company_staff WHERE user_id = ?",
      [user_id]
    );

    if (deleteTeamMemberResult.affectedRows === 1) {
      return {
        success: true,
        message: "Team member deleted successfully",
      };
    } else {
      return {
        success: false,
        message: "Error deleting team member. User not found.",
      };
    }
  } catch (error) {
    console.error("Error deleting team member:", error);
    return {
      success: false,
      message: "Error deleting team member",
      error: error.message,
    };
  }
}

async function getStatistics(company_id) {
  console.log("Got request for getting statistics for company:", company_id);

  try {
    const getStatsQuery = await db.query(
      "SELECT * FROM account_statistics WHERE company_id = ?",
      [company_id]
    );

    return {
      success: true,
      message: "Statistics of company fetched successfully",
      data: getStatsQuery,
    };
  } catch (error) {
    console.error("Error getting company stats:", error.message);
    return {
      success: false,
      message: "Error getting company stats",
      error: error.message,
    };
  }
}

async function checkPassword(user_id, password) {
  console.log("Checking if entered password matches saved password in server");
  try {
    const userQueryResult = await db.query(
      "SELECT hashedpass FROM user WHERE user_id = ?",
      [user_id]
    );

    const teamQueryResult = await db.query(
      "SELECT hashedpass FROM company_staff WHERE user_id = ?",
      [user_id]
    );

    if (userQueryResult.length === 0 && teamQueryResult.length === 0) {
      return false;
    }

    if (userQueryResult.length !== 0) {
      const storedUserPassword = userQueryResult[0].hashedpass;

      if (password === storedUserPassword) {
        return true;
      } else {
        return false;
      }
    } else {
      const storedTeamPassword = teamQueryResult[0].hashedpass;

      if (password === storedTeamPassword) {
        return true;
      } else {
        return false;
      }
    }
  } catch (error) {
    console.error("Error during old password check:", error.message);
    throw new Error("Error during old password check");
  }
}

module.exports = {
  registerUser,
  loginUser,
  createInvoice,
  getInvoice,
  payInvoice,
  listInvoices,
  getClients,
  updateUserEmail,
  updateUserPassword,
  checkPassword,
  deleteUser,
  getStatistics,
  listTeamMembers,
  addTeamMember,
  deleteTeamMember
};
