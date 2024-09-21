import express, { Express } from "express";
import { ServerRunner } from './ServerRunner';
import connectDatabase from "./connectDB"
import { config } from "./config";
import Logger from "bunyan";

const log: Logger = config.createLogger('app');

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
        ImstagramApp.handleExit();
    }

    private static handleExit(): void {
        process.on('uncaughtException', (error: Error) => {
            log.error(`There was an uncaught error: ${error}`);
            ImstagramApp.shutDownProperly(1);
        });

        process.on('unhandleRejection', (reason: Error) => {
            log.error(`Unhandled rejection at promise: ${reason}`);
            ImstagramApp.shutDownProperly(2);
        });

        process.on('SIGTERM', () => {
            log.error('Caught SIGTERM');
            ImstagramApp.shutDownProperly(2);
        });

        process.on('SIGINT', () => {
            log.error('Caught SIGINT');
            ImstagramApp.shutDownProperly(2);
        });

        process.on('exit', () => {
            log.error('Exiting');
        });
    }

    private static shutDownProperly(exitCode: number): void {
        Promise.resolve()
            .then(() => {
                log.info('Shutdown complete');
                process.exit(exitCode);
            })
            .catch((error) => {
                log.error(`Error during shutdown: ${error}`);
                process.exit(1);
            });
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