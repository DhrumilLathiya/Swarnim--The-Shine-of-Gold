export function calculateFinalPrice({
  metalPricePerGram,
  metalWeight,
  diamondPricePerCarat = 0,
  diamondWeight = 0,
  makingCharges,
  discount = 0
}) {
  const metalCost = metalPricePerGram * metalWeight;
  const diamondCost = diamondPricePerCarat * diamondWeight;

  const grossPrice = metalCost + diamondCost + makingCharges;
  const discountAmount = grossPrice * (discount / 100);
  const finalPrice = grossPrice - discountAmount;

  return {
    metalCost,
    diamondCost,
    grossPrice,
    discountAmount,
    finalPrice
  };
}
