// Return.js

// This defines the return button component to return back to Dashboard

import React from "react";
import { Link } from "react-router-dom";
import "../styling/teamMember.css";

const Return = () => {
  return (
    <Link to="../Dashboard" className="link-back">
      ← Return
    </Link>
  );
};

export default Return;
