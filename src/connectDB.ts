import mongoose from "mongoose";
import { config } from "./config";
import Logger from "bunyan";

const log: Logger = config.createLogger("server");

export default () => {
    const connect = () => {
        mongoose.connect(`${config.DATABASE_URL}`).then(() => {
            log.info("Successfully connected to database");
        }).catch((error) => {
            log.error('Error while connecting database', error);
            // will exit current proceess which is created by node.js
            return process.exit(1);
        })
    }
    connect();
    mongoose.connection.on("disconnected", connect);
}