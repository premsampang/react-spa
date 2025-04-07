const multer = require("multer");
const nodemailer = require("nodemailer");
const cors = require("cors");
require("dotenv").config();
const path = require('path');

const express = require('express');
const app = express();
const port = 5000;
app.use(cors());
app.use(express.json());

const upload = multer({ storage: multer.memoryStorage() });

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: 'premrai@idealhha.com', 
    pass: 'pdlw tclq jfwr uwof', 
  },
});

app.post("/send-email", upload.single("pdf"), async (req, res) => {
  try {
    const emailOptions = {
      from: process.env.EMAIL,
      to: "premrai@idealhha.com", // Replace with your email
      subject: "New Timesheet Submission",
      text: "Please find the attached form submission.",
      attachments: [
        {
          filename: "form-submission.pdf",
          content: req.file.buffer,
          contentType: "application/pdf",
        },
      ],
    };

    await transporter.sendMail(emailOptions);
    res.status(200).send("Email sent successfully!");
  } catch (error) {
    console.error(error);
    res.status(500).send("Error sending email.");
  }
});

app.listen(5000, () => {
  console.log("Server running on port 5000");
});
app.get('/', (req, res) => {
  res.send('Server is running!');
});
app.use(express.static(path.join(__dirname, 'build')));
