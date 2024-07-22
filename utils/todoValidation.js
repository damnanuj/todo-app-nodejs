const todoValidation = ({ todo }) => {
  todo = todo.trim();
  return new Promise((resolve, reject) => {
    if (!todo) return reject("You must enter something");
    if (todo.length < 3) return reject("The entry must be at least 3 characters long");
    resolve();
  });
};

module.exports = todoValidation;
