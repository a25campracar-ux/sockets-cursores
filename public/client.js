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

// lista de conectados y contador de la cabecera
function pintarLista() {
  const ids = Object.keys(todos);
  document.getElementById("contador").textContent = ids.length;
  document.getElementById("contadorTexto").textContent = ids.length == 1 ? "conectado" : "conectados";
  const ul = document.getElementById("lista");
  ul.innerHTML = "";
  if (ids.length == 0) {
    ul.innerHTML = '<li class="vacio">Nadie todavía</li>';
    return;
  }
  for (let id of ids) {
    const li = document.createElement("li");
    if (id == socket.id) li.className = "yo";
    const punto = document.createElement("span");
    punto.style.background = todos[id].color;
    li.append(punto, todos[id].nombre + (id == socket.id ? " (tú)" : ""));
    ul.append(li);
  }
}

// dibujar
function dibujar() {
  pintarLista();
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // cuadrícula de puntos de fondo
  ctx.fillStyle = "#26272b";
  for (let x = 16; x < canvas.width; x += 32) {
    for (let y = 16; y < canvas.height; y += 32) ctx.fillRect(x, y, 2, 2);
  }

  ctx.font = '600 14px "Host Grotesk Variable", sans-serif';
  ctx.textBaseline = "middle";

  for (let id in todos) {
    let u = todos[id];

    // cursor: cuadrado del color del usuario con borde blanco
    ctx.fillStyle = "#fff";
    ctx.fillRect(u.x - 8, u.y - 8, 16, 16);
    ctx.fillStyle = u.color;
    ctx.fillRect(u.x - 6, u.y - 6, 12, 12);

    // etiqueta oscura con el nombre (se lee con cualquier color)
    let ancho = ctx.measureText(u.nombre).width + 20;
    ctx.fillStyle = "#16161a";
    ctx.fillRect(u.x + 14, u.y - 12, ancho, 24);
    ctx.strokeStyle = "#2c2d31";
    ctx.strokeRect(u.x + 14.5, u.y - 11.5, ancho - 1, 23);
    ctx.fillStyle = "#faf8f9";
    ctx.fillText(u.nombre, u.x + 24, u.y + 1);
  }
}

// cuando carga la fuente, vuelvo a dibujar para que el canvas la use
document.fonts.ready.then(dibujar);
