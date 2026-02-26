import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export type Time = bigint;
export interface Message {
    content: string;
    file?: ExternalBlob;
    mimeType?: string;
    fileName?: string;
    sender: Principal;
    timestamp: Time;
}
export interface TimetableEntry {
    id: bigint;
    day: string;
    startTime: bigint;
    title: string;
    endTime: bigint;
    recurrence: Recurrence;
}
export interface TimetableEntryInput {
    day: string;
    startTime: bigint;
    title: string;
    endTime: bigint;
    recurrence: Recurrence;
}
export interface UserProfile {
    principal: Principal;
    displayName: string;
    timeZone: string;
}
export enum Recurrence {
    weekday = "weekday",
    weekend = "weekend",
    none = "none"
}
export enum RegisterResult {
    invalidInput = "invalidInput",
    anonymousCaller = "anonymousCaller",
    slotFull = "slotFull",
    success = "success",
    alreadyRegistered = "alreadyRegistered"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addTimetableEntry(entryInput: TimetableEntryInput): Promise<TimetableEntry>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    deleteTimetableEntry(entryId: bigint): Promise<void>;
    getAllCallerTimetableEntries(): Promise<Array<TimetableEntry>>;
    getAllMessages(): Promise<Array<Message>>;
    getAllUserProfiles(): Promise<Array<UserProfile>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    register(displayName: string, timeZone: string): Promise<RegisterResult>;
    resetSystem(passcode: string): Promise<boolean>;
    saveCallerUserProfile(displayName: string, timeZone: string): Promise<void>;
    sendMessage(content: string, file: ExternalBlob | null, fileName: string | null, mimeType: string | null): Promise<void>;
    updateTimetableEntry(entryId: bigint, updatedInput: TimetableEntryInput): Promise<TimetableEntry>;
}
