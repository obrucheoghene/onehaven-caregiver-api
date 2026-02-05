import { EventEmitter } from "events";
import { eventLogger } from "../utils/logger";
import { MemberEventType, MemberEventPayload } from "../types";
import { emitToCaregiver } from "../config/socket";

class MemberEventEmitter extends EventEmitter {
  private static instance: MemberEventEmitter;

  private constructor() {
    super();
    this.setupListeners();
  }

  public static getInstance(): MemberEventEmitter {
    if (!MemberEventEmitter.instance) {
      MemberEventEmitter.instance = new MemberEventEmitter();
    }
    return MemberEventEmitter.instance;
  }

  private setupListeners(): void {
    this.on("member_added", (payload: MemberEventPayload) => {
      this.logEvent("member_added", payload);
      this.broadcastEvent("member_added", payload);
    });

    this.on("member_updated", (payload: MemberEventPayload) => {
      this.logEvent("member_updated", payload);
      this.broadcastEvent("member_updated", payload);
    });

    this.on("member_deleted", (payload: MemberEventPayload) => {
      this.logEvent("member_deleted", payload);
      this.broadcastEvent("member_deleted", payload);
    });
  }

  private logEvent(
    eventType: MemberEventType,
    payload: MemberEventPayload
  ): void {
    const message = `EVENT: ${eventType} — { caregiverId: "${payload.caregiverId}", memberId: "${payload.memberId}" }`;
    eventLogger.info(message);
  }

  private broadcastEvent(
    eventType: MemberEventType,
    payload: MemberEventPayload
  ): void {
    try {
      // Emit to the specific caregiver's WebSocket room
      emitToCaregiver(payload.caregiverId, eventType, {
        type: eventType,
        data: {
          memberId: payload.memberId,
          timestamp: payload.timestamp.toISOString(),
        },
      });
    } catch {
      // Socket.IO may not be initialized yet (e.g., during tests)
    }
  }

  public emitMemberEvent(
    eventType: MemberEventType,
    caregiverId: string,
    memberId: string
  ): void {
    const payload: MemberEventPayload = {
      caregiverId,
      memberId,
      timestamp: new Date(),
    };
    this.emit(eventType, payload);
  }
}

// Export singleton instance
const memberEventEmitter = MemberEventEmitter.getInstance();

export default memberEventEmitter;
