// const { default: axios } = require("axios");
let skip = 0;
window.onload = generateTodos;

function generateTodos() {
  axios
    .get(`/read-item?skip=${skip}`)
    .then((res) => {
      // console.log(res);
      if (res.data.status !== 200) {
       // Check if the no more todos message already exists
       if (!document.getElementById("no-more-todos-message")) {
        // Show message when no more todos are found
        const noMoreTodosMessage = document.createElement("div");
        noMoreTodosMessage.id = "no-more-todos-message"; // Add unique identifier
        noMoreTodosMessage.textContent = "No more todos found";
        noMoreTodosMessage.style.color = "red";
        noMoreTodosMessage.style.marginTop = "10px";
        document.getElementById("item_list").appendChild(noMoreTodosMessage);
         // Remove the message after 3 seconds
         setTimeout(() => {
          if (document.getElementById("no-more-todos-message")) {
            document.getElementById("no-more-todos-message").remove();
          }
        }, 3000);
      }
      removeLoader()
      return;
      }
      
      // console.log(skip);
      const todos = res.data.data;
  
      skip += todos.length;
      // console.log(skip);
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
      removeLoader();
    })
    .catch((err) => {
      removeLoader();
      console.log(err);
    });
}
function removeLoader() {
  const loader = document.querySelector(".loader");
  if (loader) {
    loader.remove();
  }
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
    console.log("addme Clicked");
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
  // ==========log out==============
  if (event.target.classList.contains("logout")) {
    console.log("Logout clicked");

    // Create the loader element
    const loader = document.createElement("div");
    loader.classList.add("loader");

    // Append the loader next to the logout button
    event.target.parentNode.appendChild(loader);

    axios
      .post("/logout")
      .then((res) => {
        // console.log(res);
        if (res.status === 200) {
          // Redirect to the login page after a delay
          setTimeout(() => {
            window.location.href = "/login";
          }, 1000); // 2-second delay
        }
      })
      .catch((err) => {
        console.log(err);
        // Remove loader if there's an error
        loader.remove();
      });
  }

  //show more
  if (event.target.classList.contains("show_more")) {
    // Create the loader element
    const loader = document.createElement("div");
    loader.classList.add("loader");

    // Append the loader next to the logout button
    event.target.parentNode.appendChild(loader);
    console.log("showmore Clicked");
    setTimeout(() => {
      generateTodos(()=>{
        loader.remove();
      });
      
    }, 3000); // 2-second delay
    
  }
});
