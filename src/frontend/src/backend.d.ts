import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export type Time = bigint;
export interface Prediction {
    result: boolean;
    colorSignal: ColorSignal;
    inputNumber: number;
    timestamp: Time;
    luckyNumbers: Uint8Array;
}
export enum ColorSignal {
    red = "red",
    green = "green",
    violet = "violet"
}
export interface backendInterface {
    getLast20Records(): Promise<Array<Prediction>>;
    submitPrediction(inputNumber: number): Promise<void>;
}
