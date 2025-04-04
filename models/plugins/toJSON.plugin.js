/* eslint-disable no-param-reassign */

/**
 * A mongoose schema plugin which applies the following in the toJSON transform call:
 *  - removes __v, createdAt, updatedAt, and any path that has private: true
 *  - replaces _id with id
 */

function deleteAtPath(obj, path, index) {
  if (index === path.length - 1) {
    delete obj[path[index]];
    return;
  }
  deleteAtPath(obj[path[index]], path, index + 1);
}

let toJSON = (schema) => {
  let transform;
  if (schema.options.toJSON && schema.options.toJSON.transform) {
    transform = schema.options.toJSON.transform;
  }

  schema.options.toJSON = Object.assign(schema.options.toJSON || {}, {
    transform(doc, ret, options) {
      Object.keys(schema.paths).forEach((path) => {
        if (schema.paths[path].options && schema.paths[path].options.private) {
          deleteAtPath(ret, path.split("."), 0);
        }
      });

      // Check if ret._id exists before trying to call toString()
      if (ret._id !== undefined) {
        ret.id = ret._id.toString();
        delete ret._id;
      } else {
        // In case _id is not found, set id directly from the existing id
        if (ret.id === undefined) {
          ret.id = null;
        }
      }

      // Remove unnecessary fields
      delete ret.__v;
      // delete ret.createdAt;
      // delete ret.updatedAt;

      // If transform function exists, call it
      if (transform) {
        return transform(doc, ret, options);
      }
    },
  });
};

module.exports = toJSON;
