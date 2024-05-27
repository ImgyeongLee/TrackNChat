export type Chat = {
    message: string;
    isBot: boolean;
};

export type Session = {
    sessionId: string;
    roomName: string;
    isActive: boolean;
};
