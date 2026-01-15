import Image from "next/image";
import StarRating from "./StarRating";

interface HeaderProps {
    name?: string;
    image?: string;
    banner?: string;
    rating?: string;
    address?: string;
    deliveryTime?: string;
    restaurantId?: string;
    ratingSum?: number;
    ratingCount?: number;
}

export default function RestaurantHeader({ name = "OlinDelivery", image, banner, rating = "4.9", address, deliveryTime = "30-45 min", restaurantId, ratingSum, ratingCount }: HeaderProps) {
    return (
        <div className="relative mb-8">
            {/* Banner Section */}
            <div className="h-48 md:h-64 lg:h-72 w-full relative">
                <div className="absolute inset-0 bg-center" style={{
                    backgroundImage: `url('${banner || 'https://i.imgur.com/7Z4y7Qk.png'}')`,
                    backgroundSize: '100% 100%'
                }} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
            </div>

            {/* Content Section - Overlapping Banner */}
            <div className="container relative -mt-20 md:-mt-24 pb-4 px-4 flex flex-col items-center md:items-start md:flex-row gap-6 z-10">
                {/* Logo */}
                <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white shadow-xl overflow-hidden bg-white flex-shrink-0">
                    <Image
                        src={image || "https://i.imgur.com/iWSJGep.png"}
                        alt={name || "Logo"}
                        width={160}
                        height={160}
                        className="w-full h-full object-cover"
                    />
                </div>

                {/* Text Info */}
                <div className="text-center md:text-left text-gray-900 flex-1 md:mt-2">
                    <h1 className="text-3xl md:text-5xl font-extrabold mb-2 tracking-tight leading-tight">{name}</h1>
                    <div className="flex flex-col md:flex-row items-center justify-center md:justify-start gap-1 md:gap-3 text-sm md:text-base font-medium text-gray-600">
                        <div className="flex items-center gap-3">
                            <StarRating restaurantId={restaurantId || ''} initialSum={ratingSum || 0} initialCount={ratingCount || 0} />
                            <span></span>
                            <span>•</span>
                            <span>•</span>
                            <span>{deliveryTime}</span>
                        </div>
                        {address && (
                            <>
                                <span className="hidden md:inline">•</span>
                                <span className="opacity-80 text-xs md:text-sm bg-black/20 px-2 py-1 rounded-full backdrop-blur-sm">📍 {address}</span>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
