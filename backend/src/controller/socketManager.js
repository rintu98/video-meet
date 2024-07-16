import { Server } from "socket.io";

let connections = {};
let messages = {};
let timeOnline = {};

export const connectToSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POSt"],
      allowedHeaders: ["*"],
      credentials: true
    }
  });

  io.on("connection", (socket) => {
    console.log("something connected");
    socket.on("join-call", (path) => {
      if (connections[path] === undefined) {
        connections[path] = [];
      }
      connections[path].push(socket.id);
      timeOnline[socket.id] = new Date();

      for (let a = 0; a < connections[path].length; a++) {
        io.to(connections[path][a]).emit(
          "user-joined",
          socket.id,
          connections[path]
        );
      }

      if (messages[path] !== undefined) {
        for (let a = 0; a < messages[path].length; ++a) {
          io.to(socket.id).emit(
            "chat-message",
            messages[path][a]["data"],
            messages[path][a]["sender"],
            messages[path][a]["socket-id-sender"]
          );
        }
      }
    });

    socket.on("signal", (toId, messages) => {
      io.to(toId).emit("signal", socket.id, messages);
    });

    socket.on("chat-message", (data, sender) => {
        const [matchingRoom, found] = Object.entries(connections)
        .reduce(([room, isFound], [roomKey, roomValue]) => {
            if(!isFound && roomValue.includes(socket.id)) {
                return [roomKey, true];
            }
            return [room, isFound];
        }, ['', false]);

        if(found === true) {
            if(messages[matchingRoom] === undefined)  {
                messages[matchingRoom] = [];
            }

            messages[matchingRoom].push({'sender': sender, "data": data, "socket-id-sender": socket.id});
            console.log("message", matchingRoom, ":", sender, data);

            connections[matchingRoom].forEach((elem) => {
                io.to(elem).emit("chat-message", data, sender, socket.id);
            })
        }
        
    });

    socket.on("disconnect", () => {
        const diffTime = Math.abs(timeOnline[socket.id] - new Date());

        for(const path in connections) {
            const index = connections[path].indexOf(socket.id);
            if(index != -1) {
                connections[path].splice(index, 1);
                connections[path].forEach(id => io.to(id).emit('user-left', socket.id));

                if(connections[path].length === 0) {
                    delete connections[path];
                }
                break;
            }
        }
        delete timeOnline[socket.id];
    });
  });

  return io;
};
