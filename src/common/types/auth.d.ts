export interface AuthenticationStartResponse {
    challenge: string;
    userId: string;
    userName: string;
    userDisplayName: string;
    attestationOptions: any;
}