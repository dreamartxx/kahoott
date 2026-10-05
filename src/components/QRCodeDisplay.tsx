import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';

interface QRCodeDisplayProps {
  value: string;
  size?: number;
  className?: string;
}

export const QRCodeDisplay: React.FC<QRCodeDisplayProps> = ({ value, size = 180, className = '' }) => {
  const [qrSrc, setQrSrc] = useState<string>('');

  useEffect(() => {
    let isMounted = true;
    QRCode.toDataURL(value, {
      width: size * 2, // retina 2x
      margin: 1.5,
      color: {
        dark: '#0f172a', // slate-900
        light: '#ffffff',
      },
      errorCorrectionLevel: 'M',
    })
      .then((url) => {
        if (isMounted) setQrSrc(url);
      })
      .catch((err) => {
        console.error('QR Code generation error', err);
      });

    return () => {
      isMounted = false;
    };
  }, [value, size]);

  if (!qrSrc) {
    return (
      <div
        style={{ width: size, height: size }}
        className={`bg-slate-800 animate-pulse rounded-2xl flex items-center justify-center ${className}`}
      >
        <span className="text-xs text-slate-400">QR Kod Üretiliyor...</span>
      </div>
    );
  }

  return (
    <div className={`relative inline-block bg-white p-3 rounded-2xl shadow-xl shadow-purple-950/20 ${className}`}>
      <img
        src={qrSrc}
        alt="Odaya Katılım QR Kodu"
        width={size}
        height={size}
        className="rounded-xl block"
      />
      <div className="absolute inset-0 border-2 border-purple-500/20 rounded-2xl pointer-events-none" />
    </div>
  );
};
