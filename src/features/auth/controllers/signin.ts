import HTTP_STATUS from "http-status-codes";
import { Request, Response } from 'express';
import JWT from "jsonwebtoken";
import { authService } from "../../../shared/services/db/auth.service";
import { IAuthDocument } from "../interfaces/auth.interface";
import { joinValidation } from "../../../shared/global/decorators/joiValidationDecorators";
import { BadRequestError } from "../../../shared/global/helpers/error-handler";
import { IUserDocument } from "../../../features/user/interfaces/user.interface";
import { config } from "../../../config";
import { loginSchema } from "../schemas/signin";
import { userService } from "../../../shared/services/db/user.service";

export class SignIn {

    @joinValidation(loginSchema)
    public async read(req: Request, res: Response): Promise<void> {
        const { username, password } = req.body;
        const existingUser: IAuthDocument = await authService.getAuthUserByUsername(username);

        if(!existingUser) {
            throw new BadRequestError("Invalida credentials");
        }

        const passwordsMatch: boolean = await existingUser.comparePassword(password);
        if (!passwordsMatch) {
          throw new BadRequestError('Invalid credentials');
        }
        const user: IUserDocument = await userService.getUserByAuthId(`${existingUser._id}`);
        const userJwt: string = JWT.sign(
          {
            userId: user._id,
            uId: existingUser.uId,
            email: existingUser.email,
            username: existingUser.username,
            avatarColor: existingUser.avatarColor
          },
          config.JWT_TOKEN!
        );
        req.session = { jwt: userJwt };
      res.status(HTTP_STATUS.OK).json({ message: 'User login successfully', user: existingUser, token: userJwt });
    }
}