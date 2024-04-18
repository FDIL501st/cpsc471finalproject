// index.js
import React from "react";
import ReactDOM from "react-dom";
import { MantineProvider } from "@mantine/core";
import App from "./App";
import "@mantine/core/styles.css"; // Include Mantine global styles

ReactDOM.render(
  <React.StrictMode>
    <MantineProvider>
      <App />
    </MantineProvider>
  </React.StrictMode>,
  document.getElementById("root")
);
