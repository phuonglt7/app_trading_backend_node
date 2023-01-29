const express = require('express')
const app = express()
const bodyParser = require('body-parser')
require('dotenv').config()


const port = process.env.PORT || 3000
var http = require("http");
import initProduct from './routers/routes';


app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.json())

app.get("/", (req, res) => {
    res.setHeader('Content-type', 'application/json');
    res.setHeader('X-Powered-By', 'Node.js')

    res.end(JSON.stringify({
        sussess: 'OK',
        data: [" ggg"]

    }))
})
initProduct(app)

app.use(function (req, res) {
    res.status(404).send({ url: req.originalUrl + ' not found' })
})


app.listen(port, function () {
    // for view in console
    console.log("Listen: 3000...");
});
