export type Offer = {
  provider: string;
  monthlyPriceEur: number;
  minMonths: number;
  includedKmPerMonth: number;
  deliveryWeeks: number;
};

export type Car = {
  name: string;
  segment: string;
  fuel: string;
  offers: Offer[];
};

// Demo data: fictional providers and prices for this portfolio project.
const cars: Car[] = [
  {
    name: "VW ID.4", segment: "Compact SUV", fuel: "Electric",
    offers: [
      { provider: "DriveFlex", monthlyPriceEur: 549, minMonths: 6, includedKmPerMonth: 1000, deliveryWeeks: 2 },
      { provider: "AboCar", monthlyPriceEur: 499, minMonths: 12, includedKmPerMonth: 800, deliveryWeeks: 4 },
      { provider: "UrbanRide", monthlyPriceEur: 579, minMonths: 3, includedKmPerMonth: 1500, deliveryWeeks: 1 },
    ],
  },
  {
    name: "BMW i4", segment: "Premium sedan", fuel: "Electric",
    offers: [
      { provider: "DriveFlex", monthlyPriceEur: 799, minMonths: 6, includedKmPerMonth: 1000, deliveryWeeks: 3 },
      { provider: "UrbanRide", monthlyPriceEur: 849, minMonths: 3, includedKmPerMonth: 1500, deliveryWeeks: 1 },
    ],
  },
  {
    name: "Toyota Corolla", segment: "Compact", fuel: "Hybrid",
    offers: [
      { provider: "AboCar", monthlyPriceEur: 379, minMonths: 12, includedKmPerMonth: 1000, deliveryWeeks: 3 },
      { provider: "DriveFlex", monthlyPriceEur: 399, minMonths: 6, includedKmPerMonth: 1500, deliveryWeeks: 2 },
      { provider: "UrbanRide", monthlyPriceEur: 429, minMonths: 3, includedKmPerMonth: 1500, deliveryWeeks: 1 },
    ],
  },
  { name: "Skoda Octavia", segment: "Compact", fuel: "Petrol", offers: [] },
];

// Our code does the math, so the AI never has to compare numbers itself.
function summarize(car: Car) {
  const prices = car.offers.map((offer) => offer.monthlyPriceEur);
  const terms = car.offers.map((offer) => offer.minMonths);

  return {
    name: car.name,
    segment: car.segment,
    fuel: car.fuel,
    offerCount: car.offers.length,
    cheapestPriceEur: prices.length > 0 ? Math.min(...prices) : null,
    shortestMinMonths: terms.length > 0 ? Math.min(...terms) : null,
  };
}

export function compareCarOffers(query: string) {
  const q = query.toLowerCase();
  const car = cars.find(
    (c) => q.includes(c.name.toLowerCase()) || c.name.toLowerCase().includes(q)
  );

  if (!car) return { found: false };
  return { found: true, ...summarize(car), offers: car.offers };
}

export function listCarsWithOffers() {
  return cars.filter((car) => car.offers.length > 0).map(summarize);
}