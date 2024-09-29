const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const mongoose = require("mongoose");
const port = process.env.port || 5000;

app.use(express.json());
app.use(cors());

const blogRoutes = require("./src/routes/blog.route");
const commentRoutes = require("./src/routes/comment.route");

app.use("/api/blogs", blogRoutes);
app.use("/api/comments", commentRoutes);

async function main() {
    await mongoose.connect(process.env.MONGOBD_URL);
    app.get("/", (req, res) => {
        res.send("Hello World");
    });
}
main()
    .then(() => console.log("MongoDb connected"))
    .catch((err) => console.log(err));

app.listen(port, () => {
    console.log(`App listening on port ${port}`);
});
