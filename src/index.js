const express = require("express");
require("./db/mongoose");
const userRouter = require("./routers/user");
const postRouter = require("./routers/posts");
const friendsRouter = require("./routers/friends");

const app = express();
const PORT = process.env.PORT || 3000;

//using routers
app.use(express.json());
app.use(userRouter);

app.use(postRouter);
app.use(friendsRouter);

//without middleware: new request -> run route handler
//with middleware: new request -> do something -> run route handler

app.listen(PORT, () => {
  console.log(`server is up on ${PORT}`);
});
