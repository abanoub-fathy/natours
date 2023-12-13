const EARTH_RADIUS_IN_MILES = 3963.2;
const EARTH_RADIUS_IN_KM = 6371;

const KM_MULTIPLIER = 0.001;
const MILES_MULTIPLIER = 0.000621371192;

const milesToRadian = (miles) => miles / EARTH_RADIUS_IN_MILES;
const kmToRadian = (kilometers) => kilometers / EARTH_RADIUS_IN_KM;

module.exports = {
  milesToRadian,
  kmToRadian,
  KM_MULTIPLIER,
  MILES_MULTIPLIER,
};
