import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

interface PresenceUser {
  userId: string;
  name: string;
  color: string;
  cursor?: { x: number; y: number };
  canvasId: string;
}

@WebSocketGateway({
  cors: { origin: '*', credentials: true },
  namespace: '/canvas',
})
export class CanvasGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private presence = new Map<string, PresenceUser>(); // socketId → user

  handleConnection(client: Socket) {
    console.log(`Canvas WS connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    const user = this.presence.get(client.id);
    if (user) {
      this.server.to(user.canvasId).emit('presence:leave', { userId: user.userId });
      this.presence.delete(client.id);
    }
  }

  @SubscribeMessage('canvas:join')
  handleJoin(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { canvasId: string; userId: string; name: string; color: string },
  ) {
    client.join(data.canvasId);
    const user: PresenceUser = {
      userId: data.userId,
      name: data.name,
      color: data.color || '#6366f1',
      canvasId: data.canvasId,
    };
    this.presence.set(client.id, user);

    // Notify others
    client.to(data.canvasId).emit('presence:join', user);

    // Send current presence list to joining user
    const canvasUsers = [...this.presence.values()].filter(
      (u) => u.canvasId === data.canvasId,
    );
    client.emit('presence:list', canvasUsers);
  }

  @SubscribeMessage('canvas:leave')
  handleLeave(@ConnectedSocket() client: Socket, @MessageBody() data: { canvasId: string }) {
    client.leave(data.canvasId);
    const user = this.presence.get(client.id);
    if (user) {
      this.server.to(data.canvasId).emit('presence:leave', { userId: user.userId });
      this.presence.delete(client.id);
    }
  }

  @SubscribeMessage('cursor:move')
  handleCursorMove(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { canvasId: string; x: number; y: number },
  ) {
    const user = this.presence.get(client.id);
    if (user) {
      user.cursor = { x: data.x, y: data.y };
      client.to(data.canvasId).emit('cursor:update', {
        userId: user.userId,
        name: user.name,
        color: user.color,
        x: data.x,
        y: data.y,
      });
    }
  }

  @SubscribeMessage('node:update')
  handleNodeUpdate(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { canvasId: string; nodeId: string; changes: any },
  ) {
    client.to(data.canvasId).emit('node:updated', data);
  }

  @SubscribeMessage('node:create')
  handleNodeCreate(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { canvasId: string; node: any },
  ) {
    client.to(data.canvasId).emit('node:created', data);
  }

  @SubscribeMessage('node:delete')
  handleNodeDelete(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { canvasId: string; nodeId: string },
  ) {
    client.to(data.canvasId).emit('node:deleted', data);
  }

  broadcastToCanvas(canvasId: string, event: string, payload: any) {
    this.server.to(canvasId).emit(event, payload);
  }
}
