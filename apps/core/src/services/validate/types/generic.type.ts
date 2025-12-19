import { z } from "zod";

export const numberSchema = z.coerce.number().int();

export const stringSchema = z.string();

export const dateSchema = z.coerce.date();
