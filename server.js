const express = require("express");
const cors = require("cors");
const db = require("./config/database");
const userRoutes = require("./routes/users/userRoutes");
const postRoutes = require("./routes/posts/postRoutes");
const categoryRoutes = require("./routes/category/categoryRoutes");
const commentRoutes = require("./routes/comments/commentRoutes");
const messageRoutes = require("./routes/email/emailRoutes");

const { errorHandler, notFound } = require("./middlewares/error/errorHandler");

const dotenv = require("dotenv");
dotenv.config({ path: "./.env" });

const app = express();

db();
app.use(express.json());
app.use(cors());

//Users route
app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/email", messageRoutes);
app.use("/api/category", categoryRoutes);

// app.use(notFound);
// app.use(errorHandler);

// error handler

const PORT = process.env.PORT || 5000;

app.listen(PORT, console.log(`Server is running ${PORT}`));
