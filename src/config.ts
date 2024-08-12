import dotenv from "dotenv";
import bunyan from "bunyan";
import cloudinary from "cloudinary";
dotenv.config({});

class Config {
    public DATABASE_URL: string;
    public JWT_TOKEN: string;
    public NODE_ENV: string;
    public SECRET_KEY_ONE: string;
    public SECRET_KEY_TWO: string;
    public CLIENT_URL: string;
    public REDIS_HOST: string;
    public CLOUD_NAME: string;
    public CLOUD_API_KEY: string;
    public CLOUD_API_SECRET: string;
    public SENDER_EMAIL: string;
    public SENDER_EMAIL_PASSWORD: string;
    public SENDGRID_API_KEY: string;
    public SENDGRID_SENDER: string;
    private readonly DEFAULT_DATABASE_URL = "mongodb://localhost:27017/imstagram";

    constructor() {
        this.DATABASE_URL = process.env.DATABASE_URL ?? this.DEFAULT_DATABASE_URL;
        this.JWT_TOKEN = process.env.JWT_TOKEN ?? "";
        this.NODE_ENV = process.env.NODE_ENV ?? "";
        this.SECRET_KEY_ONE = process.env.SECRET_KEY_ONE ?? "";
        this.SECRET_KEY_TWO = process.env.SECRET_KEY_TWO ?? "";
        this.CLIENT_URL = process.env.CLIENT_URL ?? "";
        this.REDIS_HOST = process.env.REDIS_HOST ?? "";
        this.CLOUD_NAME = process.env.CLOUD_NAME ?? "";
        this.CLOUD_API_KEY = process.env.CLOUD_API_KEY ?? "";
        this.CLOUD_API_SECRET = process.env.CLOUD_API_SECRET ?? "";
        this.SENDER_EMAIL = process.env.SENDER_EMAIL ?? "";
        this.SENDER_EMAIL_PASSWORD = process.env.SENDER_EMAIL_PASSWORD ?? "";
        this.SENDGRID_API_KEY = process.env.SENDGRID_API_KEY ?? "";
        this.SENDGRID_SENDER = process.env.SENDGRID_SENDER ?? "";
    }

    public createLogger(name: string): bunyan {
        return bunyan.createLogger({ name, level: "info" });
    }

    public validateConfig(): void {
        for (const [key, value] of Object.entries(this)) {
            if (value === undefined) {
                throw new Error(`Configuration ${key} is missing`)
            }
        }
    }
    public cloudinaryConfig(): void {
        cloudinary.v2.config({
            cloud_name: this.CLOUD_NAME,
            api_key: this.CLOUD_API_KEY,
            api_secret: this.CLOUD_API_SECRET
        })
    }
};

export const config: Config = new Config();