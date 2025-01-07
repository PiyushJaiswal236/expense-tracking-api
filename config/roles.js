const allRoles = {
  user: ["getSelf", "manageSelf"],
  admin: ["getUsers", "manageUsers", "getSelf", "manageSelf"],
};

const roles = Object.keys(allRoles);
const roleRights = new Map(Object.entries(allRoles));

module.exports = {
  roles,
  roleRights,
};
