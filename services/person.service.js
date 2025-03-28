const {Person, User, Order} = require("../models");
const ApiError = require("../utils/ApiError");
const httpStatus = require("http-status");

const createPerson = async (user, personBody, file) => {
    personBody.user = user;
    console.log("create personbody",personBody);


    const person = await Person.create(personBody);
    user.persons.push(person.id);
    if (file !== undefined) {
        person.image = file.id;
        person.save();
    }

    if (person.totalOverdue > 0) {
        var orderBody ={};
        orderBody.user = user.id;
        orderBody.person = person.id;
        orderBody.amountPaid = 0;
        orderBody.amountPending = person.totalOverdue;
        if (person.type === "customer") {
            orderBody.type = "sale";
            user.pendingReceivable = user.pendingReceivable + person.totalOverdue;
        } else {
            orderBody.type = "purchase";
            user.pendingPayable = user.pendingPayable + person.totalOverdue;
        }
        await Order.create(orderBody);
    }
    user.save();
    return person;
}
const getPersons = async (filter, options) => {
    console.log(filter, "filter",options,"options");
    const persons = await Person.paginate(filter, options);
    return persons;
}

const queryPersons = async (userId, filter, options) => {
    let sort = "";
    if (options.sortBy) {
        const sortingCriteria = [];
        options.sortBy.split(",").forEach((sortOption) => {
            const [key, order] = sortOption.split(":");
            sortingCriteria.push((order === "desc" ? "-" : "") + key);
        });
        sort = sortingCriteria.join(" ");
    } else {
        sort = "createdAt";
    }

    const persons = await User.findById(userId).select("persons").populate({
        path: "persons",
        match: filter,
        options: {
            sort: sort,
            limit: options.limit ? parseInt(options.limit, 10) : 10,
            skip: options.page ? (parseInt(options.page, 10) - 1) * options.limit : 0
        }
    });
    return persons;
};



// todo check the user.persons.contains(person)
const updatePerson = async (user, personId, updatedBody) => {
    const person = await Person.findById(personId);
    if (!person) {
        throw new ApiError(httpStatus.NOT_FOUND, `Person with id ${personId} not found`);
    }
    if (!user.persons.includes(personId)) {
        throw new ApiError(httpStatus.FORBIDDEN, "Not allowed to update this persons");
    }
    const updatePerson = await Person.findByIdAndUpdate(personId, updatedBody);
    if (!updatePerson) {
        throw new ApiError(httpStatus.NOT_FOUND, "No such person with ID ");
    }
    return updatePerson;
}

const deletePerson = async (user, personId) => {
    const person = await Person.findById(personId);
    if (!person) {
        throw new ApiError(httpStatus.NOT_FOUND, `Person with id ${personId} not found`);
    }
    if (!user.persons.includes(personId)) {
        throw new ApiError(httpStatus.FORBIDDEN, "Not allowed to delete this persons");
    }
    if (person.totalOverdue > 0) {
        if (person.type === "customer") {
            user.pendingReceivable = user.pendingReceivable - person.totalOverdue;
        } else {
            user.pendingPayable = user.pendingPayable - person.totalOverdue;
        }
    }
    // await Order.deleteMany({personId: personId});
    user.persons.pull(personId);
    user.save();
    return Person.findByIdAndDelete(personId, {new: true});
}

module.exports = {
    createPerson,
    getPersons,
    queryPersons,
    updatePerson,
    deletePerson,
}