import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function daysSince(dateString: string | undefined, endDate?: string): number {
  if (!dateString) return 0
  const startDate = new Date(dateString)
  const endDateObj = endDate ? new Date(endDate) : new Date()
  const diffTime = endDateObj.getTime() - startDate.getTime()
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

export function isOverdue(dateString: string | undefined, completed: boolean, threshold = 5): boolean {
  if (!dateString || completed) return false
  return daysSince(dateString) > threshold
}

export function formatDate(dateString: string | undefined): string {
  if (!dateString) return "Not set"
  return new Date(dateString).toLocaleDateString()
}
