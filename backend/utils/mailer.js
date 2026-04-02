const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

exports.sendBudgetAlert = async (email, userName, amount, category) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: `Budget Alert: 80% limit reached!`,
    html: `
      <h2>Hi ${userName},</h2>
      <p>You have reached <b>80%</b> of your budget ${category ? `for ${category}` : ''}.</p>
      <p>Current spending info: <b>₹${amount}</b></p>
      <p>Please review your expenses on the dashboard.</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Alert sent to ${email}`);
  } catch (err) {
    console.error(`Failed to send alert to ${email}:`, err.message);
  }
};
