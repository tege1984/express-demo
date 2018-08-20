const startupDebugger = require("debug")("app:startup");
const dbDebugger = require("debug")("app:db");
const config = require("config");
const morgan = require("morgan");
const Joi = require("joi");
const logger = require("./logger");
const authenticate = require("./authenticate");
const helmet = require("helmet");
const express = require("express");
const app = express();

app.set("view engine", "pug");
app.set("views", "./views");

console.log(`NODE_ENV ${process.env.NODE_ENV}`);
// console.log(`app: ${app.get("env")}`);
// built-in middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("Public"));

// custom middleware
app.use(authenticate);
app.use(logger);

// third-party middleware
app.use(helmet());

//configuration
console.log("Application Name:" + config.get("name"));
console.log("Application Name:" + config.get("mail.host"));
console.log("Mail password:" + config.get("mail.password"));

// get the enviroment that the program is running
if (app.get("env") === "development") {
  app.use(morgan("tiny"));
  //console.log("Morgan enabled...");
  startupDebugger("Morgan enabled...");
}

dbDebugger("connected to db...");

const courses = [
  { id: 1, name: "course1" },
  { id: 2, name: "course2" },
  { id: 3, name: "course3" },
  { id: 4, name: "course4" }
];

app.get("/", (req, res) => {
  res.render("index", { title: "My express App", message: "Hello Express" });
  // res.send("Hello Guys!");
});

app.get("/api/courses", (req, res) => {
  res.send(courses);
});

app.get("/api/courses/:id", (req, res) => {
  const course = courses.find(c => c.id === parseInt(req.params.id));
  if (!course)
    return res.status(404).send("The course with the given Id is not found");
  res.send(course);
});

app.post("/api/courses", (req, res) => {
  const { error } = courseValidate(req.body);

  if (error) {
    // bad request
    return res.status(400).send(error.details[0].message);
  }

  const course = {
    id: courses.length + 1,
    name: req.body.name
  };

  courses.push(course);
  res.send(course);
});

app.put("/api/courses/:id", (req, res) => {
  // look up the course
  // if doesn't exit return 404

  const course = courses.find(c => c.id === parseInt(req.params.id));
  if (!course) {
    return res.status(404).send("The course with the given Id is not found");
  }

  // validate
  // if invalid, return 400
  const { error } = courseValidate(req.body);
  if (error) {
    // bad request
    return res.status(400).send(error.details[0].message);
  }

  // update the course
  // return the updated course to the client

  course.name = req.body.name;
  res.send(course);
});

app.delete("/api/courses/:id", (req, res) => {
  // look up the course
  //if it dosen't exist, return 404
  const course = courses.find(c => c.id === parseInt(req.params.id));
  if (!course) {
    return res.status(404).send("The course with the given Id is not found");
  }

  const index = courses.indexOf(course);
  courses.splice(index, 1);
  res.send(course);

  // delete the course
  // return the deleted course to the client
});

function courseValidate(course) {
  const schema = {
    name: Joi.string()
      .min(3)
      .required()
  };

  return Joi.validate(course, schema);
}

const port = process.env.PORT || 3000;

app.listen(port, () => console.log(`listening on port ${port}...`));
