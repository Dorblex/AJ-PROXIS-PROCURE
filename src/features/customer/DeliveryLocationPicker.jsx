import { useState, useEffect, useRef } from "react";
import { CheckCircle2, MapPin, Navigation } from "lucide-react";
import { Btn } from "../../atoms/Btn.jsx";
import { Field } from "../../atoms/Field.jsx";
import { TextInput } from "../../atoms/TextInput.jsx";
import { TextArea } from "../../atoms/TextArea.jsx";
import { C } from "../../shared/tokens.js";
import { guessCoords } from "../../shared/helpers.js";

export function DeliveryLocationPicker({ address, onAddressChange, label = "Delivery Address" }) {
  const [coords, setCoords] = useState(null);
  const [geoStatus, setGeoStatus] = useState("idle"); // idle | loading | success | error
  const [geoError, setGeoError] = useState("");
  const [manualMode, setManualMode] = useState(false);
  const [manualLat, setManualLat] = useState("");
  const [manualLon, setManualLon] = useState("");
  const geoTimerRef = useRef(null);
  const geoSettledRef = useRef(false);

  useEffect(() => () => { if (geoTimerRef.current) clearTimeout(geoTimerRef.current); }, []);

  function applyCoords(lat, lon) {
    setCoords({ lat, lon });
    setGeoStatus("success");
    const pin = `GPS Pin (${lat.toFixed(5)}, ${lon.toFixed(5)})`;
    onAddressChange(address && address.trim() ? `${address.trim()} — ${pin}` : pin);
  }

  function useMyLocation() {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setGeoStatus("error");
      setGeoError("Geolocation isn't supported in this browser. Enter coordinates manually below instead.");
      return;
    }
    setGeoStatus("loading");
    setGeoError("");
    geoSettledRef.current = false;

    // This preview may run inside a sandboxed frame that never grants location
    // permission — some browsers then leave the request hanging silently instead
    // of calling back at all. This local timeout guarantees the UI never gets stuck.
    geoTimerRef.current = setTimeout(() => {
      if (geoSettledRef.current) return;
      geoSettledRef.current = true;
      setGeoStatus("error");
      setGeoError("Couldn't reach your location — this preview may be blocking location access. Try again on the published app, or enter coordinates manually below.");
    }, 8000);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        if (geoSettledRef.current) return;
        geoSettledRef.current = true;
        clearTimeout(geoTimerRef.current);
        applyCoords(pos.coords.latitude, pos.coords.longitude);
      },
      (err) => {
        if (geoSettledRef.current) return;
        geoSettledRef.current = true;
        clearTimeout(geoTimerRef.current);
        setGeoStatus("error");
        setGeoError(
          err.code === 1 ? "Location permission was denied — allow location access, or enter coordinates manually below."
          : err.code === 2 ? "Your location is currently unavailable. Try again or enter coordinates manually."
          : "Getting your location timed out. Try again or enter coordinates manually."
        );
      },
      { enableHighAccuracy: true, timeout: 7000, maximumAge: 0 }
    );
  }

  const center = coords || guessCoords(address);
  const mapSrc = `https://maps.google.com/maps?q=${center.lat},${center.lon}&z=15&output=embed`;
  const mapLink = `https://www.google.com/maps?q=${center.lat},${center.lon}&z=15`;

  return (
    <div>
      <Field label={label}><TextArea rows={2} value={address} onChange={(e) => onAddressChange(e.target.value)} placeholder="Where should this be delivered?" /></Field>
      <div className="flex flex-wrap items-center gap-2 mt-2">
        <Btn size="sm" variant="ghost" icon={MapPin} disabled={geoStatus === "loading"} onClick={useMyLocation}>
          {geoStatus === "loading" ? "Getting your location…" : "Use My Current GPS Location"}
        </Btn>
        {geoStatus === "success" && <span className="text-xs flex items-center gap-1" style={{ color: C.green }}><CheckCircle2 size={13} /> Location pinned on the map</span>}
      </div>
      {geoStatus === "error" && (
        <div className="mt-1.5">
          <p className="text-xs" style={{ color: C.red }}>{geoError}</p>
          {!manualMode ? (
            <button type="button" onClick={() => setManualMode(true)} className="text-xs underline mt-1" style={{ color: C.brand }}>Enter coordinates manually instead</button>
          ) : (
            <div className="flex flex-wrap items-end gap-2 mt-2">
              <Field label="Latitude"><TextInput className="w-32" value={manualLat} onChange={(e) => setManualLat(e.target.value)} placeholder="5.6037" /></Field>
              <Field label="Longitude"><TextInput className="w-32" value={manualLon} onChange={(e) => setManualLon(e.target.value)} placeholder="-0.1870" /></Field>
              <Btn size="sm" onClick={() => {
                const lat = parseFloat(manualLat), lon = parseFloat(manualLon);
                if (!isNaN(lat) && !isNaN(lon)) { applyCoords(lat, lon); setManualMode(false); }
              }}>Pin It</Btn>
            </div>
          )}
        </div>
      )}
      <div className="mt-3 rounded overflow-hidden border" style={{ borderColor: C.border, height: 200 }}>
        <iframe title="Delivery location — Google Maps" src={mapSrc} className="w-full h-full" style={{ border: 0 }} loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
      </div>
      <div className="flex items-center justify-between mt-1.5">
        <span className="text-[11px]" style={{ color: C.slate }}>Pinned: {center.lat.toFixed(5)}, {center.lon.toFixed(5)}</span>
        <a href={mapLink} target="_blank" rel="noreferrer" className="text-[11px] underline inline-flex items-center gap-1" style={{ color: C.brand }}><Navigation size={11} /> Open in Google Maps</a>
      </div>
    </div>
  );
}

