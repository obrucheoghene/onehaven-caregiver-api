import { EventEmitter } from 'events';
import { eventLogger } from '../utils/logger';
import { MemberEventType, MemberEventPayload } from '../types';

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
    this.on('member_added', (payload: MemberEventPayload) => {
      this.logEvent('member_added', payload);
    });

    this.on('member_updated', (payload: MemberEventPayload) => {
      this.logEvent('member_updated', payload);
    });

    this.on('member_deleted', (payload: MemberEventPayload) => {
      this.logEvent('member_deleted', payload);
    });
  }

  private logEvent(eventType: MemberEventType, payload: MemberEventPayload): void {
    const message = `EVENT: ${eventType} — { caregiverId: "${payload.caregiverId}", memberId: "${payload.memberId}" }`;
    eventLogger.info(message);
  }

  public emitMemberEvent(eventType: MemberEventType, caregiverId: string, memberId: string): void {
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
