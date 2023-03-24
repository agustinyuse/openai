const { Configuration, OpenAIApi } = require("openai");
const express = require("express");
const app = express();
const http = require("http").createServer(app);

const dotenv = require("dotenv");

// read and make secrets from the .env entries available:
dotenv.config();

const cors = require("cors");

const io = require("socket.io")(http, {
  cors: {
    origin: process.env.frontendURL,
    methods: ["GET", "POST"],
  },
});

app.use(express.json());
app.use(cors());

io.on("connection", function (socket) {
  console.log("a user connected");
  socket.on("chat message", async function (msg) {
    const completion = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: msg }],
    });

    const message = {
      prompt: msg,
      content: completion.data.choices[0].message.content,
    };

    io.emit("chat message", message);
  });
  socket.on("disconnect", function () {
    console.log("user disconnected");
  });
});

const configuration = new Configuration({
  apiKey: process.env.openAIApiKey,
});
const openai = new OpenAIApi(configuration);

app.post("/chat", async (req, res) => {
  const { message } = req.body;

  const completion = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: [{ role: "user", content: message }],
  });
  res.json(completion.data.choices[0].message.content);
});

const PORT = process.env.PORT || 3001;

http.listen(PORT, function () {
  console.log(`Servidor iniciado en el puerto ${PORT}`);
});
