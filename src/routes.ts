import { Application } from "express";
import { authRoutes } from "./features/auth/routes/authRoutes";
import { serverAdapter } from "./shared/services/queues/base-queue";
import { authMiddleware } from "./shared/global/helpers/auth-middleware";
import { postRoutes } from "./features/post/routes/postRoutes";
import { reactionRoutes } from "./features/reactions/routes/reactionRoutes";


const BASE_PATH = '/api/v1';

export default (app: Application) => {
    const routes = () => {
        app.use("/queues", serverAdapter.getRouter());
        app.use(BASE_PATH, authRoutes.routes());
        app.use(BASE_PATH, authRoutes.signoutRoute());

        app.use(BASE_PATH, authMiddleware.verifyUser, postRoutes.routes());
        app.use(BASE_PATH, authMiddleware.verifyUser, reactionRoutes.routes());

    };
    routes();
}