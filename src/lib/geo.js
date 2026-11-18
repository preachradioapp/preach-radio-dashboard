/** Form rule + GeoJSON helpers for the { address, lat, lng } value used by LocationField. */
export const locationRule = {
  required: true,
  validator:(_, v) => {
    if (!v?.address?.trim()) return Promise.reject(new Error("Enter an address"));
    if (!Number.isFinite(v.lat) || !Number.isFinite(v.lng)) return Promise.reject(new Error("Latitude and longitude are required"));
    return Promise.resolve();
  },
};

/** GeoJSON helpers — backend stores [lng, lat]. */
export const toGeoPoint = ({ lat, lng }) => ({ type: "Point", coordinates: [lng, lat] });
export const fromGeoPoint = (address, location) => ({
  address: address || "",
  lat: location?.coordinates?.[1],
  lng: location?.coordinates?.[0],
});
