import { env } from "@/env";

export const isLocalInstance = (): boolean => env.INSTANCE_TYPE === "local";

export const isCloudInstance = (): boolean => env.INSTANCE_TYPE === "cloud";
