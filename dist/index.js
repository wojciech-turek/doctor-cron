"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const cron_1 = require("cron");
require("dotenv/config");
const resend_1 = require("resend");
// Define the API URL and headers
const apiUrl = "https://e-rejestracja.mp.pl/api/FirstAvailableTerms";
const headers = {
    "Content-Type": "application/x-www-form-urlencoded",
};
// Define the payload
const payload = new URLSearchParams({
    Url: "/api/FirstAvailableTerms",
    PracticeId: "273fb2e2-3e35-4c47-b241-fd6db0f859dd",
    EmployeeIds: "7aaed85a-aa08-4bf6-a1d8-2628be25546e",
    AfterDate: new Date().toISOString(),
    MaxTermsCount: "144",
    IsReceptionist: "true",
});
// Function to call the API and check the response
function checkApiAndSendEmail() {
    return __awaiter(this, void 0, void 0, function* () {
        if (!process.env.RESEND_API_KEY) {
            console.error("RESEND_API_KEY is not set.");
            return;
        }
        if (!process.env.RECIPIENT_EMAIL1 || !process.env.RECIPIENT_EMAIL2) {
            console.error("Recipients is not set.");
            return;
        }
        const resend = new resend_1.Resend(process.env.RESEND_API_KEY);
        try {
            const response = yield axios_1.default.post(apiUrl, payload, { headers });
            const data = response.data;
            if (Array.isArray(data) && data.length > 0) {
                console.log("Non-empty response, sending email...");
                yield resend.emails.send({
                    from: "Cron Doctor <onboarding@resend.dev>",
                    to: [process.env.RECIPIENT_EMAIL1, process.env.RECIPIENT_EMAIL2],
                    subject: "hello world",
                    text: "it works!",
                });
                console.log("Email sent successfully.");
            }
            else {
                console.log("Empty response, no email sent.");
            }
        }
        catch (error) {
            console.error("Error fetching data or sending email:", error);
        }
    });
}
// Schedule the script to run every 5 minutes
const job = new cron_1.CronJob("*/10 * * * *", checkApiAndSendEmail, null, true, "Europe/Warsaw");
job.start();
