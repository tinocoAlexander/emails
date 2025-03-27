import bodyParser from "body-parser";
import express from "express";
import emailRoutes from "./routes/emailRoute.js";
import { userEvents } from "./services/rabbitServiceEvent.js";

const app = express();

app.use(bodyParser.json());
app.use('/app/email', emailRoutes);

userEvents().catch((err) => {
    console.error('Error iniciando el consumidor de eventos:',err);
})

export default app;