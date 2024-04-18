// App.js

// Imports
import React from "react";
import { MantineProvider, DEFAULT_THEME } from "@mantine/core";
import "@mantine/core/styles.css";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import { AuthProvider } from "./components/AuthContext";
import Login from "./components/Login";
import Register from "./components/Register";
import Dashboard from "./components/Dashboard";
import CreateInvoice from "./components/Create-invoice";
import Invoice from "./components/Invoice"; // Import the Invoice component
import Settings from "./components/Settings";
import TeamMember from "./components/TeamMember";

// Defining custom theme
const customTheme = {
  ...DEFAULT_THEME,
};

//
const App = () => {
  return (
    // Entire application now will be in custom theme
    <MantineProvider theme={customTheme}>
      <AuthProvider>
        {/* Setting up routhing using React Router */}
        <Router>
          <div>
            <Switch>
              {/* Route for login */}
              <Route path="/login" component={Login} />
              {/* Route for account registration */}
              <Route path="/register" component={Register} />
              {/* Route for dashboard */}
              <Route path="/dashboard" component={Dashboard} />
              {/* Route for invoice creation */}
              <Route path="/create-invoice" component={CreateInvoice} />
              {/* Add the new route for invoice details */}
              <Route path="/invoice/:invoice_id" component={Invoice} />
              {/* Route for account settings */}
              <Route path="/settings" component={Settings} />
              {/* account for team management */}
              <Route path="/team-members" component={TeamMember} />
            </Switch>
          </div>
        </Router>
      </AuthProvider>
    </MantineProvider>
  );
};

export default App;
