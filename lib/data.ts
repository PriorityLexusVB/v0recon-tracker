import type { Vehicle } from "./types"

export const generatePlaceholderData = (): Vehicle[] => {
  const makes = ["Toyota", "Honda", "Ford", "Chevrolet", "Nissan", "BMW", "Mercedes", "Audi"]
  const models = ["Camry", "Accord", "F-150", "Silverado", "Altima", "3 Series", "C-Class", "A4"]

  const vehicles: Vehicle[] = []

  for (let i = 0; i < 25; i++) {
    const make = makes[Math.floor(Math.random() * makes.length)]
    const model = models[Math.floor(Math.random() * models.length)]
    const year = 2018 + Math.floor(Math.random() * 6)
    const inventoryDate = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000)

    // Generate realistic completion status
    const throughShop = Math.random() > 0.3
    const detailComplete = throughShop ? Math.random() > 0.4 : false
    const photoComplete = detailComplete ? Math.random() > 0.3 : false

    // Generate dates based on inventory date
    const shopDone = new Date(inventoryDate.getTime() + Math.random() * 10 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0]
    const detailDone = new Date(inventoryDate.getTime() + (10 + Math.random() * 5) * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0]
    const photoDone = new Date(inventoryDate.getTime() + (15 + Math.random() * 5) * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0]

    vehicles.push({
      vin: `1HGBH41JXMN${String(100000 + i).padStart(6, "0")}`,
      stock: `ST${String(1000 + i).padStart(4, "0")}`,
      make,
      model,
      year,
      inventoryDate: inventoryDate.toISOString().split("T")[0],
      throughShop,
      detailComplete,
      photoComplete,
      shopDone,
      detailDone,
      photoDone,
    })
  }

  return vehicles
}
