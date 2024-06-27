const todoValidation = ({ todo }) => {
  todo = todo.trim();
  return new Promise((resolve, reject) => {
    if (!todo) return reject("You must enter something");
    resolve();
  });
};

module.exports = todoValidation;
