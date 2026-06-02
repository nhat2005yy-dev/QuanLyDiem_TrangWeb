const menuBtn = document.getElementById("menuBtn");
const sidebar = document.getElementById("sidebar");
const main = document.querySelector(".main");

menuBtn.addEventListener("click", () => {
    sidebar.classList.toggle("hide");
    main.classList.toggle("full"); 
});