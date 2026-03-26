import { Server } from "socket.io";

const io = new Server({
  cors: {
    origin: "https://mzansi-real-estate-git-main-earnclicks-projects.vercel.app",
    methods: ["GET", "POST"]
  },
});

let onlineUser = [];

const addUser = (userId, socketId) => {
  const userExits = onlineUser.find((user) => user.userId === userId);
  if (!userExits) {
    onlineUser.push({ userId, socketId });
  }
};

const removeUser = (socketId) => {
  onlineUser = onlineUser.filter((user) => user.socketId !== socketId);
};

const getUser = (userId) => {
  return onlineUser.find((user) => user.userId === userId);
};

io.on("connection", (socket) => {


  console.log("Connected" );
  

  socket.on("newUser", (userId) => {
    addUser(userId, socket.id);

    console.log(onlineUser);
    
  });

  socket.on("sendMessage", ({ receiverId, data }) => {
    const receiver = getUser(receiverId);
    io.to(receiver.socketId).emit("getMessage", data);
  });

  socket.on("disconnect", () => {
    removeUser(socket.id);
  });
});

io.listen("4000");
