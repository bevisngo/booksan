import { 
  format, 
  parseISO, 
  formatDistanceToNow, 
  isToday, 
  isYesterday, 
  startOfDay, 
  isWithinInterval,
  differenceInDays
} from 'date-fns'

export const TIME_FORMATS = {
  DATE: 'MMM d, yyyy',
  TIME: 'h:mm a',
  DATETIME: 'MMM d, yyyy h:mm a',
  TIME_24H: 'HH:mm',
  DATETIME_24H: 'MMM d, yyyy HH:mm',
  ISO: "yyyy-MM-dd'T'HH:mm:ss.SSSxxx",
  DATE_SHORT: 'MM/dd/yyyy',
  MONTH_DAY: 'MMM d',
} as const

export type TimeFormat = typeof TIME_FORMATS[keyof typeof TIME_FORMATS]

/**
 * Format a date with the specified format
 */
export function formatDate(date: Date | string, formatStr: TimeFormat = TIME_FORMATS.DATE): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date
  return format(dateObj, formatStr)
}

/**
 * Get relative time (e.g., "2 hours ago", "in 3 days")
 */
export function getRelativeTime(date: Date | string): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date
  return formatDistanceToNow(dateObj, { addSuffix: true })
}

/**
 * Get a human-friendly date string
 */
export function getHumanDate(date: Date | string): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date
  
  if (isToday(dateObj)) {
    return 'Today'
  }
  
  if (isYesterday(dateObj)) {
    return 'Yesterday'
  }
  
  const daysDiff = differenceInDays(new Date(), dateObj)
  
  if (daysDiff < 7 && daysDiff > 0) {
    return `${daysDiff} day${daysDiff === 1 ? '' : 's'} ago`
  }
  
  if (daysDiff < 0 && daysDiff > -7) {
    return `In ${Math.abs(daysDiff)} day${Math.abs(daysDiff) === 1 ? '' : 's'}`
  }
  
  return formatDate(dateObj, TIME_FORMATS.DATE)
}

/**
 * Get booking-specific time display
 */
export function getBookingTimeDisplay(startTime: Date | string, endTime?: Date | string): string {
  const start = typeof startTime === 'string' ? parseISO(startTime) : startTime
  const end = endTime ? (typeof endTime === 'string' ? parseISO(endTime) : endTime) : null
  
  const dateStr = getHumanDate(start)
  const timeStr = formatDate(start, TIME_FORMATS.TIME)
  
  if (end) {
    const endTimeStr = formatDate(end, TIME_FORMATS.TIME)
    return `${dateStr} ${timeStr} - ${endTimeStr}`
  }
  
  return `${dateStr} ${timeStr}`
}

/**
 * Check if a date is within business hours
 */
export function isWithinBusinessHours(
  date: Date | string, 
  businessHours: { start: string; end: string } = { start: '09:00', end: '17:00' }
): boolean {
  const dateObj = typeof date === 'string' ? parseISO(date) : date
  const hours = dateObj.getHours()
  const minutes = dateObj.getMinutes()
  const timeInMinutes = hours * 60 + minutes
  
  const [startHour, startMin] = businessHours.start.split(':').map(Number)
  const [endHour, endMin] = businessHours.end.split(':').map(Number)
  
  const startInMinutes = (startHour ?? 0) * 60 + (startMin ?? 0)
  const endInMinutes = (endHour ?? 0) * 60 + (endMin ?? 0)
  
  return timeInMinutes >= startInMinutes && timeInMinutes <= endInMinutes
}

/**
 * Get available time slots for a given date
 */
export function getAvailableTimeSlots(
  date: Date | string,
  slotDuration: number = 60, // in minutes
  businessHours: { start: string; end: string } = { start: '09:00', end: '17:00' },
  bookedSlots: Array<{ start: Date | string; end: Date | string }> = []
): Array<{ start: Date; end: Date; available: boolean }> {
  const dateObj = typeof date === 'string' ? parseISO(date) : date
  const dayStart = startOfDay(dateObj)
  
  const [startHour, startMin] = businessHours.start.split(':').map(Number)
  const [endHour, endMin] = businessHours.end.split(':').map(Number)
  
  const businessStart = new Date(dayStart)
  businessStart.setHours(startHour ?? 0, startMin ?? 0, 0, 0)
  
  const businessEnd = new Date(dayStart)
  businessEnd.setHours(endHour ?? 0, endMin ?? 0, 0, 0)
  
  const slots: Array<{ start: Date; end: Date; available: boolean }> = []
  
  let currentTime = new Date(businessStart)
  
  while (currentTime < businessEnd) {
    const slotEnd = new Date(currentTime.getTime() + slotDuration * 60 * 1000)
    
    if (slotEnd > businessEnd) break
    
    const isBooked = bookedSlots.some(booked => {
      const bookedStart = typeof booked.start === 'string' ? parseISO(booked.start) : booked.start
      const bookedEnd = typeof booked.end === 'string' ? parseISO(booked.end) : booked.end
      
      return isWithinInterval(currentTime, { start: bookedStart, end: bookedEnd }) ||
             isWithinInterval(slotEnd, { start: bookedStart, end: bookedEnd }) ||
             (currentTime <= bookedStart && slotEnd >= bookedEnd)
    })
    
    slots.push({
      start: new Date(currentTime),
      end: new Date(slotEnd),
      available: !isBooked,
    })
    
    currentTime = new Date(currentTime.getTime() + slotDuration * 60 * 1000)
  }
  
  return slots
}

/**
 * Time zone utilities
 */
export const timeZone = {
  getUserTimeZone(): string {
    return Intl.DateTimeFormat().resolvedOptions().timeZone
  },
  
  formatInTimeZone(date: Date | string, timeZone: string): string {
    const dateObj = typeof date === 'string' ? parseISO(date) : date
    return new Intl.DateTimeFormat('en-US', {
      timeZone,
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }).format(dateObj)
  },
}
