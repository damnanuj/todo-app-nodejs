// const { default: axios } = require("axios");
let skip = 0;
let loading = false;
let allTodos = [];

window.onload = generateTodos;

function generateTodos(callback) {
  if (loading) return;
  loading = true;
   const loaderArea = document.querySelector(".loaderArea");
  const loader = document.createElement("div");
  loader.classList.add("loader");
  loaderArea.appendChild(loader);

  axios
    .get(`/read-item?skip=${skip}`)
    .then((res) => {
     
      
        if (res.data.status === 204) {
          // Show no todos message if status is 204
          if (!document.getElementById("no-todos-message")) {
            const noTodosMessage = document.createElement("div");
            noTodosMessage.id = "no-todos-message";
            noTodosMessage.textContent = res.data.message;
            noTodosMessage.style.color = "red";
            noTodosMessage.style.marginTop = "10px";
            document.getElementById("item_list").appendChild(noTodosMessage);
          }
          removeLoader(loader);
          document.querySelector(".show_more").style.display = "none";
          loading = false;
          return;
        }

      const todos = res.data.data;
      skip += todos.length;
      allTodos = [...allTodos, ...todos];

      renderTodos(allTodos);
      removeLoader(loader);
      loading = false;

      if (callback) callback();
    })
    .catch((err) => {
      removeLoader(loader);
      loading = false;
      console.log(err);
    });
}

function renderTodos(todos) {
  const itemList = document.getElementById("item_list");
  itemList.innerHTML = todos
    .map((item) => {
      return `<div class="task">
            <div class="content">
              <ol>
                <li>${item.todo}</li>
              </ol>
            </div>
            <div class="actions">
              <span><i data-id="${item._id}" class="edit-me fa-solid fa-pen-to-square edit"></i></span>
              <span><i  data-id="${item._id}" class="delete-me fa-solid fa-trash delete"></i></span>
            </div>
          </div>`;
    })
    .join("");
}

function removeLoader(loader) {
  if (loader) {
    loader.remove();
  }
}

document.addEventListener("click", function (event) {
  if (event.target.classList.contains("edit-me")) {
    const newData = prompt("Enter new todo");
    const todoId = event.target.getAttribute("data-id");

    axios
      .post("/edit-item", { newData, todoId })
      .then((res) => {
        if (res.data.status !== 200) {
          alert(res.data.message);
          return;
        }
        const todo = allTodos.find((item) => item._id === todoId);
        if (todo) todo.todo = newData;
        renderTodos(allTodos.slice(0, skip));
      })
      .catch((error) => {
        console.log(error);
      });
  }

  if (event.target.classList.contains("delete-me")) {
    const todoId = event.target.getAttribute("data-id");

    axios
      .post("/delete-item", { todoId })
      .then((res) => {
        if (res.data.status !== 200) {
          alert(res.data.message);
          return;
        }
        allTodos = allTodos.filter((item) => item._id !== todoId);
        renderTodos(allTodos);
      })
      .catch((err) => {
        console.log(err);
      });
  }

  if (event.target.classList.contains("deleteAll")) {
    if (confirm("Are you sure you want to delete all todos?")) {
      const loaderArea = document.querySelector(".loaderArea");
      const loader = document.createElement("div");
      loader.classList.add("loader");
      loaderArea.appendChild(loader);

      axios
        .post("/delete-all-items")
        .then((res) => {
          removeLoader(loader);
          if (res.data.status === 200) {
            alert("All todos have been deleted successfully.");
            allTodos = [];
            renderTodos(allTodos);
          } else {
            alert(res.data.message);
          }
        })
        .catch((err) => {
          removeLoader(loader);
          console.log(err);
          alert("An error occurred while deleting todos. Please try again.");
        });
    }
  }

  if (event.target.classList.contains("add_item")) {
    const todo = document.getElementById("create_field").value;

    axios
      .post("/create-item", { todo })
      .then((res) => {
        document.getElementById("create_field").value = "";
        const newTodo = res.data.data;
        allTodos = [newTodo, ...allTodos];
        // renderTodos(allTodos.slice(0, skip));
        renderTodos(allTodos);
      })
      .catch((err) => {
        if (err.response.status !== 500) {
          alert(err.response.data);
        }
      });
  }

  if (event.target.classList.contains("logout")) {
    // Ask for user confirmation before logging out
    if (confirm("Are you sure you want to logout?")) {
      const loaderArea = document.querySelector(".loaderArea");
      const loader = document.createElement("div");
      loader.classList.add("loader");
      loaderArea.appendChild(loader);

      axios
        .post("/logout")
        .then((res) => {
          if (res.status === 200) {
            window.location.href = "/login";
          } else {
            throw new Error('Logout failed');
          }
        })
        .catch((err) => {
          console.error('Error during logout:', err);
          alert('An error occurred while logging out. Please try again.');
        })
        .finally(() => {
          loader.remove();
        });
    }
  }

  // if (event.target.classList.contains("logoutAll")) {
  //   const loaderArea = document.querySelector(".loaderArea");
  //   const loader = document.createElement("div");
  //   loader.classList.add("loader");
  //   loaderArea.appendChild(loader);

  //   axios
  //     .post("/logout-all-device")
  //     .then((res) => {
  //       if (res.status === 200) {
  //         setTimeout(() => {
  //           window.location.href = "/login";
  //         }, 1000);
  //       }
  //     })
  //     .catch((err) => {
  //       console.log(err);
  //       loader.remove();
  //     });
  // }

  if (event.target.classList.contains("show_more")) {
    const loaderArea = document.querySelector(".loaderArea");
    const loader = document.createElement("div");
    loader.classList.add("loader");
    loaderArea.appendChild(loader);

    setTimeout(() => {
      generateTodos(() => {
        removeLoader(loader);
      });
    }, 2000);
  }
});
