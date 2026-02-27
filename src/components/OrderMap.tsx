import React, { useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import { motion, AnimatePresence } from 'motion/react';
import { MapPin, X, TrendingUp, Navigation } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

// Order hotspots around Bangalore
const ORDER_HOTSPOTS = [
    { id: 1, name: 'Koramangala', lat: 12.9352, lng: 77.6245, orders: 142, topPlatform: 'Swiggy', avgEarning: 85, color: '#2d6b5a' },
    { id: 2, name: 'Indiranagar', lat: 12.9716, lng: 77.6412, orders: 118, topPlatform: 'Zomato', avgEarning: 92, color: '#3a8b6e' },
    { id: 3, name: 'HSR Layout', lat: 12.9116, lng: 77.6474, orders: 95, topPlatform: 'Swiggy', avgEarning: 78, color: '#5DA392' },
    { id: 4, name: 'Whitefield', lat: 12.9698, lng: 77.7500, orders: 87, topPlatform: 'Uber', avgEarning: 120, color: '#2d6b5a' },
    { id: 5, name: 'Electronic City', lat: 12.8399, lng: 77.6770, orders: 76, topPlatform: 'Ola', avgEarning: 105, color: '#3a8b6e' },
    { id: 6, name: 'Marathahalli', lat: 12.9591, lng: 77.6974, orders: 68, topPlatform: 'Rapido', avgEarning: 45, color: '#5DA392' },
    { id: 7, name: 'JP Nagar', lat: 12.9063, lng: 77.5857, orders: 63, topPlatform: 'Blinkit', avgEarning: 55, color: '#7ec4a5' },
    { id: 8, name: 'BTM Layout', lat: 12.9166, lng: 77.6101, orders: 110, topPlatform: 'Swiggy', avgEarning: 72, color: '#2d6b5a' },
    { id: 9, name: 'MG Road', lat: 12.9756, lng: 77.6066, orders: 134, topPlatform: 'Ola', avgEarning: 115, color: '#3a8b6e' },
    { id: 10, name: 'Bannerghatta Road', lat: 12.8871, lng: 77.5973, orders: 55, topPlatform: 'Uber', avgEarning: 130, color: '#7ec4a5' },
    { id: 11, name: 'Yelahanka', lat: 13.1005, lng: 77.5963, orders: 42, topPlatform: 'Rapido', avgEarning: 38, color: '#a3d9be' },
    { id: 12, name: 'Jayanagar', lat: 12.9299, lng: 77.5838, orders: 88, topPlatform: 'Zomato', avgEarning: 82, color: '#3a8b6e' },
    { id: 13, name: 'Malleshwaram', lat: 13.0035, lng: 77.5647, orders: 61, topPlatform: 'Blinkit', avgEarning: 48, color: '#5DA392' },
    { id: 14, name: 'Hebbal', lat: 13.0358, lng: 77.5970, orders: 73, topPlatform: 'Swiggy', avgEarning: 68, color: '#7ec4a5' },
    { id: 15, name: 'Sarjapur Road', lat: 12.9100, lng: 77.6850, orders: 98, topPlatform: 'Uber', avgEarning: 110, color: '#2d6b5a' },
];

// Separate component so we can use useMap hook
const MapUpdater = ({ center }: { center: [number, number] }) => {
    const map = useMap();
    React.useEffect(() => {
        map.flyTo(center, 13, { duration: 1 });
    }, [center, map]);
    return null;
};

interface OrderMapProps {
    transactions: any[];
}

export const OrderMap: React.FC<OrderMapProps> = ({ transactions }) => {
    const [selectedSpot, setSelectedSpot] = useState<typeof ORDER_HOTSPOTS[0] | null>(null);
    const [mapCenter] = useState<[number, number]>([12.9716, 77.5946]); // Bangalore center

    // Map transaction platforms to the mock data for realistic feel
    const platformCounts = transactions.reduce((acc: Record<string, number>, tx: any) => {
        acc[tx.platform] = (acc[tx.platform] || 0) + 1;
        return acc;
    }, {});

    const sortedHotspots = [...ORDER_HOTSPOTS].sort((a, b) => b.orders - a.orders);
    const maxOrders = Math.max(...ORDER_HOTSPOTS.map(h => h.orders));

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4 pb-12"
        >
            <div className="flex items-center space-x-2">
                <MapPin className="text-[var(--color-primary)]" />
                <h2 className="text-xl font-bold text-slate-900">Order Hotspots</h2>
            </div>

            {/* Map Container */}
            <div className="glass-card overflow-hidden rounded-2xl" style={{ height: '320px' }}>
                <MapContainer
                    center={mapCenter}
                    zoom={12}
                    style={{ height: '100%', width: '100%', borderRadius: '16px' }}
                    zoomControl={false}
                    attributionControl={false}
                >
                    <TileLayer
                        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                    />
                    {ORDER_HOTSPOTS.map(spot => (
                        <CircleMarker
                            key={spot.id}
                            center={[spot.lat, spot.lng]}
                            radius={8 + (spot.orders / maxOrders) * 20}
                            fillColor={spot.color}
                            fillOpacity={0.6}
                            stroke={true}
                            color="#fff"
                            weight={1.5}
                            eventHandlers={{
                                click: () => setSelectedSpot(spot),
                            }}
                        >
                            <Popup>
                                <div style={{ fontFamily: 'Domine, serif', minWidth: '140px' }}>
                                    <p style={{ fontWeight: 900, fontSize: '14px', marginBottom: '4px' }}>{spot.name}</p>
                                    <p style={{ fontSize: '11px', color: '#64748b' }}>{spot.orders} orders · ₹{spot.avgEarning} avg</p>
                                    <p style={{ fontSize: '11px', color: '#3a8b6e', fontWeight: 700, marginTop: '2px' }}>Top: {spot.topPlatform}</p>
                                </div>
                            </Popup>
                        </CircleMarker>
                    ))}
                </MapContainer>
            </div>

            {/* Legend */}
            <div className="glass-card p-4">
                <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Hotspot Density</p>
                    <p className="text-[10px] text-slate-400">Bangalore</p>
                </div>
                <div className="flex items-center space-x-1">
                    <span className="text-[10px] text-slate-400">Low</span>
                    <div className="flex-1 h-2 rounded-full bg-gradient-to-r from-emerald-100 via-emerald-400 to-emerald-800"></div>
                    <span className="text-[10px] text-slate-400">High</span>
                </div>
            </div>

            {/* Top Hotspots List */}
            <div className="glass-card overflow-hidden">
                <div className="p-4 border-b border-slate-50">
                    <h3 className="text-sm font-bold flex items-center">
                        <Navigation size={14} className="mr-2 text-emerald-500" />
                        Top Earning Zones
                    </h3>
                </div>
                <div className="divide-y divide-slate-50">
                    {sortedHotspots.slice(0, 5).map((spot, i) => (
                        <div
                            key={spot.id}
                            className="p-3 flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer"
                            onClick={() => setSelectedSpot(spot)}
                        >
                            <div className="flex items-center">
                                <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-black mr-3" style={{ background: spot.color }}>
                                    {i + 1}
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-slate-800">{spot.name}</p>
                                    <p className="text-[10px] text-slate-400">{spot.orders} orders · {spot.topPlatform}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-sm font-bold text-[var(--color-primary)]">₹{spot.avgEarning}</p>
                                <p className="text-[10px] text-slate-400">avg/order</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Platform Distribution */}
            <div className="glass-card p-4">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Your Orders by Platform</p>
                <div className="space-y-2">
                    {Object.entries(platformCounts).sort(([, a], [, b]) => (b as number) - (a as number)).map(([platform, count]) => (
                        <div key={platform} className="flex items-center justify-between">
                            <div className="flex items-center">
                                <div className="w-2 h-2 rounded-full bg-emerald-500 mr-2"></div>
                                <span className="text-sm font-medium text-slate-700">{platform}</span>
                            </div>
                            <div className="flex items-center">
                                <div className="w-24 h-1.5 bg-slate-100 rounded-full mr-2 overflow-hidden">
                                    <div
                                        className="h-full bg-[var(--color-primary)] rounded-full"
                                        style={{ width: `${((count as number) / Math.max(...Object.values(platformCounts).map(v => v as number))) * 100}%` }}
                                    ></div>
                                </div>
                                <span className="text-xs font-bold text-slate-500">{count as number}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Spot Detail Modal */}
            <AnimatePresence>
                {selectedSpot && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedSpot(null)}
                            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[80]"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 40 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 40 }}
                            transition={{ type: 'spring', damping: 22, stiffness: 180 }}
                            className="fixed inset-x-4 top-[20%] bottom-auto max-w-md mx-auto bg-white rounded-3xl shadow-2xl z-[90] p-6"
                        >
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-lg font-black text-slate-900 flex items-center">
                                    <MapPin size={18} className="mr-2 text-emerald-500" />
                                    {selectedSpot.name}
                                </h2>
                                <button onClick={() => setSelectedSpot(null)} className="p-1.5 hover:bg-slate-100 rounded-full transition-colors">
                                    <X size={20} className="text-slate-400" />
                                </button>
                            </div>

                            <div className="grid grid-cols-2 gap-3 mb-4">
                                <div className="p-3 bg-emerald-50 rounded-xl">
                                    <p className="text-[10px] font-bold text-emerald-400 uppercase">Total Orders</p>
                                    <p className="text-2xl font-black text-emerald-900">{selectedSpot.orders}</p>
                                </div>
                                <div className="p-3 bg-emerald-50 rounded-xl">
                                    <p className="text-[10px] font-bold text-emerald-400 uppercase">Avg Earning</p>
                                    <p className="text-2xl font-black text-emerald-900">₹{selectedSpot.avgEarning}</p>
                                </div>
                            </div>

                            <div className="p-3 bg-slate-50 rounded-xl mb-4">
                                <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Top Platform</p>
                                <p className="text-lg font-bold text-slate-800">{selectedSpot.topPlatform}</p>
                            </div>

                            <div className="p-3 bg-emerald-50/50 border border-emerald-100 rounded-xl">
                                <div className="flex items-center space-x-2">
                                    <TrendingUp size={16} className="text-emerald-600" />
                                    <p className="text-xs font-bold text-emerald-700">
                                        {selectedSpot.orders > 100
                                            ? '🔥 High demand zone — peak hours 11AM-2PM & 6PM-10PM'
                                            : selectedSpot.orders > 70
                                                ? '📈 Growing zone — good earning potential'
                                                : '📊 Moderate zone — best during weekends'}
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </motion.div>
    );
};
