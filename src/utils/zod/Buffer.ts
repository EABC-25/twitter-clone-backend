import { z } from "zod";

export const BufferSchema = z.object({
  type: z.literal("Buffer"),
  data: z.array(z.union([z.literal(0), z.literal(1)])).length(1),
});

export const BitSchema = BufferSchema.transform(val => val.data[0]);

// const bitValue = BitSchema.parse({
//   type: "Buffer",
//   data: [1],
// }); // bitValue === 1
