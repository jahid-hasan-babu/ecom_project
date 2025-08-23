export function mileageCalculator(mileagePerLitter: any, distanceUnite: 'km' | 'mile') {
  let mileagePerLitterKm = mileagePerLitter;
  let mileagePerLitterMile = mileagePerLitter;

  // If the distance unit is in kilometers, convert it to miles
  if (distanceUnite === 'km') {
    mileagePerLitterMile = (mileagePerLitter * 0.621371).toFixed(3);  // Convert km to miles and round to 3 decimals
  } 
  // If the distance unit is in miles, convert it to kilometers
  else if (distanceUnite === 'mile') {
    mileagePerLitterKm = (mileagePerLitter * 1.60934).toFixed(3);  // Convert miles to km and round to 3 decimals
  }

  return {
    mileagePerLitterKm: parseFloat(mileagePerLitterKm),
    mileagePerLitterMile: parseFloat(mileagePerLitterMile)
  };
}
