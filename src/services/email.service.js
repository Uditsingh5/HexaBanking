require('dotenv').config();
const nodemailer = require('nodemailer');

// Function to format numbers with Indian comma separation
const formatIndianCurrency = (num) => {
  return num.toString().replace(/\B(?=(\d{2})+(?!\d))/g, ",");
};

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    type: 'OAuth2',
    user: process.env.EMAIL_USER,
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    refreshToken: process.env.REFRESH_TOKEN,
  },
});


transporter.verify((error, success) => {
  if (error) {
    console.error('Error connecting to email server:', error);
  } else {
    console.log('Email server is ready to send messages');
  }
});




// Function to send email

const sendEmail = async (to, subject, text, html) => {
  try {
    const info = await transporter.sendMail({
      from: `"Hexa Ledger" <${process.env.EMAIL_USER}>`, // sender address
      to, // list of receivers
      subject, // Subject line
      text, // plain text body
      html, // html body
    });

    console.log('Message sent: %s', info.messageId);
    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

// send mail fn1
async function sendRegistrationEmail(userEmail, name) {
  const subject = 'Welcome to Hexa Ledger Online Banking';

  const text = `Dear ${name},

Welcome to Hexa Ledger. Your online banking account is now active.

For security, please keep your login details private and enable two-factor authentication.

Best regards,
Hexa Ledger Support Team`;

  const html = `
  <p>Dear ${name},</p>
  <p>Welcome to <strong>Hexa Ledger</strong>. Your online banking account is now active.</p>
  <p><strong>Security reminder:</strong> Keep your login details private and enable two-factor authentication.</p>
  <p>Best regards,<br>Hexa Ledger Support Team</p>
`;
  await sendEmail(userEmail, subject, text, html);
}

// send mail fn2 - Generic Transaction Email
async function sendTransactionEmail(userEmail, name, amount, transactionId, toAccount, type) {
  const subject = 'Hexa Ledger Transaction Alert';

  const text = `Dear ${name},

A transaction has been processed on your Hexa Ledger account.

Amount: ${amount}  
Type: ${type}  
Transaction ID: ${transactionId}  
To Account: ${toAccount}  

If you did not authorize this transaction, please contact Hexa Ledger Support immediately.

Best regards,  
Hexa Ledger Support Team`;

  const html = `
    <p>Dear ${name},</p>
    <p>A transaction has been processed on your <strong>Hexa Ledger</strong> account.</p>
    <p><strong>Details:</strong></p>
    <ul>
      <li>Amount: <strong>${amount}</strong></li>
      <li>Type: <strong>${type}</strong></li>
      <li>Transaction ID: <strong>${transactionId}</strong></li>
      <li>To Account: <strong>${toAccount}</strong></li>
    </ul>
    <p>If you did not authorize this transaction, please contact <strong>Hexa Ledger Support</strong> immediately.</p>
    <p>Best regards,<br>Hexa Ledger Support Team</p>
  `;

  await sendEmail(userEmail, subject, text, html);
}

// send mail fn3 - Debit/Money Sent Email
async function sendDebitEmail(userEmail, name, amount, transactionId, recipientName, availableBalance) {
  const subject = 'Money Withdrawal Confirmation - Hexa Ledger';
  
  const formattedAmount = formatIndianCurrency(amount);
  const formattedBalance = formatIndianCurrency(availableBalance || 0);
  const timestamp = new Date().toLocaleString('en-IN', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric', 
    hour: '2-digit', 
    minute: '2-digit', 
    second: '2-digit',
    timeZone: 'Asia/Kolkata'
  });

  const text = `HEXA LEDGER - WITHDRAWAL CONFIRMATION

Dear ${name},

This is to confirm that funds have been withdrawn from your account.

TRANSACTION DETAILS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Transaction Type   : WITHDRAWAL
Amount Withdrawn   : Rs. ${formattedAmount}
Recipient Name     : ${recipientName}
Transaction ID     : ${transactionId}
Date & Time        : ${timestamp}
Transaction Status : COMPLETED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ACCOUNT SUMMARY:
Current Balance    : Rs. ${formattedBalance}

For your security, please ensure this transaction was authorized by you. If you did not initiate this withdrawal, please contact our support team immediately.

For further assistance, please visit our website or contact Hexa Ledger Support.

Best regards,
Hexa Ledger
Secure Banking Platform`;

  const html = `
    <html>
    <head>
      <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; color: #333; line-height: 1.6; }
        .container { max-width: 600px; margin: 0 auto; background-color: #f8f9fa; }
        .header { background-color: #1a237e; color: white; padding: 40px 20px; text-align: center; }
        .header h1 { margin: 0; font-size: 28px; font-weight: 300; letter-spacing: 1px; }
        .content { padding: 40px; background-color: white; }
        .alert { background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin-bottom: 30px; border-radius: 4px; }
        .alert h2 { margin: 0 0 10px 0; color: #856404; font-size: 16px; }
        .greeting { margin-bottom: 20px; }
        .section-title { font-size: 14px; font-weight: bold; color: #1a237e; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 25px; margin-bottom: 12px; border-bottom: 2px solid #1a237e; padding-bottom: 8px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        tr { border-bottom: 1px solid #e0e0e0; }
        td { padding: 12px; }
        td:first-child { width: 40%; color: #666; font-weight: 500; }
        td:last-child { text-align: right; color: #1a237e; font-weight: bold; }
        .amount { font-size: 18px; color: #d32f2f; }
        .status { color: #388e3c; }
        .footer { background-color: #f8f9fa; padding: 25px 40px; border-top: 1px solid #e0e0e0; font-size: 12px; color: #666; }
        .disclaimer { background-color: #f5f5f5; padding: 15px; border-radius: 4px; margin-top: 20px; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>HEXA LEDGER</h1>
          <p style="margin: 10px 0 0 0; font-size: 12px; letter-spacing: 0.5px;">Secure Banking Platform</p>
        </div>
        
        <div class="content">
          <div class="alert">
            <h2>✓ Withdrawal Completed</h2>
            <p style="margin: 0;">Funds have been successfully withdrawn from your account.</p>
          </div>
          
          <div class="greeting">
            <p>Dear <strong>${name}</strong>,</p>
            <p>This is to confirm that a withdrawal transaction has been completed on your Hexa Ledger account. Please review the transaction details below.</p>
          </div>
          
          <div class="section-title">Transaction Details</div>
          <table>
            <tr>
              <td>Transaction Type</td>
              <td>WITHDRAWAL (Funds Out)</td>
            </tr>
            <tr>
              <td>Amount Withdrawn</td>
              <td class="amount">Rs. ${formattedAmount}</td>
            </tr>
            <tr>
              <td>Recipient Name</td>
              <td>${recipientName}</td>
            </tr>
            <tr>
              <td>Transaction ID</td>
              <td style="font-family: monospace; font-size: 12px;">${transactionId}</td>
            </tr>
            <tr>
              <td>Date & Time</td>
              <td>${timestamp}</td>
            </tr>
            <tr>
              <td>Status</td>
              <td class="status">✓ COMPLETED</td>
            </tr>
          </table>
          
          <div class="section-title">Account Information</div>
          <table>
            <tr>
              <td>Current Available Balance</td>
              <td>Rs. ${formattedBalance}</td>
            </tr>
          </table>
          
          <div class="disclaimer">
            <p style="margin: 0;"><strong>Security Notice:</strong> Please verify that you authorized this withdrawal. If this transaction was not initiated by you, please contact Hexa Ledger Support immediately for assistance.</p>
          </div>
        </div>
        
        <div class="footer">
          <p style="margin: 0 0 10px 0;">Thank you for banking with Hexa Ledger.</p>
          <p style="margin: 5px 0;">This is an automated message. Please do not reply to this email.</p>
          <p style="margin: 5px 0; border-top: 1px solid #ddd; padding-top: 10px;">© Hexa Ledger | Secure Banking Platform</p>
        </div>
      </div>
    </body>
    </html>
  `;

  await sendEmail(userEmail, subject, text, html);
}

// send mail fn4 - Credit/Money Received Email
async function sendCreditEmail(userEmail, name, amount, transactionId, senderName, availableBalance) {
  const subject = 'Money Deposit Confirmation - Hexa Ledger';
  
  const formattedAmount = formatIndianCurrency(amount);
  const formattedBalance = formatIndianCurrency(availableBalance || 0);
  const timestamp = new Date().toLocaleString('en-IN', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric', 
    hour: '2-digit', 
    minute: '2-digit', 
    second: '2-digit',
    timeZone: 'Asia/Kolkata'
  });

  const text = `HEXA LEDGER - DEPOSIT CONFIRMATION

Dear ${name},

This is to confirm that funds have been deposited into your account.

TRANSACTION DETAILS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Transaction Type   : DEPOSIT
Amount Received    : Rs. ${formattedAmount}
From               : ${senderName}
Transaction ID     : ${transactionId}
Date & Time        : ${timestamp}
Transaction Status : COMPLETED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ACCOUNT SUMMARY:
Current Balance    : Rs. ${formattedBalance}

The credited amount is now available in your account for immediate use.

For further assistance, please visit our website or contact Hexa Ledger Support.

Best regards,
Hexa Ledger
Secure Banking Platform`;

  const html = `
    <html>
    <head>
      <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; color: #333; line-height: 1.6; }
        .container { max-width: 600px; margin: 0 auto; background-color: #f8f9fa; }
        .header { background-color: #1a237e; color: white; padding: 40px 20px; text-align: center; }
        .header h1 { margin: 0; font-size: 28px; font-weight: 300; letter-spacing: 1px; }
        .content { padding: 40px; background-color: white; }
        .alert { background-color: #e8f5e9; border-left: 4px solid #4caf50; padding: 15px; margin-bottom: 30px; border-radius: 4px; }
        .alert h2 { margin: 0 0 10px 0; color: #2e7d32; font-size: 16px; }
        .greeting { margin-bottom: 20px; }
        .section-title { font-size: 14px; font-weight: bold; color: #1a237e; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 25px; margin-bottom: 12px; border-bottom: 2px solid #1a237e; padding-bottom: 8px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        tr { border-bottom: 1px solid #e0e0e0; }
        td { padding: 12px; }
        td:first-child { width: 40%; color: #666; font-weight: 500; }
        td:last-child { text-align: right; color: #1a237e; font-weight: bold; }
        .amount { font-size: 18px; color: #388e3c; }
        .status { color: #388e3c; }
        .footer { background-color: #f8f9fa; padding: 25px 40px; border-top: 1px solid #e0e0e0; font-size: 12px; color: #666; }
        .disclaimer { background-color: #f5f5f5; padding: 15px; border-radius: 4px; margin-top: 20px; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>HEXA LEDGER</h1>
          <p style="margin: 10px 0 0 0; font-size: 12px; letter-spacing: 0.5px;">Secure Banking Platform</p>
        </div>
        
        <div class="content">
          <div class="alert">
            <h2>✓ Deposit Completed</h2>
            <p style="margin: 0;">Funds have been successfully deposited into your account.</p>
          </div>
          
          <div class="greeting">
            <p>Dear <strong>${name}</strong>,</p>
            <p>This is to confirm that a deposit transaction has been completed in your Hexa Ledger account. The funds are now available in your account.</p>
          </div>
          
          <div class="section-title">Transaction Details</div>
          <table>
            <tr>
              <td>Transaction Type</td>
              <td>DEPOSIT (Funds In)</td>
            </tr>
            <tr>
              <td>Amount Received</td>
              <td class="amount">Rs. ${formattedAmount}</td>
            </tr>
            <tr>
              <td>From</td>
              <td>${senderName}</td>
            </tr>
            <tr>
              <td>Transaction ID</td>
              <td style="font-family: monospace; font-size: 12px;">${transactionId}</td>
            </tr>
            <tr>
              <td>Date & Time</td>
              <td>${timestamp}</td>
            </tr>
            <tr>
              <td>Status</td>
              <td class="status">✓ COMPLETED</td>
            </tr>
          </table>
          
          <div class="section-title">Account Information</div>
          <table>
            <tr>
              <td>Current Available Balance</td>
              <td>Rs. ${formattedBalance}</td>
            </tr>
          </table>
          
          <div class="disclaimer">
            <p style="margin: 0;"><strong>Notice:</strong> The deposited amount is now available in your account. If you have any questions regarding this transaction, please contact Hexa Ledger Support.</p>
          </div>
        </div>
        
        <div class="footer">
          <p style="margin: 0 0 10px 0;">Thank you for banking with Hexa Ledger.</p>
          <p style="margin: 5px 0;">This is an automated message. Please do not reply to this email.</p>
          <p style="margin: 5px 0; border-top: 1px solid #ddd; padding-top: 10px;">© Hexa Ledger | Secure Banking Platform</p>
        </div>
      </div>
    </body>
    </html>
  `;

  await sendEmail(userEmail, subject, text, html);
}

module.exports = {
  sendRegistrationEmail,
  sendTransactionEmail,
  sendDebitEmail,
  sendCreditEmail
}