import Logger from 'bunyan';
import { BaseCache } from './base.cache';
import { config } from '../../../config';

const log: Logger = config.createLogger('redisConnection');

class RedisConnection extends BaseCache {
    constructor() {
        super('redisConnection');
    }

    async connect(): Promise<void> {
        try {
            await this.client.connect();
        } catch (error) {
            log.error(error);
        }
    }
}

export const redisConnection: RedisConnection = new RedisConnection();