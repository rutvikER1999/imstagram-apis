import { ICommentDocument } from '../../features/comments/interfaces/comment.interface';
import { IReactionDocument } from '../../features/reactions/interfaces/reaction.interface';
import { Server, Socket } from 'socket.io';

export let socketIOPostObject: Server;

export class SocketIOPostHandler {
  private io: Server;

  constructor(io: Server) {
    this.io = io;
    socketIOPostObject = io;
  }

  public listen(): void {
    this.io.on('connection', (socket: Socket) => {
      socket.on('reaction', (reaction: IReactionDocument) => {
        this.io.emit('update like', reaction);
      });

      socket.on('comment', (data: ICommentDocument) => {
        this.io.emit('update comment', data);
      });
      console.log("Post socketion handler")
    });
  }
}
