const catchAsync = require("../utils/CatchAsync");
const pick = require("../utils/pick");
const { personService} = require("../services");
const httpStatus = require("http-status");
const {Person} = require("../models");

const getPersons= catchAsync(async (req, res) => {
    const userId = req.user.id;
    const filter = pick(req.query, ["name","type"]);
    const options = pick(req.query, ["sortBy", "limit", "page"]);
    filter.user = userId;
    const result = await personService.getPersons(filter, options);
    res.send(result);
})

const createPerson = catchAsync(async (req, res) => {
    const user = req.user;
    const personBody = pick(req.body ,['name','type','email','phoneNumber','shopNumber']);
    personBody.totalOverdue = req.body.pendingAmount;
    const person = await personService.createPerson(user,personBody,req.file);
    res.status(httpStatus.OK).send(person);
})

const updatePerson = catchAsync(async (req, res) => {
    const personId = req.params.personId;
    const updatedBody = req.body;
    const updatedPerson = await personService.updatePerson(req.user,personId,updatedBody);
    res.status(httpStatus.OK).send(updatedPerson);
})

const deletePerson = catchAsync(async (req, res) => {
    const personId = req.params.personId;
    const person = await personService.deletePerson(req.user,personId);
    res.status(httpStatus.OK).send(person);
})
module.exports={
    getPersons,
    createPerson,
    updatePerson,
    deletePerson,
}