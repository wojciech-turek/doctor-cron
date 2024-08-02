import axios from "axios";
import { CronJob } from "cron";
import "dotenv/config";
import { Resend } from "resend";

// Define the API URL and headers
const apiUrl = "https://e-rejestracja.mp.pl/api/FirstAvailableTerms";
const headers = {
  "Content-Type": "application/x-www-form-urlencoded",
};

// Define the payload
const payload = new URLSearchParams({
  Url: "/api/FirstAvailableTerms",
  PracticeId: "273fb2e2-3e35-4c47-b241-fd6db0f859dd",
  EmployeeIds: "e2bce552-5bd2-4fa5-8b16-925fd657dfbf",
  AfterDate: new Date().toISOString(),
  MaxTermsCount: "144",
  IsReceptionist: "true",
});

// Function to call the API and check the response
async function checkApiAndSendEmail() {
  if (!process.env.RESEND_API_KEY) {
    console.error("RESEND_API_KEY is not set.");
    return;
  }

  if (!process.env.RECIPIENT_EMAIL1 || !process.env.RECIPIENT_EMAIL2) {
    console.error("Recipients is not set.");
    return;
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  try {
    const response = await axios.post(apiUrl, payload, { headers });
    const data = response.data;

    if (Array.isArray(data) && data.length > 0) {
      console.log("Non-empty response, sending email...");

      await resend.emails.send({
        from: "Cron Doctor <notify@27chains.com>",
        to: [process.env.RECIPIENT_EMAIL1],
        subject: "Dostępne terminy w przychodni",
        text: data
          .map((term) => {
            return `Dostępny termin: ${term.Day.slice(0, 10)} ${term.StarTime}`;
          })
          .join("\n"),
      });

      console.log("Email sent successfully.");
    } else {
      console.log("Empty response, no email sent.");
    }
  } catch (error) {
    console.error("Error fetching data or sending email:", error);
  }
}

// Schedule the script to run every 5 minutes
const job = new CronJob(
  "*/1 * * * *",
  checkApiAndSendEmail,
  null,
  true,
  "Europe/Warsaw"
);
job.start();
