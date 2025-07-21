"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { X } from "lucide-react"

import { cn } from "@/lib/utils"

import { ToasterToast } from "./toaster"

const toastVariants = cva(
  "group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-6 pr-8 shadow-lg transition-all data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full data-[state=open]:sm:slide-in-from-bottom-full",
  {
    variants: {
      variant: {
        default: "border bg-background text-foreground",
        destructive: "destructive group border-destructive bg-destructive text-destructive-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
)

const Toast = React.forwardRef<
  React.ElementRef<typeof ToasterToast>,
  React.ComponentPropsWithoutRef<typeof ToasterToast> & VariantProps<typeof toastVariants>
>(({ className, variant, ...props }, ref) => {
  return <ToasterToast ref={ref} className={cn(toastVariants({ variant }), className)} {...props} />
})
Toast.displayName = ToasterToast.displayName

const ToastAction = React.forwardRef<
  React.ElementRef<typeof ToasterToast.Action>,
  React.ComponentPropsWithoutRef<typeof ToasterToast.Action>
>(({ className, ...props }, ref) => (
  <ToasterToast.Action
    ref={ref}
    className={cn(
      "inline-flex h-8 shrink-0 items-center justify-center rounded-md border bg-transparent px-3 text-sm font-medium ring-offset-background transition-colors hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 group-[.destructive]:border-muted/40 group-[.destructive]:hover:border-destructive/30 group-[.destructive]:hover:bg-destructive group-[.destructive]:hover:text-destructive-foreground group-[.destructive]:focus:ring-destructive",
      className,
    )}
    {...props}
  />
))
ToastAction.displayName = ToasterToast.Action.displayName

const ToastClose = React.forwardRef<
  React.ElementRef<typeof ToasterToast.Close>,
  React.ComponentPropsWithoutRef<typeof ToasterToast.Close>
>(({ className, ...props }, ref) => (
  <ToasterToast.Close
    ref={ref}
    className={cn(
      "absolute right-2 top-2 rounded-md p-1 text-foreground/50 opacity-0 transition-opacity hover:text-foreground focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring group-hover:opacity-100 group-[.destructive]:text-red-300 group-[.destructive]:hover:text-red-50 group-[.destructive]:focus:ring-red-400 group-[.destructive]:focus:ring-offset-red-600",
      className,
    )}
    toast-close=""
    {...props}
  >
    <X className="h-4 w-4" />
  </ToasterToast.Close>
))
ToastClose.displayName = ToasterToast.Close.displayName

const ToastTitle = React.forwardRef<
  React.ElementRef<typeof ToasterToast.Title>,
  React.ComponentPropsWithoutRef<typeof ToasterToast.Title>
>(({ className, ...props }, ref) => (
  <ToasterToast.Title ref={ref} className={cn("text-sm font-semibold", className)} {...props} />
))
ToastTitle.displayName = ToasterToast.Title.displayName

const ToastDescription = React.forwardRef<
  React.ElementRef<typeof ToasterToast.Description>,
  React.ComponentPropsWithoutRef<typeof ToasterToast.Description>
>(({ className, ...props }, ref) => (
  <ToasterToast.Description ref={ref} className={cn("text-sm opacity-90", className)} {...props} />
))
ToastDescription.displayName = ToasterToast.Description.displayName

export { Toast, ToastAction, ToastClose, ToastTitle, ToastDescription, toastVariants }
