import HTTP_STATUS from "http-status-codes";
import { ObjectId } from "mongodb";
import { Request, Response } from 'express';
import { UploadApiResponse } from "cloudinary";
import JWT from "jsonwebtoken";
import { signupSchema } from "../schemas/signup";
import { authService } from "../../../shared/services/db/auth.service";
import { IAuthDocument, ISignUpData } from "../interfaces/auth.interface";
import { Helpers } from "../../../shared/global/helpers/helpers";
import { uploads } from "../../../shared/global/helpers/cloudinaryUpload";
import { joinValidation } from "../../../shared/global/decorators/joiValidationDecorators";
import { BadRequestError } from "../../../shared/global/helpers/error-handler";
import { UserCache } from "../../../shared/services/redis/user.cache";
import { authQueue } from "../../../shared/services/queues/auth.queue";
import { userQueue } from "../../../shared/services/queues/user.queue";
import { IUserDocument } from "../../../features/user/interfaces/user.interface";
import { config } from "../../../config";

const userCache: UserCache = new UserCache();

export class SignUp {
    @joinValidation(signupSchema)
    public async create(req: Request, res: Response): Promise<void> {
        const { username, email, password, avatarColor, avatarImage } = req.body;
        const checkIfUserExist: IAuthDocument = await authService.getUserByUsernameOrEmail(username, email);
        if (checkIfUserExist) {
            throw new BadRequestError('Invalid credentials');
        }
        const authObjectId: ObjectId = new ObjectId();
        const userObjectId: ObjectId = new ObjectId();
        const uId = `${Helpers.generateRandomIntegers(12)}`;
        const authData: IAuthDocument = SignUp.prototype.signupData({
            _id: authObjectId,
            uId,
            username,
            email,
            password,
            avatarColor
        });
        const result: UploadApiResponse = await uploads(avatarImage, `${userObjectId}`, true, true) as UploadApiResponse;

        if (!result?.public_id) {
            throw new BadRequestError("File upload: Error occurred. Try Again")
        }

        // Add to redis cache
        const userDataForCache: IUserDocument = SignUp.prototype.userData(authData, userObjectId);
        userDataForCache.profilePicture = `https://res.cloudinary.com/djz808ueu/image/upload/v${result.version}/${userObjectId}`;
        await userCache.saveUserToCache(`${userObjectId}`, uId, userDataForCache);

        // Add to database
        authQueue.addAuthUserJob('addAuthUserToDB', { value: authData });
        userQueue.addUserJob('addUserToDB', { value: userDataForCache });

        const userJwt: string = SignUp.prototype.signToken(authData, userObjectId);
        req.session = { jwt: userJwt };

        res.status(HTTP_STATUS.CREATED).json({ message: 'User created successfully', user: userDataForCache, token: userJwt });
    }

    
  private signToken(data: IAuthDocument, userObjectId: ObjectId): string {
    return JWT.sign(
      {
        userId: userObjectId,
        uId: data.uId,
        email: data.email,
        username: data.username,
        avatarColor: data.avatarColor
      },
      config.JWT_TOKEN!
    );
  }

    private signupData(data: ISignUpData): IAuthDocument {
        const { _id, username, email, password, avatarColor, uId } = data;
        return {
            _id,
            uId,
            username: Helpers.firstLetterUppercase(username),
            email: Helpers.lowerCase(email),
            password,
            avatarColor,
            createdAt: new Date()
        } as IAuthDocument;
    }

    private userData(data: IAuthDocument, userObjectId: ObjectId): IUserDocument {
        const { _id, username, email, uId, password, avatarColor } = data;
        return {
            _id: userObjectId,
            authId: _id,
            uId,
            username: Helpers.firstLetterUppercase(username),
            email,
            password,
            avatarColor,
            profilePicture: '',
            blocked: [],
            blockedBy: [],
            work: '',
            location: '',
            school: '',
            quote: '',
            bgImageVersion: '',
            bgImageId: '',
            followersCount: 0,
            followingCount: 0,
            postsCount: 0,
            notifications: {
                messages: true,
                reactions: true,
                comments: true,
                follows: true
            },
            social: {
                facebook: '',
                instagram: '',
                twitter: '',
                youtube: ''
            }
        } as unknown as IUserDocument;
    }
}