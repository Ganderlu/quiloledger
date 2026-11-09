"use client";

import Image from "next/image";
import { useState } from "react";

export function CoinLogo({
  src,
  name,
  symbol,
  size = 40,
}: {
  src: string;
  name: string;
  symbol: string;
  size?: number;
}) {
  const [imageFailed, setImageFailed] = useState(false);
  const initials = symbol.slice(0, 2).toUpperCase();

  return (
    <span
      className="grid shrink-0 place-items-center overflow-hidden rounded-full border border-black/[0.04] bg-white shadow-sm"
      style={{ width: size, height: size }}
    >
      {src && !imageFailed ? (
        <Image
          src={src}
          alt={`${name} logo`}
          width={size}
          height={size}
          unoptimized
          onError={() => setImageFailed(true)}
          className="h-full w-full object-cover"
        />
      ) : (
        <span
          aria-label={`${name} logo unavailable`}
          className="text-[10px] font-bold text-[#65717a]"
        >
          {initials}
        </span>
      )}
    </span>
  );
}
