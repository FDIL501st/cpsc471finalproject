// index.js

const express = require("express");
const cors = require("cors");
const app = express();
const port = 3000;

const registrationRouter = require("./routes/register");
const loginRouter = require("./routes/login");
const invoiceRouter = require("./routes/createInvoice");
const getInvoiceRouter = require("./routes/getInvoice");
const payInvoiceRouter = require("./routes/payInvoice");
const listInvoicesRouter = require("./routes/listInvoices"); // Add this line
const getClientsRouter = require("./routes/getClients");
const updateUserRouter = require("./routes/updateUser");
const deleteUserRouter = require("./routes/deleteUser");
const getStatsRouter = require("./routes/getStatistics");
const listTeamMembersRouter = require("./routes/listTeamMember");
const addTeamMemberRouter = require("./routes/addTeamMember");
const deleteTeamMemberRouter = require("./routes/deleteTeamMember");
const checkPasswordRouter = require("./routes/checkPassword");
const { checkPassword } = require("./services/bridge");

app.use(cors());
app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);

app.get("/", (req, res) => {
  res.json({ message: "ok" });
});

app.use("/registration", registrationRouter);
app.use("/login", loginRouter);
app.use("/invoice", invoiceRouter);
app.use("/getInvoice", getInvoiceRouter);
app.use("/payInvoice", payInvoiceRouter);
app.use("/listInvoices", listInvoicesRouter);
app.use("/getClients", getClientsRouter);
app.use("/updateUser", updateUserRouter);
app.use("/deleteUser", deleteUserRouter);
app.use("/getStats", getStatsRouter);
app.use("/listTeamMembers", listTeamMembersRouter);
app.use("/addTeamMember", addTeamMemberRouter);
app.use("/deleteTeamMember", deleteTeamMemberRouter);
app.use("/checkPassword", checkPasswordRouter);

app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  console.error(err.message, err.stack);
  res.status(statusCode).json({ message: err.message });
  return;
});

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});
