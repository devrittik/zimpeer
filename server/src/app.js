import express from "express";
import { createServer } from "node:http";
import { Server } from "socket.io";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import userRoutes from "./routes/users.routes.js";
import { connectToSocket } from "./controllers/socketManager.js";

dotenv.config({ path: new URL('../.env', import.meta.url) });

const app = express();
const server = createServer(app);
const io = connectToSocket(server);

app.set("port", (process.env.PORT || 8000));
app.use(cors());
app.use(express.json({ limit: "40kb" }));
app.use(express.urlencoded({ limit: "40kb", extended: true }));

app.use("/api/v1/users", userRoutes);

app.get("/home", (req, res) => {
    return res.json({ "hello": "world" });
});

const start = async () => {
    const connectionDB = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected DB Host : ${connectionDB.connection.host}`);

    server.listen(app.get("port"), () => {
        console.log("Listening On :", app.get("port"));
    });
};

start();