// This file can be used for general data fetching utilities or mock data
// if you need it for development before connecting to a real database.
// Since we're using Prisma and server actions, this file might become less critical
// or could be used for client-side data transformations/caching.

// Example: A utility to fetch all available vehicle makes/models (if not from DB)
export async function getVehicleMakesAndModels() {
  // In a real app, this might come from a database, an external API, or a static list
  return [
    { make: "Toyota", models: ["Camry", "Corolla", "RAV4", "Highlander"] },
    { make: "Honda", models: ["Civic", "Accord", "CR-V", "Pilot"] },
    { make: "Ford", models: ["F-150", "Explorer", "Escape", "Mustang"] },
    { make: "Chevrolet", models: ["Silverado", "Equinox", "Malibu", "Tahoe"] },
    { make: "BMW", models: ["3 Series", "5 Series", "X3", "X5"] },
    { make: "Mercedes-Benz", models: ["C-Class", "E-Class", "GLC", "GLE"] },
  ]
}

// Example: A utility to get a list of possible vehicle statuses
export function getVehicleStatuses() {
  return ["IN_PROGRESS", "COMPLETED", "ON_HOLD", "CANCELED", "PENDING_INSPECTION", "AWAITING_PARTS", "READY_FOR_SALE"]
}

// Example: A utility to get a list of possible user roles
export function getUserRoles() {
  return ["USER", "MANAGER", "ADMIN"]
}

// Example: A utility to get a list of possible user statuses
export function getUserStatuses() {
  return ["ACTIVE", "INACTIVE", "PENDING"]
}

// Example: A utility to get a list of common departments
export function getDepartments() {
  return ["MECHANICAL", "BODY_SHOP", "DETAIL", "PAINT", "TIRE_SHOP", "INSPECTION", "QUALITY_CONTROL", "ADMIN"]
}
