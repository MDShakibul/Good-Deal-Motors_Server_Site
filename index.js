const express = require('express');
const cors = require('cors');
require('dotenv').config();
const app = express();
const port =process.env.Port || 5000;

app.use(cors());
app.use(express.json());

app.get('/', (req,res)=>{
    res.send("Hello World")
})

app.listen(port, () => {
    console.log(`Express app listening on port ${port}`)
})