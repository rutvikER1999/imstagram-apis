import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';
import { UserCache } from '../../../shared/services/redis/user.cache';
import { userQueue } from '../../../shared/services/queues/user.queue';
import { joinValidation } from '../../../shared/global/decorators/joiValidationDecorators';
import { notificationSettingsSchema } from '../../user/schemes/info';

const userCache: UserCache = new UserCache();

export class UpdateSettings {
  @joinValidation(notificationSettingsSchema)
  public async notification(req: Request, res: Response): Promise<void> {
    await userCache.updateSingleUserItemInCache(`${req.currentUser!.userId}`, 'notifications', req.body);
    userQueue.addUserJob('updateNotificationSettings', {
      key: `${req.currentUser!.userId}`,
      value: req.body
    });
    res.status(HTTP_STATUS.OK).json({ message: 'Notification settings updated successfully', settings: req.body });
  }
}
