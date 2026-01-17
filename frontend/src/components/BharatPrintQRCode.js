import React, { useEffect, useRef } from 'react';
import QRCodeStyling from 'qr-code-styling';

const BharatPrintQRCode = ({ value, size = 300 }) => {
  const ref = useRef(null);
  const qrCode = useRef(null);

  useEffect(() => {
    if (!qrCode.current) {
      qrCode.current = new QRCodeStyling({
        width: size,
        height: size,
        data: value,
        margin: 10,
        qrOptions: {
          typeNumber: 0,
          mode: 'Byte',
          errorCorrectionLevel: 'H'
        },
        imageOptions: {
          hideBackgroundDots: true,
          imageSize: 0.3,
          margin: 5
        },
        dotsOptions: {
          color: '#134252',
          type: 'rounded'
        },
        backgroundOptions: {
          color: '#ffffff',
        },
        image: '/logo.png',
        cornersSquareOptions: {
          color: '#34BEE8',
          type: 'extra-rounded'
        },
        cornersDotOptions: {
          color: '#34BEE8',
          type: 'dot'
        }
      });
    }

    if (ref.current) {
      ref.current.innerHTML = '';
      qrCode.current.append(ref.current);
    }
  }, [value, size]);

  return (
    <div className="flex flex-col items-center">
      <div ref={ref} className="bg-white p-4 rounded-lg shadow-lg" />
      <p className="mt-4 text-2xl font-bold" style={{ 
        background: 'linear-gradient(135deg, #34BEE8 0%, #00D4FF 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text'
      }}>
        BharatPrint
      </p>
    </div>
  );
};

export default BharatPrintQRCode;
