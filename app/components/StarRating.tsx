"use client";

import { useState } from 'react';

export default function StarRating({ restaurantId, initialSum, initialCount }: { restaurantId: string, initialSum: number, initialCount: number }) {
    const [stats, setStats] = useState({ sum: initialSum || 0, count: initialCount || 0 });
    const [userRating, setUserRating] = useState(0);
    const [hover, setHover] = useState(0);
    const [loading, setLoading] = useState(false);

    const average = stats.count > 0 ? (stats.sum / stats.count).toFixed(1) : 'New';

    const handleRate = async (star: number, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation(); // Prevent card navigation

        if (loading) return;
        setLoading(true);

        try {
            const res = await fetch('/api/rate-restaurant', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ restaurantId, rating: star })
            });
            const data = await res.json();

            if (res.ok) {
                // Update local stats optimistically or from response
                // Since this is cumulative, best to use response if possible, but let's just add local for immediate feedback
                // Actually the API returns the new average.
                setStats(prev => ({ sum: prev.sum + star, count: prev.count + 1 }));
                setUserRating(star);
                alert('Avaliação enviada!');
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-full" onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}>
            <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                    <span
                        key={star}
                        className={`cursor-pointer text-sm transition-colors ${star <= (hover || userRating || Math.round(stats.count > 0 ? stats.sum / stats.count : 0)) ? 'text-yellow-500' : 'text-gray-300'}`}
                        onMouseEnter={() => setHover(star)}
                        onMouseLeave={() => setHover(0)}
                        onClick={(e) => handleRate(star, e)}
                    >
                        ★
                    </span>
                ))}
            </div>
            <span className="text-[10px] font-bold text-yellow-700 ml-1">
                {average}
            </span>
            <span className="text-[8px] text-gray-400">
                ({stats.count})
            </span>
        </div>
    );
}
