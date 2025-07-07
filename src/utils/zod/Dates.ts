import { z } from "zod";

export const DatesSchema = z.object({
  createdAt: z.date(),
  createdAtShort: z.string(),
  dateOfBirth: z.date(),
  dateOfBirthShort: z.string(),
  dateOfBirthNum: z.string(),
});
