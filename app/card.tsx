import Image from "next/image";
import { useState } from "react";

interface CardProps {
    imgURL: string;
    priceNormal: number | null | undefined;
    priceHolofoil: number | null | undefined;
    priceReverseHolofoil: number | null | undefined;
}

export default function Card({ imgURL, priceNormal, priceHolofoil, priceReverseHolofoil }: CardProps) {
    const [imageError, setImageError] = useState(false);

    const handleImageError = () => {
        setImageError(true);
    };

    return (
        <div className="px-2 py-5">
            <Image
                src={imageError ? '/pokemon/card404.png' : imgURL}
                alt="Pokemon Image"
                width={0}
                height={0}
                sizes="100vw"
                priority
                style={{ width: '300px', height: 'auto' }}
                onError={handleImageError}
            />
        
            {priceNormal ? <p>Normal: ${priceNormal.toFixed(2)} (USD)</p> : null}
            {priceHolofoil ? <p>Holofoil: ${priceHolofoil.toFixed(2)} (USD)</p> : null}
            {priceReverseHolofoil ? <p>Reverse Holofoil: ${priceReverseHolofoil.toFixed(2)} (USD)</p> : null}
        </div>
    );
}