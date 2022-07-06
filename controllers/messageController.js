const expressAsyncHandler = require("express-async-handler");
const sendGrid = require("@sendgrid/mail");
const badwords = require("bad-words");
const EmailMessage = require("../models/messaging/emailMessaging");

exports.sendEmailMessage = expressAsyncHandler(async (req, res) => {
  const { to, subject, message } = req.body;

  const emailMessage = subject + " " + message;

  const filter = new badwords();

  const isProfane = filter.isProfane(emailMessage);

  if (isProfane)
    throw new Error("Email sent failed, it contains profane words");

  try {
    const email = {
      to,
      subject,
      text: message,
      from: "darrachb1991@gmail.com",
    };

    await sendGrid.send(email);

    await EmailMessage.create({
      sentBy: req?.user?._id,
      from: req?.user?.email,
      to,
      message,
      subject,
    });

    res.json(email);
  } catch (error) {
    res.json(error);
  }
});
