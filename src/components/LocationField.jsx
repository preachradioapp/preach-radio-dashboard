import PropTypes from "prop-types";
import { Autocomplete, useJsApiLoader } from "@react-google-maps/api";
import { Input, InputNumber } from "antd";
import { MapPin } from "lucide-react";
import { useRef } from "react";
import { env } from "../config/env";

const LIBRARIES = ["places"];

/**
 * Controlled location value: { address, lat, lng }.
 * Uses Google Places autocomplete when a Maps key is configured; otherwise manual entry.
 */
const LocationField = ({ value = {}, onChange }) => {
  const hasKey = Boolean(env.googleMapsApiKey);
  const { isLoaded, loadError } = useJsApiLoader({
    id: "google-maps",
    googleMapsApiKey: env.googleMapsApiKey,
    libraries: LIBRARIES,
    preventGoogleFontsLoading: true,
  });
  const autocompleteRef = useRef(null);
  const patch = (next) => onChange?.({ ...value, ...next });

  const onPlaceChanged = () => {
    const place = autocompleteRef.current?.getPlace();
    if (!place?.geometry?.location) return;
    patch({
      address: place.formatted_address || place.name,
      lat: Number(place.geometry.location.lat().toFixed(6)),
      lng: Number(place.geometry.location.lng().toFixed(6)),
    });
  };

  const addressInput = (
    <Input
      prefix={<MapPin size={15} className="text-muted" />}
      placeholder={hasKey ? "Search for an address" : "Address"}
      value={value.address}
      onChange={(e) => patch({ address: e.target.value })}
    />
  );

  return (
    <div className="space-y-2">
      {hasKey && isLoaded && !loadError ? (
        <Autocomplete onLoad={(ref) => (autocompleteRef.current = ref)} onPlaceChanged={onPlaceChanged}>
          {addressInput}
        </Autocomplete>
      ) : (
        addressInput
      )}
      <div className="grid grid-cols-2 gap-2">
        <InputNumber
          className="!w-full"
          addonBefore="Lat"
          min={-90}
          max={90}
          step={0.000001}
          value={value.lat}
          onChange={(lat) => patch({ lat })}
        />
        <InputNumber
          className="!w-full"
          addonBefore="Lng"
          min={-180}
          max={180}
          step={0.000001}
          value={value.lng}
          onChange={(lng) => patch({ lng })}
        />
      </div>
      {hasKey && loadError && <p className="text-xs text-warning">Address search is unavailable; enter the location manually.</p>}
    </div>
  );
};

LocationField.propTypes = {
  value: PropTypes.shape({ address: PropTypes.string, lat: PropTypes.number, lng: PropTypes.number }),
  onChange: PropTypes.func,
};

export default LocationField;
