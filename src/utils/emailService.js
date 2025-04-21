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
exports.sendEmail = void 0;
exports.generateAccountCreatedEmailHTML = generateAccountCreatedEmailHTML;
const nodemailer_1 = __importDefault(require("nodemailer"));
const _config_1 = require("@config");
const sendEmail = (to, subject, text, html) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log(_config_1.EMAIL_USER, _config_1.EMAIL_PASS);
        const transporter = nodemailer_1.default.createTransport({
            service: 'gmail', // Change this based on your email provider
            auth: {
                user: _config_1.EMAIL_USER, // Your email address
                pass: _config_1.EMAIL_PASS, // Your email password or app password
            },
        });
        const mailOptions = {
            from: _config_1.EMAIL_USER,
            to,
            subject,
            text,
        };
        if (html) {
            mailOptions.html = html;
        }
        yield transporter.sendMail(mailOptions);
        console.log(`📧 Email sent to ${to}`);
    }
    catch (error) {
        console.error('❌ Error sending email:', error);
    }
});
exports.sendEmail = sendEmail;
/**
 * Generates a beautiful HTML email for ERP account creation.
 */
function generateAccountCreatedEmailHTML(firstName, email, tempPassword) {
    return `
  <div style="background:#f5f7fa;padding:40px 0;font-family:'Segoe UI',Arial,sans-serif;">
    <div style="max-width:480px;margin:0 auto;background:#fff;border-radius:8px;box-shadow:0 2px 8px rgba(0,0,0,0.07);padding:32px;">
      <div style="text-align:center;margin-bottom:24px;">
        <img src="https://nexinventix.com/logo.png" alt="Nexinventix ERP" style="width:80px;margin-bottom:8px;">
        <h2 style="color:#2d3748;margin:0;">Welcome to Nexinventix ERP!</h2>
      </div>
      <p style="font-size:16px;color:#4a5568;margin-bottom:18px;">
        Hi <b>${firstName}</b>,
      </p>
      <p style="font-size:15px;color:#4a5568;margin-bottom:18px;">
        Your account has been <b>successfully created</b>. Please find your login details below:
      </p>
      <table style="width:100%;margin-bottom:18px;">
        <tr>
          <td style="padding:6px 0;color:#718096;">Email:</td>
          <td style="padding:6px 0;"><b>${email}</b></td>
        </tr>
        <tr>
          <td style="padding:6px 0;color:#718096;">Temporary Password:</td>
          <td style="padding:6px 0;">
            <span style="background:#edf2f7;padding:6px 12px;border-radius:4px;font-weight:bold;letter-spacing:0.5px;">${tempPassword}</span>
          </td>
        </tr>
      </table>
      <a href="https://erp.nexinventix.com/login" style="display:inline-block;padding:12px 24px;background:#3b82f6;color:#fff;border-radius:4px;text-decoration:none;font-weight:600;letter-spacing:0.5px;margin-bottom:18px;">
        Log In to Your Account
      </a>
      <p style="font-size:14px;color:#718096;margin-top:24px;">
        <b>Important:</b> For your security, please log in as soon as possible and change your password.
      </p>
      <p style="font-size:14px;color:#718096;margin-top:24px;">
        If you have any questions or need help, just reply to this email.<br>
        <br>
        Best regards,<br>
        <b>The Nexinventix ERP Team</b>
      </p>
    </div>
    <div style="text-align:center;font-size:12px;color:#a0aec0;margin-top:24px;">
      © ${new Date().getFullYear()} Nexinventix ERP. All rights reserved.
    </div>
  </div>
  `;
}
