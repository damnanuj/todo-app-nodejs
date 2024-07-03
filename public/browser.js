// const { default: axios } = require("axios");

window.onload = generateTodos;

function generateTodos() {
  axios
    .get("/read-item")
    .then((res) => {
      // console.log(res);
      if (res.data.status !== 200) {
        alert(res.data.message);
        return;
      }
      const todos = res.data.data;
      document.getElementById("item_list").insertAdjacentHTML(
        "beforeend",
        todos
          .map((item) => {
            return `<li class="list-group-item list-group-item-action d-flex align-items-center justify-content-between">
                    <span class="item-text"> ${item.todo}</span>
                    <div>
                    <button data-id="${item._id}" class="edit-me btn btn-secondary btn-sm mr-1">Edit</button>
                    <button data-id="${item._id}" class="delete-me btn btn-danger btn-sm">Delete</button>
                    </div></li>`;
          })
          .join("")
      );
    })
    .catch((err) => {
      console.log(err);
    });
}
document.addEventListener("click", function (event) {
  // console.log("clickedd");
  //=======================editing the todo=============================
  if (event.target.classList.contains("edit-me")) {
    console.log("Edit clicked");
    const newData = prompt("Enter new todo");
    const todoId = event.target.getAttribute("data-id");
    console.log(newData, todoId);
    axios
      .post("/edit-item", { newData, todoId })
      .then((res) => {
        if (res.data.status !== 200) {
          alert(res.data.message);
          return;
        }
        event.target.parentElement.parentElement.querySelector(
          ".item-text"
        ).innerHTML = newData;
      })
      .catch((error) => {
        console.log(error);
      });
  }
  //==================deleting the todo================================
  if (event.target.classList.contains("delete-me")) {
    console.log("Delete clicked");
    const todoId = event.target.getAttribute("data-id");

    axios
      .post("/delete-item", { todoId })
      .then((res) => {
        console.log(res);
        if (res.data.status !== 200) {
          alert(res.data.message);
          return;
        }
        event.target.parentElement.parentElement.remove();
      })
      .catch((err) => {
        console.log(err);
      });
  }
  // ================create todo item=======================
  if (event.target.classList.contains("add_item")) {
    const todo = document.getElementById("create_field").value;

    axios
      .post("/create-item", { todo })
      .then((res) => {
        document.getElementById("create_field").value = "";
        const todo = res.data.data.todo;
        const todoId = res.data.data._id;
        document
          .getElementById("item_list")
          .insertAdjacentHTML(
            "beforeend",
            `<li class="list-group-item list-group-item-action d-flex align-items-center justify-content-between">
          <span class="item-text"> ${todo}</span>
          <div>
          <button data-id="${todoId}" class="edit-me btn btn-secondary btn-sm mr-1">Edit</button>
          <button data-id="${todoId}" class="delete-me btn btn-danger btn-sm">Delete</button>
          </div></li>`
          )
          .join("");
      })
      .catch((err) => {
        console.log(err.response);
        if (err.response.status !== 500) {
          alert(err.response.data);
        }
      });
  }
});
