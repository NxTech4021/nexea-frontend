import QrScanner from 'qr-scanner';
import { useRef, useEffect } from 'react';

const QrReader = () => {
  // QR States
  const scanner = useRef(null);
  const videoEl = useRef(null);
  const qrBoxEl = useRef(null);

  useEffect(() => {
    if (videoEl?.current && !scanner.current) {
      scanner.current = new QrScanner(
        videoEl?.current,
        (res) => {
          console.log('WADWAD', res);
        },
        {
          onDecodeError: (res) => console.log('ERROR'),
          preferredCamera: 'environment',
          highlightScanRegion: true,
          highlightCodeOutline: true,
          overlay: qrBoxEl?.current || undefined,
        }
      );

      scanner?.current.start();
    }
    return () => {
      scanner?.current.stop();
    };
  }, []);

  return (
    <div
      className="qr-reader"
      style={{
        width: '430px',
        height: '100vh',
        margin: '0 auto',
        position: 'relative',
      }}
    >
      {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
      <video
        ref={videoEl}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
        }}
      />
      <div ref={qrBoxEl} className="qr-box">
        <img
          src="/test.svg"
          alt="Qr Frame"
          width={256}
          height={256}
          className="qr-frame"
          style={{
            position: 'absolute',
            fill: 'none',
            left: '50%',
            top: '50%',
            transform: 'translateX(-50%) translateY(-50%)',
          }}
        />
      </div>
    </div>
  );
};

export default QrReader;
