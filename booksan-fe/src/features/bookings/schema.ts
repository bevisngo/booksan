import { z } from 'zod'

export const createBookingSchema = z.object({
  venueId: z.string().min(1, 'Venue is required'),
  startTime: z.string().min(1, 'Start time is required'),
  endTime: z.string().min(1, 'End time is required'),
  notes: z.string().max(500, 'Notes cannot exceed 500 characters').optional(),
})

export const updateBookingSchema = z.object({
  status: z.enum(['confirmed', 'cancelled']).optional(),
  cancellationReason: z.string().max(500, 'Cancellation reason cannot exceed 500 characters').optional(),
})

export type CreateBookingFormData = z.infer<typeof createBookingSchema>
export type UpdateBookingFormData = z.infer<typeof updateBookingSchema>
