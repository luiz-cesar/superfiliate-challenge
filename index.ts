import { calculateCartController } from "./controllers/cart";
import { forEach } from "ramda";
import { buildEndpointRegister } from "./common/requests";
const express = require("express");

const PORT = "8080";

const app = express();
app.use(express.json());

const routes: ReturnType<typeof buildEndpointRegister>[] = [
  calculateCartController,
];

forEach((route) => app[route.method](route.path, route.handler), routes);

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});
