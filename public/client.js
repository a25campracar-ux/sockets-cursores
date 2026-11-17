const socket = io();

// elementos de la página
const entrada = document.getElementById("entrada");
const pantalla = document.getElementById("pantalla");
const canvas = document.getElementById("lienzo");
const ctx = canvas.getContext("2d");

let nombre = "";
let todos = {};

// acceso al canva
// es un formulario: se entra con el botón o con Intro (sin recargar la página)
document.getElementById("formEntrar").addEventListener("submit", function(e) {
    e.preventDefault();
    nombre = document.getElementById("nombreClient").value.trim();
    if (nombre == "") {return}
    socket.emit("entrar", nombre);
    entrada.hidden = true;
    pantalla.hidden = false;

});


socket.on("usuarios", function(lista) {
    todos = lista;
    dibujar();
});

canvas.addEventListener('mousemove', function(e) {
    let rect = canvas.getBoundingClientRect();
    // si el lienzo se ve más pequeño (pantallas estrechas), paso a coordenadas del canvas
    let x = (e.clientX - rect.left) * canvas.width / rect.width;
    let y = (e.clientY - rect.top) * canvas.height / rect.height;

    socket.emit("mover", {x: x, y: y});

});

// dibujar
function dibujar() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (let id in todos) {
    let u = todos[id];

    // círculo
    ctx.fillStyle = u.color;
    ctx.beginPath();
    ctx.arc(u.x, u.y, 10, 0, Math.PI * 2);
    ctx.fill();

    // cuadrado con el nombre
    ctx.fillStyle = u.color;
    ctx.fillRect(u.x + 15, u.y, 50, 20);

    // capa negra transparente encima: oscurece
    ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
    ctx.fillRect(u.x + 15, u.y, 50, 20);

    ctx.fillStyle = "white";
    ctx.fillText(u.nombre, u.x + 20, u.y + 15);
  }
}