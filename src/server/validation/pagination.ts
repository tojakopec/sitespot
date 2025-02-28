import { z } from "zod";

export const paginationSchema = z.object({
  query: z.object({
    limit: z
      .string()
      .optional()
      .refine((val) => !val || (!isNaN(Number(val)) && Number(val) > 0), {
        message: "Limit must be a positive number",
      })
      .transform((val) => (val ? Number(val) : 10)),
    offset: z
      .string()
      .optional()
      .refine((val) => !val || !isNaN(Number(val)), {
        message: "Offset must be a valid number",
      })
      .transform((val) => (val ? Number(val) : 0)),
  }),
});
