import express, { Express } from "express";
import { ServerRunner } from './ServerRunner';
import connectDatabase from "./connectDB"
import { config } from "./config";

// Imstagram application
class ImstagramApp {
    public initialize(): void {

        this.loadConfiguration();

        // Database connection 
        connectDatabase();

        // Create express server
        const app: Express = express();

        // Pass server to the serverRunner ansd start the server
        const server: ServerRunner = new ServerRunner(app);
        server.start();
    }

    private loadConfiguration(): void {
        config.validateConfig();
        config.cloudinaryConfig();
    }
}

// Imstagram application instance
const imstagramApp: ImstagramApp = new ImstagramApp();
// Run Imstagram application 
imstagramApp.initialize();