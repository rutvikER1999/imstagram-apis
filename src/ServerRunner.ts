import { Application, json, urlencoded, Response, Request, NextFunction } from "express";
import http from "http";
import cors from "cors";
import helmet from "helmet";
import hpp from "hpp";
import cookieSession from "cookie-session";
import comppression from "compression";
import HTTP_STATUS from "http-status-codes";
import Logger from "bunyan";
import { Server } from "socket.io";
import { createClient } from "redis";
import { createAdapter } from "@socket.io/redis-adapter";
import 'express-async-errors';
import applicationRoutes from "./routes";
import { CustomError, IErrorResponse } from "./shared/global/helpers/error-handler";
import { config } from "./config";
import { SocketIOPostHandler } from "./shared/sockets/post";
import { SocketIOFollowerHandler } from "./shared/sockets/follower";
import { SocketIOUserHandler } from "./shared/sockets/user";

const SERVER_PORT = 5000;
const log: Logger = config.createLogger("server");

export class ServerRunner {
    private app: Application;
    constructor(app: Application) {
        this.app = app;
    }


    public start(): void {
        this.securityMiddleware(this.app);
        this.standardMiddleware(this.app);
        this.routeMiddleware(this.app);
        this.globalErrorhandler(this.app);
        this.startServer(this.app);
    }


    private securityMiddleware(app: Application): void {
        app.use(cookieSession({
            name: "session",
            keys: [config.SECRET_KEY_ONE!, config.SECRET_KEY_TWO!],
            maxAge: 24 * 7 * 3600000,
            secure: config.NODE_ENV !== 'development',
        }));
        app.use(hpp());
        app.use(helmet());
        app.use(cors({
            origin: config.CLIENT_URL,
            // need to add because we are using cookies
            credentials: true,
            optionsSuccessStatus: 200,
            methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
        }));
    }

    private standardMiddleware(app: Application): void {
        app.use(comppression());
        app.use(json({ limit: "50mb" }));
        app.use(urlencoded({ extended: true, limit: "50mb" }));
    }

    private routeMiddleware(app: Application): void {
        applicationRoutes(app);
    }

    private async startServer(app: Application): Promise<void> {
        try {
            const httpServer: http.Server = new http.Server(app);
            const socketIo: Server = await this.createSocketIO(httpServer);
            this.startHttpServer(httpServer);
            this.socketIOConnections(socketIo);
        } catch (error) {
            log.error("error in startServer", error);
        }
    }

    private globalErrorhandler(app: Application): void {
        app.all("*", (req: Request, res: Response) => {
            res.status(HTTP_STATUS.NOT_FOUND).json({
                message: `${req.originalUrl} not found`,
            })
        });
        app.use((error: IErrorResponse, _req: Request, res: Response, next: NextFunction) => {
            log.error(error);
            if (error instanceof CustomError) {
                return res.status(error.statusCode).json(error.serializeErrors());
            }
            next();
        });
    }

    private async createSocketIO(httpServer: http.Server): Promise<Server> {
        const io: Server = new Server(httpServer, {
            cors: {
                origin: config.CLIENT_URL,
                methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
            }
        })
        const publicClient = createClient({ url: config.REDIS_HOST });
        const subClient = publicClient.duplicate();
        await Promise.all([publicClient.connect(), subClient.connect()]);
        io.adapter(createAdapter(publicClient, subClient));
        return io;
    }

    private startHttpServer(httpServer: http.Server): void {
        log.info("server has started with process", process.pid);
        httpServer.listen(SERVER_PORT, () => {
            log.info("Server running on port: ", SERVER_PORT)
        })
    }

    private socketIOConnections(io: Server): void {
        const postSocketHandler: SocketIOPostHandler = new SocketIOPostHandler(io);
        const followerSocketHandler: SocketIOFollowerHandler = new SocketIOFollowerHandler(io);
        const userSocketHandler: SocketIOUserHandler = new SocketIOUserHandler(io);

        postSocketHandler.listen();
        followerSocketHandler.listen();
        userSocketHandler.listen();
    }
}