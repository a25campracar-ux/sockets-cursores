const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

let usuarios = {};

io.on("connection", function(socket) {
  console.log("alguien se ha conectado");

  // cuando un cliente dice su nombre
    socket.on("entrar", function(nombre) {
        usuarios[socket.id] = {
            nombre: nombre,
            x: 0,
            y: 0,
            color: "hsl(" + Math.floor(Math.random() * 360) + ", 80%, 50%)"
        };
        io.emit("usuarios", usuarios);
    });

  // cuando un cliente mueve el ratón
    socket.on("mover", function(pos) {
        if (!usuarios[socket.id]) {
            return;
        }
        usuarios[socket.id].x = pos.x;
        usuarios[socket.id].y = pos.y;
        io.emit("usuarios", usuarios);
    });

  // borrar al usuario y avisar a los demás
    socket.on("disconnect", function() {
    console.log("alguien se ha ido");
        delete usuarios[socket.id];
        io.emit("usuarios", usuarios);
  });
});

// en el servidor el puerto viene de PORT (pm2); en local, el 3000
const PORT = process.env.PORT || 3000;
server.listen(PORT, function() {
  console.log("http://localhost:" + PORT);
});