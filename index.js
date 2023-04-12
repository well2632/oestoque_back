const express = require("express");
const prismaClient = require("./src/database/prismaClient");
const cors = require("cors");
const { product } = require("./src/database/prismaClient");
const app = express();
const port = 3000;

app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
  res.send("Hello world!");
});

app.post("/user/login", async (req, res) => {
  const user = await prismaClient.user.findFirst({
    where: {
      email: req.body.email,
    },
  });

  if (!user) return res.status(404).json({ error: "Usuário ou senha inválidos" });

  if (user.password === req.body.password) {
    return res.json({ ...user, password: null });
  } else {
    return res.status(404).json({ error: "Usuário ou senha inválidos" });
  }
});

app.post("/user/register", async (req, res) => {
  const existUserWithEmail = await prismaClient.user.findFirst({
    where: {
      email: req.body.email,
    },
  });

  if (existUserWithEmail) return res.status(409).json({ error: "E-mail já cadastrado!" });

  const user = await prismaClient.user.create({
    data: {
      email: req.body.email,
      password: req.body.password,
    },
  });

  res.json({ ...user, password: null });
});

app.post("/user/create", async (req, res) => {
  const user = await prismaClient.user.create({
    data: {
      email: req.body.email,
      password: req.body.password,
    },
  });
  res.send(user);
});

app.post("/product", async (req, res) => {
  const product = await prismaClient.product.create({
    data: req.body,
  });

  res.status(200).send(product);
});

app.get("/user/:id/produtos", async (req, res) => {
  const idUser = req.params.id;
  const produtos = await prismaClient.Product.findMany({
    where: {
      userId: idUser,
    },
    orderBy: {
      name: "asc",
    },
  });

  if (produtos) {
    res.status(200).send(produtos || []);
  } else {
    res.status(500).json({
      error: "Desculpe, ocorreu um erro no sistema.",
    });
  }
});

app.patch("/product/:id", async (req, res) => {
  const updateProduct = await prismaClient.product.update({
    where: {
      id: req.params.id,
    },
    data: {
      name: req.body.name,
      quantity: req.body.quantity,
    },
  });

  res.status(200).send(updateProduct);
});

app.delete("/product/:id", async (req, res) => {
  const deletedProduct = await prismaClient.product.delete({
    where: {
      id: req.params.id,
    },
  });

  res.status(200).send(deletedProduct);
});

const server = app.listen(port, () => {
  console.log(`Aplicativo rodando na porta ${port}`);
});

server.on("close", () => {
  console.log("Servidor encerrado");
});

process.on("SIGTERM", () => {
  console.log("Recebido SIGTERM. Encerrando o servidor");
  server.close(() => {
    console.log("Servidor encerrado");
  });
});
