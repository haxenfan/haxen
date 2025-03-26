
// script.js
window.addEventListener("DOMContentLoaded", () => {
  fetch("/nav.html")
    .then(res => res.text())
    .then(html => {
      document.getElementById("nav-container").innerHTML = html;
    });
});
