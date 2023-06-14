const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const supplier = require("./app/controller/supplier.controller");
const mustacheExpress = require("mustache-express");
const favicon = require('serve-favicon');
const Prometheus = require('prom-client');

const app = express();


// Middleware
app.use(bodyParser.json()); // parse requests of content-type: application/json
app.use(bodyParser.urlencoded({ extended: true })); // parse requests of content-type: application/x-www-form-urlencoded
app.use(cors()); // enable CORS
app.options("*", cors()); // allow CORS preflight
app.engine("html", mustacheExpress()); // set mustache as the template engine
app.set("view engine", "html"); // set HTML as the view engine
app.set("views", __dirname + "/views"); // set the views directory
app.use(express.static('public')); // serve static files from the public directory
app.use(favicon(__dirname + "/public/img/favicon.ico")); // serve favicon

// Routes
app.get("/", (req, res) => {
  res.render("home", {}); // render home page
});

app.get("/suppliers/", supplier.findAll); // list all the suppliers

app.get("/supplier-add", (req, res) => {
  res.render("supplier-add", {}); // show the add supplier form
});

app.post("/supplier-add", supplier.create); // receive the add supplier POST

app.get("/supplier-update/:id", supplier.findOne); // show the update form

app.post("/supplier-update", supplier.update); // receive the update POST

app.post("/supplier-remove/:id", supplier.remove); // receive the POST to delete a supplier


// Collect default metrics
Prometheus.collectDefaultMetrics();

// Prometheus metrics endpoint
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', Prometheus.register.contentType);
  try {
    const metrics = await Prometheus.register.metrics();
    res.end(metrics);
  } catch (error) {
    console.error('Error retrieving metrics:', error);
    res.status(500).send('Error retrieving metrics');
  }
});


// Handle 404
app.use((req, res, next) => {
  res.status(404).render("404", {});
});

// Set port, listen for requests
const app_port = process.env.APP_PORT || 3000;
app.listen(app_port, () => {
  console.log(`Server is running on port ${app_port}.`);
});

