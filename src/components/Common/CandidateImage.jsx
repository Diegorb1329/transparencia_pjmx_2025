'use client';
import { useState } from "react";
import Image from "next/image";

const CandidateImage = ({ folio, name, className = "" }) => {
  const [error, setError] = useState(false);
  const baseUrl = "https://candidaturaspoderjudicial.ine.mx/cycc/img/fotocandidato/";
  const imageUrl = error ? "/user_placeholder.svg" : `${baseUrl}${folio}.jpg`;

  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <div className="relative w-24 h-24 rounded-full overflow-hidden bg-gray-100 border-4 border-blue-100">
        <Image
          src={imageUrl}
          alt={`Foto de ${name}`}
          fill
          style={{ objectFit: 'cover' }}
          onError={() => setError(true)}
          priority={false}
          sizes="96px"
        />
      </div>
    </div>
  );
};

export default CandidateImage;
