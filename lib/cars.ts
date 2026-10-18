export type CarOffer = {
  name: string;
  segment: string;
  monthlyPriceEur: number;
  minMonths: number;
  includedKmPerMonth: number;
  fuel: string;
  available: boolean;
};

// Demo data for this portfolio project, not real myAutoAbo prices.
const cars: CarOffer[] = [
  { name: "VW ID.4", segment: "Compact SUV", monthlyPriceEur: 549, minMonths: 6, includedKmPerMonth: 1000, fuel: "Electric", available: true },
  { name: "BMW i4", segment: "Premium sedan", monthlyPriceEur: 799, minMonths: 6, includedKmPerMonth: 1000, fuel: "Electric", available: true },
  { name: "Toyota Corolla", segment: "Compact", monthlyPriceEur: 399, minMonths: 3, includedKmPerMonth: 1500, fuel: "Hybrid", available: true },
  { name: "Skoda Octavia", segment: "Compact", monthlyPriceEur: 429, minMonths: 3, includedKmPerMonth: 1500, fuel: "Petrol", available: false },
];

export function findCarOffer(query: string): CarOffer | null {
  const q = query.toLowerCase();
  return (
    cars.find(
      (car) => q.includes(car.name.toLowerCase()) || car.name.toLowerCase().includes(q)
    ) ?? null
  );
}

export function listAvailableCars(): CarOffer[] {
  return cars.filter((car) => car.available);
}