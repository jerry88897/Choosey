let sidebar = document.querySelector(".sidebar");
let closeBtn = document.querySelector("#btn");

closeBtn.addEventListener("click", () => {
  sidebar.classList.toggle("open");
  menuBtnChange(); //calling the function(optional)
});

// following are the code to change sidebar button(optional)
function menuBtnChange() {
  if (sidebar.classList.contains("open")) {
    closeBtn.setAttribute("src", "./icon/bx-menu-alt-right.svg");
  } else {
    closeBtn.setAttribute("src", "./icon/bx-menu.svg");
  }
}
