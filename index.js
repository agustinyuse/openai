const { Configuration, OpenAIApi } = require("openai");
const express = require("express");
const app = express();
const http = require("http").createServer(app);

const dotenv = require("dotenv");

// read and make secrets from the .env entries available:
dotenv.config();

const cors = require("cors");

app.use(express.json());

const whitelist = ["https://portal-demo-seven.vercel.app"]
const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || whitelist.indexOf(origin) !== -1) {
      callback(null, true)
    } else {
      callback(new Error("Not allowed by CORS"))
    }
  },
  credentials: true,
}
app.use(cors(corsOptions))

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

  const chat = {
    prompt: message,
    content: completion.data.choices[0].message.content,
  };

  res.json(chat);
});

const PORT = process.env.PORT || 3001;

http.listen(PORT, function () {
  console.log(`Servidor iniciado en el puerto ${PORT}`);
});
