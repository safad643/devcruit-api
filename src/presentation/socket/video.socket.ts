import { Server as SocketIOServer, Socket } from 'socket.io';
import { container } from '../../di/container';
import { TYPES } from '../../di/types';
import { ITokenService } from '../../application/services';
import { IApplicationRepository, IDeveloperProfileRepository } from '../../domain/repositories';

interface VideoSocket extends Socket {
  userId?: string;
  rooms: Set<string>;
}

interface SignalPayload {
  applicationId: string;
  roundName: string;
  sdp?: RTCSessionDescriptionInit;
  candidate?: RTCIceCandidateInit;
}

export function setupVideoSocket(io: SocketIOServer): void {
  const tokenService = container.get<ITokenService>(TYPES.TokenService);
  const applicationRepo = container.get<IApplicationRepository>(TYPES.ApplicationRepository);
  const developerRepo = container.get<IDeveloperProfileRepository>(TYPES.DeveloperProfileRepository);

  const ns = io.of('/video');

  // Auth middleware
  ns.use(async (socket: VideoSocket, next) => {
    try {
      const token = socket.handshake.auth?.token || 
                    socket.handshake.headers?.authorization?.replace('Bearer ', '');
      if (!token) return next(new Error('No token'));
      
      const payload = tokenService.verifyAccessToken(token);
      socket.userId = payload.userId;
      next();
    } catch {
      next(new Error('Auth failed'));
    }
  });

  ns.on('connection', (socket: VideoSocket) => {
    const userId = socket.userId!;

    // Validate user can access this call
    async function getRoomName(applicationId: string, roundName: string): Promise<string> {
      const app = await applicationRepo.findById(applicationId);
      if (!app) throw new Error('Not found');

      const round = app.interviewRounds.find(r => r.roundName === roundName);
      if (!round) throw new Error('Round not found');

      // Check if interviewer
      const isInterviewer = round.interviewerIds.includes(userId) || app.companyId === userId;
      
      // Check if developer (resolve profile ID)
      const devProfile = await developerRepo.findByUserId(userId);
      const isDeveloper = devProfile?.id === app.developerId;

      if (!isInterviewer && !isDeveloper) throw new Error('Access denied');

      return `video:${applicationId}:${roundName}`;
    }

    // Join call
    socket.on('join-call', async (payload: SignalPayload, cb?: (err?: string) => void) => {
      try {
        const room = await getRoomName(payload.applicationId, payload.roundName);
        socket.join(room);
        socket.to(room).emit('participant-joined', { userId });
        cb?.();
      } catch (e: any) {
        cb?.(e.message);
      }
    });

    // Leave call
    socket.on('leave-call', async (payload: SignalPayload, cb?: (err?: string) => void) => {
      try {
        const room = await getRoomName(payload.applicationId, payload.roundName);
        socket.leave(room);
        socket.to(room).emit('participant-left', { userId });
        cb?.();
      } catch (e: any) {
        cb?.(e.message);
      }
    });

    // WebRTC signaling - just relay to room
    socket.on('webrtc-offer', async (payload: SignalPayload, cb?: (err?: string) => void) => {
      try {
        const room = await getRoomName(payload.applicationId, payload.roundName);
        socket.to(room).emit('webrtc-offer', { ...payload, fromUserId: userId });
        cb?.();
      } catch (e: any) {
        cb?.(e.message);
      }
    });

    socket.on('webrtc-answer', async (payload: SignalPayload, cb?: (err?: string) => void) => {
      try {
        const room = await getRoomName(payload.applicationId, payload.roundName);
        socket.to(room).emit('webrtc-answer', { ...payload, fromUserId: userId });
        cb?.();
      } catch (e: any) {
        cb?.(e.message);
      }
    });

    socket.on('webrtc-ice-candidate', async (payload: SignalPayload, cb?: (err?: string) => void) => {
      try {
        const room = await getRoomName(payload.applicationId, payload.roundName);
        socket.to(room).emit('webrtc-ice-candidate', { ...payload, fromUserId: userId });
        cb?.();
      } catch (e: any) {
        cb?.(e.message);
      }
    });

    // Cleanup on disconnect
    socket.on('disconnect', () => {
      socket.rooms.forEach(room => {
        if (room.startsWith('video:')) {
          socket.to(room).emit('participant-left', { userId });
        }
      });
    });
  });
}
