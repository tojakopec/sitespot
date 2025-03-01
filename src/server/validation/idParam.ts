import { z } from "zod";

export const idParamSchema = z.object({
  params: z.object({
    id: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
      message: "ID must be an integer",
    }),
  }),
});

export type IdFromParams = z.infer<typeof idParamSchema>;
