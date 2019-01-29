const Cohort = require('../models/cohort.model');

const createCohort = (req, resp) => {
  const { description, name } = req.body;

  const cohort = new Cohort({
    name,
    description
  });

  cohort.save((err, doc) => {
    err
      ? resp.status(400).send(err.message)
      : resp
          .location(`/cohorts/${doc._id}`)
          .status(201)
          .send(doc);
  });
};

const getCohorts = (req, resp) => {
  Cohort.find({}, null, { sort: { createdAt: -1 } }, (err, cohort) => {
    err ? resp.status(400).send(err.message) : resp.status(200).send(cohort);
  });
};

const getCohortById = (req, resp) => {
  Cohort.findById({ _id: req.params.id }, (err, doc) => {
    if (!doc) return resp.status(404).send('No cohort of given id');

    return err
      ? resp.status(400).send(err.message)
      : resp.status(200).json(doc);
  });
};

module.exports = {
  createCohort,
  getCohorts,
  getCohortById
};
