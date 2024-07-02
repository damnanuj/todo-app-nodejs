window.onload = generateTodos;

function generateTodos() {
  axios
    .get("/read-item")
    .then((res) => {
      console.log(res);
    })
    .catch((err) => {
      console.log(err);
    });
}
