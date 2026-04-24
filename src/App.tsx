/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { MapContainer } from '@/components/Map/MapContainer';
import { ChatWidget } from '@/components/Chat/ChatWidget';
import { VoiceButton } from '@/components/Voice/VoiceButton';
import { useLocation } from '@/hooks/useLocation';
import { Navigation as NavIcon, Map as MapIcon, Info, Search, LogIn, LogOut, User as UserIcon } from 'lucide-react';
import { motion } from 'motion/react';
import { useAuth } from '@/context/AuthContext';
import { getRooms, checkConnection, Room } from '@/services/roomService';

const MOCK_ROOMS: Room[] = [
  { name: "E-101", lat: 12.9718, lng: 77.5948, floor: 1 },
  { name: "E-102", lat: 12.9719, lng: 77.5947, floor: 1 },
  { name: "G-10", lat: 12.9717, lng: 77.5946, floor: 0 },
  { name: "Admin Block", lat: 12.9715, lng: 77.5940, floor: 0 },
  { name: "Library", lat: 12.9720, lng: 77.5950, floor: 2 },
  { name: "Cafeteria", lat: 12.9710, lng: 77.5945, floor: 0 },
];

export default function App() {
  const { user, login, logout, loading: authLoading } = useAuth();
  const { location, error: locationError } = useLocation();
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [rooms, setRooms] = useState<Room[]>(MOCK_ROOMS);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [currentFloor, setCurrentFloor] = useState(0);

  useEffect(() => {
    if (user) {
      checkConnection();
      fetchRooms();
    }
  }, [user]);

  const fetchRooms = async () => {
    setIsRefreshing(true);
    try {
      const dbRooms = await getRooms();
      if (dbRooms && dbRooms.length > 0) {
        setRooms(dbRooms);
      }
    } catch (error) {
      console.error("Failed to fetch rooms:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const currentPos = location || { lat: 12.9716, lng: 77.5946 };

  const handleVoiceResult = (text: string) => {
    const room = rooms.find(r => r.name.toLowerCase().includes(text.toLowerCase()));
    if (room) {
      setSelectedRoom(room);
      setCurrentFloor(room.floor);
    }
  };

  if (authLoading) {
    return (
      <div className="h-screen w-full bg-[#05070a] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-hud-cyan/20 border-t-hud-cyan rounded-full animate-spin" />
          <p className="text-hud-cyan/50 text-xs font-mono uppercase tracking-widest animate-pulse">Initializing Intel...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="h-screen w-full bg-[#05070a] flex items-center justify-center p-6 map-grid">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full glass p-10 rounded-3xl shadow-2xl text-center border-hud-cyan/20"
        >
          <div className="w-16 h-16 bg-hud-cyan flex items-center justify-center mx-auto mb-8 clip-path-polygon shadow-[0_0_20px_rgba(0,242,255,0.3)]">
            <span className="text-black font-black text-2xl">S</span>
          </div>
          <h1 className="text-4xl font-bold mb-3 tracking-tighter leading-none">SAIT NAVIGATOR</h1>
          <p className="text-hud-cyan font-mono text-[10px] uppercase tracking-[0.2em] opacity-80 mb-10">Campus Intel v2.4.0</p>
          <button 
            onClick={login}
            className="w-full flex items-center justify-center gap-3 bg-hud-cyan text-black font-black py-4 rounded-lg hover:brightness-110 transition-all glow-cyan active:scale-95 uppercase tracking-widest text-sm"
          >
            <LogIn className="w-5 h-5" />
            Establish Link
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-screen bg-[#05070a] text-[#e0e6ed] font-sans overflow-hidden">
      {/* Top HUD: Branding & Status */}
      <div className="absolute top-0 left-0 w-full p-6 flex justify-between items-start z-10 pointer-events-none">
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex flex-col"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-hud-cyan flex items-center justify-center rounded-sm clip-path-polygon shadow-[0_0_15px_rgba(0,242,255,0.4)]">
              <span className="text-black font-black text-xl">S</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tighter leading-none">SAIT NAVIGATOR</h1>
              <p className="text-[10px] text-hud-cyan font-mono tracking-widest uppercase opacity-80">
                {isRefreshing ? 'Syncing...' : 'Campus Intel Active'}
              </p>
            </div>
          </div>
        </motion.div>
        
        <div className="glass px-4 py-2 rounded-lg flex items-center gap-6 pointer-events-auto">
          <div className="flex flex-col items-center">
            <span className="text-[9px] uppercase text-slate-400 font-mono">Floor</span>
            <select 
              value={currentFloor}
              onChange={(e) => setCurrentFloor(Number(e.target.value))}
              className="bg-transparent text-xs text-hud-cyan appearance-none outline-none font-bold cursor-pointer hover:white transition-colors"
            >
              {[0, 1, 2, 3].map(f => (
                <option key={f} value={f} className="bg-[#05070a]">LVL {f}</option>
              ))}
            </select>
          </div>
          <div className="w-px h-6 bg-slate-700"></div>
          <div className="flex flex-col items-center">
            <span className="text-[9px] uppercase text-slate-400 font-mono">Status</span>
            <span className="text-[10px] text-hud-cyan font-bold leading-none mt-0.5">
              {selectedRoom && selectedRoom.floor !== currentFloor ? 'WRONG FLOOR' : 'INDOOR'}
            </span>
          </div>
          <div className="w-px h-6 bg-slate-700"></div>
          <div className="flex flex-col items-center">
            <span className="text-[9px] uppercase text-slate-400 font-mono">IP Local</span>
            <span className="text-xs text-green-400">CONN</span>
          </div>
        </div>
      </div>

      {/* Main Map Background */}
      <div className="absolute inset-0 z-0 map-grid">
        <MapContainer 
          currentPosition={currentPos}
          rooms={rooms}
          selectedRoom={selectedRoom}
          currentFloor={currentFloor}
          onRoomSelect={(room) => {
            setSelectedRoom(room);
            if (room) setCurrentFloor(room.floor);
          }}
        />
      </div>

      {/* Left Panel: Navigation Info */}
      {selectedRoom && (
        <motion.div 
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="absolute top-28 left-6 w-72 flex flex-col gap-4 z-10"
        >
          <div className="glass p-5 rounded-2xl border-l-4 border-l-hud-cyan shadow-2xl">
            <div className="flex justify-between items-start mb-1">
              <h2 className="text-[11px] uppercase font-mono text-hud-cyan">Target Destination</h2>
              <button onClick={() => setSelectedRoom(null)} className="text-white/40 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-2xl font-bold leading-tight mb-1">{selectedRoom.name}</p>
            <p className="text-xs text-slate-400">Engineering Block, LVL {selectedRoom.floor}</p>
            
            <div className="grid grid-cols-2 gap-2 mt-4">
              <div className="bg-white/5 p-3 rounded-xl">
                <span className="block text-[10px] uppercase text-slate-500 font-mono">Floor Change</span>
                <span className={cn(
                  "text-lg font-mono font-bold",
                  selectedRoom.floor === currentFloor ? "text-green-400" : "text-hud-rose animate-pulse"
                )}>
                  {selectedRoom.floor === currentFloor ? 'ON LVL' : `TO LVL ${selectedRoom.floor}`}
                </span>
              </div>
              <div className="bg-white/5 p-3 rounded-xl">
                <span className="block text-[10px] uppercase text-slate-500 font-mono">ETA</span>
                <span className="text-lg font-mono font-bold text-white">4m</span>
              </div>
            </div>
          </div>

          <div className="glass p-4 rounded-2xl">
            <h3 className="text-[10px] uppercase font-mono text-slate-500 mb-2 font-bold tracking-widest">Waypoints</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <span className="text-xs text-white/60">Main Entrance (Check)</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-hud-cyan animate-pulse"></div>
                <span className="text-xs font-semibold text-hud-cyan">South Corridor (Next)</span>
              </div>
              <div className="flex items-center gap-3 opacity-30">
                <div className="w-2 h-2 rounded-full bg-slate-500"></div>
                <span className="text-xs text-slate-400">Elevator Alpha</span>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Coordinate & System Footer */}
      <div className="absolute bottom-6 left-6 z-10 text-[10px] font-mono text-slate-500 flex gap-6 pointer-events-none">
        <span className="flex gap-2"><span className="text-hud-cyan/40">LAT:</span> {currentPos.lat.toFixed(6)}</span>
        <span className="flex gap-2"><span className="text-hud-cyan/40">LNG:</span> {currentPos.lng.toFixed(6)}</span>
        <span className="text-hud-cyan/20 uppercase tracking-widest hidden sm:inline">256-Bit Encrypted</span>
      </div>

      <div className="absolute bottom-6 right-6 z-10 text-[10px] font-mono text-slate-500 uppercase tracking-widest pointer-events-none hidden sm:block">
        Altitude: 920M MSL
      </div>

      {/* Widgets */}
      <ChatWidget />
      <VoiceButton onResult={handleVoiceResult} />
    </div>
  );
}

function X({ className }: { className?: string }) {
  return (
    <svg 
      className={className} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2.5" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <line x1="18" y1="6" x2="6" y2="18"></line>
      <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
  );
}

