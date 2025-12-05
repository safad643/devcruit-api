import { Server as SocketIOServer, Socket } from 'socket.io';
import { container } from '../../di/container';
import { TYPES } from '../../di/types';
import { ITokenService } from '../../application/services';
import { IApplicationRepository, IDeveloperProfileRepository } from '../../domain/repositories';

interface VideoSocket extends Socket {
  userId?: string;
  rooms: Set<string>;
  joinedRooms?: Map<string, string>; // key: applicationId:roundName, value: roomName
}

// WebRTC types for Node.js (browser types don't exist here)
interface SessionDescription {
  type: 'offer' | 'answer' | 'pranswer' | 'rollback';
  sdp: string;
}

interface IceCandidate {
  candidate: string;
  sdpMLineIndex: number | null;
  sdpMid: string | null;
  usernameFragment: string | null;
}

interface SignalPayload {
  applicationId: string;
  roundName: string;
  sdp?: SessionDescription;
  candidate?: IceCandidate;
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
      socket.joinedRooms = new Map();
      next();
    } catch {
      next(new Error('Auth failed'));
    }
  });

  ns.on('connection', (socket: VideoSocket) => {
    const userId = socket.userId!;
    const joinedRooms = socket.joinedRooms!;

    // Validate access and return room name (only called on join)
    async function validateAndGetRoom(applicationId: string, roundName: string): Promise<string> {
      const app = await applicationRepo.findById(applicationId);
      if (!app) throw new Error('Application not found');

      const round = app.interviewRounds.find(r => r.roundName === roundName);
      if (!round) throw new Error('Interview round not found');

      // Check if interviewer
      const isInterviewer = round.interviewerIds.includes(userId) || app.companyId === userId;

      // Check if developer (resolve profile ID)
      const devProfile = await developerRepo.findByUserId(userId);
      const isDeveloper = devProfile?.id === app.developerId;

      if (!isInterviewer && !isDeveloper) throw new Error('Access denied');

      return `video:${applicationId}:${roundName}`;
    }

    // Get cached room name (used for all signals after join)
    function getCachedRoom(applicationId: string, roundName: string): string {
      const key = `${applicationId}:${roundName}`;
      const room = joinedRooms.get(key);
      if (!room) throw new Error('Not joined to this call');
      return room;
    }

    // Join call - validate and cache
    socket.on('join-call', async (payload: SignalPayload, cb?: (err?: string) => void) => {
      try {
        const room = await validateAndGetRoom(payload.applicationId, payload.roundName);
        const key = `${payload.applicationId}:${payload.roundName}`;
        joinedRooms.set(key, room);
        socket.join(room);
        socket.to(room).emit('participant-joined', { userId });
        cb?.();
      } catch (e: any) {
        cb?.(e.message);
      }
    });

    // Leave call - use cached room
    socket.on('leave-call', async (payload: SignalPayload, cb?: (err?: string) => void) => {
      try {
        const room = getCachedRoom(payload.applicationId, payload.roundName);
        const key = `${payload.applicationId}:${payload.roundName}`;
        joinedRooms.delete(key);
        socket.leave(room);
        socket.to(room).emit('participant-left', { userId });
        cb?.();
      } catch (e: any) {
        cb?.(e.message);
      }
    });

    // WebRTC signaling - use cached room (no DB queries)
    socket.on('webrtc-offer', (payload: SignalPayload, cb?: (err?: string) => void) => {
      try {
        const room = getCachedRoom(payload.applicationId, payload.roundName);
        socket.to(room).emit('webrtc-offer', { ...payload, fromUserId: userId });
        cb?.();
      } catch (e: any) {
        cb?.(e.message);
      }
    });

    socket.on('webrtc-answer', (payload: SignalPayload, cb?: (err?: string) => void) => {
      try {
        const room = getCachedRoom(payload.applicationId, payload.roundName);
        socket.to(room).emit('webrtc-answer', { ...payload, fromUserId: userId });
        cb?.();
      } catch (e: any) {
        cb?.(e.message);
      }
    });

    socket.on('webrtc-ice-candidate', (payload: SignalPayload, cb?: (err?: string) => void) => {
      try {
        const room = getCachedRoom(payload.applicationId, payload.roundName);
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
      joinedRooms.clear();
    });
  });
}
