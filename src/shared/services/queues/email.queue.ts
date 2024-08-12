import { emailWorker } from "../../../shared/workers/email.worker";
import { IEmailJob } from "../../../features/user/interfaces/user.interface";
import { BaseQueue } from "./base-queue";

class EmailQueue extends BaseQueue {
    constructor() {
        super("email");
        this.processJob('forgotPasswordEmail', 5, emailWorker.addNotificationEmail)
    }

    public addEmailJob (name: string, data: IEmailJob): void {
        this.addJob(name, data);
    }
}

export const emailQueue: EmailQueue = new EmailQueue();