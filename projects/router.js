"use strict";
const express = require("express");
const passport = require("passport");
const bodyParser = require("body-parser");
const { Project } = require("./models");
const router = express.Router();
const jsonParser = bodyParser.json();
const jwtAuth = passport.authenticate("jwt", { session: false });

router.get("/", jwtAuth, (req, res) => {
  Project.find({
    user: req.user.id
  })
    .then(projects => {
      res.json(projects.map(project => project.serialize()));
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({ error: "something went terribly wrong" });
    });
});

router.get("/:id", (req, res) => {
  Project.findById(req.params.id)
    .then(project => res.json(project.serialize()))
    .catch(err => {
      console.error(err);
      res.status(500).json({ error: "something went horribly awry" });
    });
});

router.post("/", jwtAuth, jsonParser, (req, res) => {
  const requiredFields = [
    "projectName",
    "startDate",
    "budget",
    "materialsNeeded",
    "endDate"
  ];
  for (let i = 0; i < requiredFields.length; i++) {
    const field = requiredFields[i];
    if (!(field in req.body)) {
      const message = `Missing \`${field}\` in request body`;
      console.error(message);
      return res.status(400).send(message);
    }
  }

  Project.create({
    projectName: req.body.projectName,
    startDate: req.body.startDate,
    budget: req.body.budget,
    materialsNeeded: req.body.materialsNeeded,
    endDate: req.body.endDate,
    user: req.user.id
  })
    .then(project => res.status(201).json(project.serialize()))
    .catch(err => {
      console.error(err);
      res.status(500).json({ error: "Something went wrong" });
    });
});

router.delete("/:id", (req, res) => {
  Project.findByIdAndRemove(req.params.id)
    .then(() => {
      res.status(204).json({ message: "success" });
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({ error: "something went terribly wrong" });
    });
});

router.put("/:id", jsonParser, (req, res) => {
  if (!(req.params.id && req.body.id && req.params.id === req.body.id)) {
    res.status(400).json({
      error: "Request path id and request body id values must match"
    });
  }

  const updated = {};
  const updateableFields = [
    "projectName",
    "startDate",
    "budget",
    "materialsNeeded",
    "endDate"
  ];
  updateableFields.forEach(field => {
    if (field in req.body) {
      updated[field] = req.body[field];
    }
  });

  Project.findByIdAndUpdate(req.params.id, { $set: updated }, { new: true })
    .then(updatedProject => res.status(204).end())
    .catch(err => res.status(500).json({ message: "Something went wrong" }));
});

module.exports = { router };
