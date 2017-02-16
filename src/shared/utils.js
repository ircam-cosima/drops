// equirectanguler distance approximation in meter
// http://stackoverflow.com/questions/15736995/how-can-i-quickly-estimate-the-distance-between-two-latitude-longitude-points
export function getDistance(a, b) {
  const radius = 6371; // radius of the earth in km
  const lat1 = a[0];
  const lng1 = a[1];
  const lat2 = b[0];
  const lng2 = b[1];

  const x = (lng2 - lng1) * Math.cos(0.5 * (lat2 + lat1));
  const y = lat2 - lat1;
  const distance = radius * Math.sqrt(x * x + y * y);

  return distance * 1000;
}

// same for f**** d3 order...
export function getDistanceLngLat(a, b) {
  const radius = 6371; // radius of the earth in km
  const lat1 = a[1];
  const lng1 = a[0];
  const lat2 = b[1];
  const lng2 = b[0];

  const x = (lng2 - lng1) * Math.cos(0.5 * (lat2 + lat1));
  const y = lat2 - lat1;
  const distance = radius * Math.sqrt(x * x + y * y);

  return distance * 1000;
}
