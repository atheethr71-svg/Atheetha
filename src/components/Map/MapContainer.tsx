import React, { useState, useEffect } from 'react';
import { 
  APIProvider, 
  Map, 
  Marker, 
  InfoWindow,
  useMap,
  useMapsLibrary
} from '@vis.gl/react-google-maps';

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

interface MapContainerProps {
  currentPosition: { lat: number, lng: number };
  rooms: any[];
  selectedRoom: any | null;
  currentFloor: number;
  onRoomSelect: (room: any) => void;
}

const MapContent: React.FC<{ 
  currentPosition: { lat: number, lng: number }, 
  rooms: any[], 
  selectedRoom: any | null,
  currentFloor: number,
  onRoomSelect: (room: any) => void 
}> = ({ currentPosition, rooms, selectedRoom, currentFloor, onRoomSelect }) => {
  const map = useMap();
  const mapsLib = useMapsLibrary('maps');
  const [polyline, setPolyline] = useState<google.maps.Polyline | null>(null);

  // Filter rooms for current floor
  const floorRooms = rooms.filter(r => r.floor === currentFloor);

  useEffect(() => {
    if (!map || !selectedRoom || !currentPosition) {
      if (polyline) polyline.setMap(null);
      return;
    }

    if (polyline) polyline.setMap(null);

    const isOnSameFloor = selectedRoom.floor === currentFloor;

    const newPolyline = new google.maps.Polyline({
      path: [currentPosition, { lat: selectedRoom.lat, lng: selectedRoom.lng }],
      geodesic: true,
      strokeColor: '#00f2ff',
      strokeOpacity: isOnSameFloor ? 0.8 : 0.2,
      strokeWeight: 4,
      icons: isOnSameFloor ? [{
        icon: { path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW, scale: 2 },
        offset: '100%',
        repeat: '40px'
      }] : []
    });

    newPolyline.setMap(map);
    setPolyline(newPolyline);

    // Zoom to fit if same floor, otherwise focus on destination
    if (selectedRoom.floor === currentFloor) {
      const bounds = new google.maps.LatLngBounds();
      bounds.extend(currentPosition);
      bounds.extend({ lat: selectedRoom.lat, lng: selectedRoom.lng });
      map.fitBounds(bounds, 150);
    } else {
      map.panTo({ lat: selectedRoom.lat, lng: selectedRoom.lng });
      map.setZoom(18);
    }

  }, [map, selectedRoom, currentPosition, currentFloor]);

  return (
    <>
      {/* User Marker */}
      <Marker 
        position={currentPosition} 
        title="Your Location"
        icon={{
          path: google.maps.SymbolPath.CIRCLE,
          fillColor: '#00f2ff',
          fillOpacity: 1,
          strokeWeight: 2,
          strokeColor: '#FFFFFF',
          scale: 10,
        }}
      />

      {/* Room Markers (Filter by Floor) */}
      {floorRooms.map((room, idx) => (
        <Marker
          key={idx}
          position={{ lat: room.lat, lng: room.lng }}
          onClick={() => onRoomSelect(room)}
          icon={{
            path: 'M 0,0 5,10 -5,10 z',
            fillColor: '#f43f5e',
            fillOpacity: 1,
            strokeWeight: 1,
            strokeColor: '#FFFFFF',
            scale: 1.5,
          }}
          label={{
            text: room.name,
            color: '#00f2ff',
            className: 'font-mono text-[9px] font-bold mt-8 glass px-2 py-0.5 border-none shadow-[0_0_10px_rgba(0,242,255,0.2)]'
          }}
        />
      ))}

      {/* Show navigation target even if on different floor but semi-transparently */}
      {selectedRoom && selectedRoom.floor !== currentFloor && (
        <Marker 
          position={{ lat: selectedRoom.lat, lng: selectedRoom.lng }}
          opacity={0.3}
          icon={{
            path: google.maps.SymbolPath.CIRCLE,
            fillColor: '#f43f5e',
            scale: 6
          }}
        />
      )}

      {selectedRoom && (
        <InfoWindow
          position={{ lat: selectedRoom.lat, lng: selectedRoom.lng }}
          onCloseClick={() => onRoomSelect(null)}
        >
          <div className="p-2">
            <h4 className="font-bold text-zinc-900">{selectedRoom.name}</h4>
            <p className="text-xs text-zinc-600">Navigating to this location...</p>
          </div>
        </InfoWindow>
      )}
    </>
  );
};

export const MapContainer: React.FC<MapContainerProps> = (props) => {
  const isKeyMissing = !GOOGLE_MAPS_API_KEY || 
                     GOOGLE_MAPS_API_KEY === "MY_GOOGLE_MAPS_API_KEY" || 
                     GOOGLE_MAPS_API_KEY === "REPLACE_ME_IN_SECRETS";

  if (isKeyMissing) {
    return (
      <div className="flex items-center justify-center h-full bg-hud-bg text-hud-cyan p-8 text-center map-grid">
        <div className="glass p-8 rounded-3xl border-hud-cyan/20">
          <h2 className="text-2xl font-bold mb-4 font-display">MAP INTEL OFFLINE</h2>
          <p className="text-zinc-400 text-xs font-mono uppercase tracking-widest leading-relaxed">
            Google Maps API Key required to render campus terrain.<br/>
            Inject <span className="text-hud-cyan">VITE_GOOGLE_MAPS_API_KEY</span> into project secrets.
          </p>
        </div>
      </div>
    );
  }

  return (
    <APIProvider apiKey={GOOGLE_MAPS_API_KEY}>
      <Map
        style={{ width: '100%', height: '100%' }}
        defaultCenter={props.currentPosition}
        defaultZoom={17}
        gestureHandling={'greedy'}
        disableDefaultUI={true}
        mapId={'bf51a910020fa25a'}
      >
        <MapContent {...props} />
      </Map>
    </APIProvider>
  );
};
