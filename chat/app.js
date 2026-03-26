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
  console.log("CONNECTED", socket.id);

  socket.on("newUser", (userId) => {
    addUser(userId, socket.id);

    console.log(onlineUser);
  });

socket.on("sendMessage", ({ receiverId, data }) => {
  const receiver = getUser(receiverId);

  console.log("receiver", receiver);

  if (receiver) {
    io.to(receiver.socketId).emit("getMessage", data);
  } else {
    console.log("User is offline");
  }
});

  socket.on("disconnect", () => {
    removeUser(socket.id);
  });
});

io.listen("4001" , ()=>{
  console.log("Socket Server Is Running...");
});
