import { z } from "zod";

export const rsvpSchema = z
  .object({
    id: z.string().uuid().optional(),
    name: z.string().trim().min(1).max(100),
    attendance: z.enum(["in", "out"]),
    guests: z.number().int().min(0).max(20),
    phone: z.string().trim().max(40).default(""),
    message: z.string().trim().max(400).default(""),
    website: z.string().max(0).default(""),
  })
  .superRefine((value, context) => {
    if (value.attendance === "in" && value.guests < 1)
      context.addIssue({
        code: "custom",
        path: ["guests"],
        message: "Include at least one guest.",
      });
    if (value.attendance === "out" && value.guests !== 0)
      context.addIssue({
        code: "custom",
        path: ["guests"],
        message: "Declined responses must have zero guests.",
      });
  });

export type RsvpInput = z.infer<typeof rsvpSchema>;
export type RsvpRecord = Omit<RsvpInput, "id" | "website"> & {
  id: string;
  submittedAt: string;
  updatedAt: string;
};

export const rsvpRecordsSchema = z
  .array(
    z.object({
      id: z.string().uuid(),
      name: z.string().max(100),
      attendance: z.enum(["in", "out"]),
      guests: z.number().int().min(0).max(20),
      phone: z.string().max(40),
      message: z.string().max(400),
      submittedAt: z.string().datetime(),
      updatedAt: z.string().datetime(),
    }),
  )
  .max(5000);
