const express = require("express");
const app = express();
const router=require("./routes/router");
require('dotenv').config();

app.use("/", router);


app.listen(process.env.PORT, () => {
    console.log(`Project Backend running on port ${process.env.PORT}`);
});

