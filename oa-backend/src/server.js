const express = require("express");
const app = express();
const http = require("http").Server(app);
const io = require("socket.io")(http);

// 存储文档内容的 Delta 对象
let documentDelta = null;

io.on("connection", (socket) => {
  console.log("有用户连接");

  // 当新用户连接时，发送当前文档内容
  if (documentDelta) {
    socket.emit("initial-document", documentDelta);
  }

  // 监听客户端发送的文本变化
  socket.on("text-change", (delta) => {
    documentDelta = delta;
    // 广播给除发送者之外的所有客户端
    socket.broadcast.emit("text-change", delta);
  });

  socket.on("disconnect", () => {
    console.log("用户断开连接");
  });
});

const port = 3002;
http.listen(port, () => {
  console.log(`服务器运行在端口 ${port}`);
});
