
import express, { Router } from 'express';
import { SignUp } from '../controllers/signup';
import { SignIn } from '../controllers/signin';
import { SignOut } from '../controllers/signout';
import { Password } from '../controllers/password';

class AuthRoutes {
  private router: Router;

  constructor() {
    this.router = express.Router();
  }

  public routes(): Router {
    this.router.post('/signup', SignUp.prototype.create);
    this.router.post('/signin', SignIn.prototype.read);
    this.router.post('/forgot-password', Password.prototype.create);
    this.router.post('/reset-password/:token', Password.prototype.update);
    return this.router;
  }
  public signoutRoute(): Router {
    this.router.post('/signout', SignOut.prototype.update);
    return this.router;
  }
}

export const authRoutes: AuthRoutes = new AuthRoutes();