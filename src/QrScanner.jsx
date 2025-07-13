import React, { useEffect, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";

function QrScanner({ onScan, activo }) {
  const html5QrCodeRef = useRef(null);
  const lastErrorTimeRef = useRef(0);
  const scannerId = "reader";

  useEffect(() => {
    if (!html5QrCodeRef.current) {
      html5QrCodeRef.current = new Html5Qrcode(scannerId);
    }

    const html5QrCode = html5QrCodeRef.current;

    const startScanner = async () => {
      try {
        // Espera a que el div esté montado
        const container = document.getElementById(scannerId);
        if (!container || container.offsetWidth === 0) {
          console.warn("📦 Contenedor no visible o sin ancho aún.");
          return;
        }

        const devices = await Html5Qrcode.getCameras();
        if (!devices || devices.length === 0) {
          console.error("❌ No se encontraron cámaras.");
          return;
        }

        const backCamera =
          devices.find((d) => /back|rear|environment/i.test(d.label)) ||
          devices[0];

        if (html5QrCode._isScanning) {
          console.log("⏹️ Ya está escaneando, deteniendo antes de reiniciar...");
          await html5QrCode.stop(); // No llamamos a clear()
        }

        await html5QrCode.start(
        { facingMode: "environment" },
          { fps: 10, qrbox: 250 },
          async (decodedText) => {
            onScan(decodedText);
            console.log("✅ Código QR escaneado:", decodedText);
            try {
              await html5QrCode.stop();
            } catch (e) {
              console.error("Error al detener escáner después de escanear:", e);
            }
          },
          (errorMessage) => {
            const ahora = Date.now();
            if (ahora - lastErrorTimeRef.current > 1000) {
              console.warn("Escaneo fallido:", errorMessage);
              lastErrorTimeRef.current = ahora;
            }
          }
        );
      } catch (err) {
        console.error("❌ Error inicializando cámara:", err.message || err);
       
      }
    };

    const stopScanner = async () => {
      const html5QrCode = html5QrCodeRef.current;
      if (html5QrCode && html5QrCode._isScanning) {
        try {
          await html5QrCode.stop();
        } catch (e) {
          console.error("Error al detener escáner:", e);
        }
      }
    };

    if (activo) {
      startScanner();
    } else {
      stopScanner();
    }

    return () => {
      stopScanner();
    };
  }, [activo, onScan]);

  return <div id="reader" className="qrscanner"  />;
}

export default QrScanner;
