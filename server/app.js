const express = require("express");
const app = express();
const router=require("./routes/router");
require('dotenv').config();
const cors=require("cors");
const bodyParser=require("body-parser");

app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());

app.use(cors());
app.use("/", router);


app.listen(process.env.PORT, () => {
    console.log(`Project Backend running on port ${process.env.PORT}`);
});

