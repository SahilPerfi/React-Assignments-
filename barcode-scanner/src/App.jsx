import React, { useState, useEffect } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import BarcodeScannerComponent from 'react-qr-barcode-scanner';

const QRCodeScannerApp = () => {
  const [scannedCodes, setScannedCodes] = useState([]);
  const [selectedCodes, setSelectedCodes] = useState([]);
  const [error, setError] = useState('');

  // Load scanned codes from localStorage
  useEffect(() => {
    const storedCodes = JSON.parse(localStorage.getItem('scannedCodes')) || [];
    setScannedCodes(storedCodes);
  }, []);

  // Store scanned codes in localStorage
  useEffect(() => {
    localStorage.setItem('scannedCodes', JSON.stringify(scannedCodes));
  }, [scannedCodes]);

  const handleCodeScan = (err, result) => {
    if (err) {
      return;
    }

    if (result) {
      const code = result.text;
      if (!scannedCodes.includes(code)) {
        setScannedCodes((prevCodes) => [...prevCodes, code]);
        setError('');
      }
    }
  };

  const handleSelectCode = (code) => {
    setSelectedCodes((prevSelected) =>
      prevSelected.includes(code)
        ? prevSelected.filter((selectedCode) => selectedCode !== code)
        : [...prevSelected, code]
    );
  };

  const handleMultipleFileUpload = async (event) => {
    const files = event.target.files;
    if (!files.length) return;

    const html5QrCode = new Html5Qrcode("reader");
    let newScannedCodes = [...scannedCodes];

    for (let file of files) {
      try {
        const result = await html5QrCode.scanFile(file, false);
        if (!newScannedCodes.includes(result)) {
          newScannedCodes.push(result);
        }
      } catch (error) {
        setError('Failed to scan one or more files for QR codes.');
      }
    }

    setScannedCodes(newScannedCodes);
    setError(''); 
    html5QrCode.clear();
  };

  const handleSubmit = () => {
    if (selectedCodes.length === 0) {
      setError('Please select at least one QR code.');
    } else {
      selectedCodes.forEach((code) => {
        if (isValidUrl(code)) {
          window.open(code, '_blank');
        } else {
          console.error(`Invalid URL: ${code}`);
        }
      });
    }
  };

  const isValidUrl = (string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  return (
    <div>
      <h2>QR Code & Barcode Scanner App</h2>

      <BarcodeScannerComponent
        width={500}
        height={500}
        onUpdate={handleCodeScan}
      />

      <div>
        <h3>Upload Image Files:</h3>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleMultipleFileUpload}
        />
        <div id="reader" style={{ width: "100%", display: 'none' }}></div>
      </div>

      {error && <div className="error">{error}</div>}

      <h3>Scanned QR Codes:</h3>
      <ul>
        {scannedCodes.map((code, index) => (
          <li key={index}>
            <label>
              <input
                type="checkbox"
                checked={selectedCodes.includes(code)}
                onChange={() => handleSelectCode(code)}
              />
              {code}
            </label>
          </li>
        ))}
      </ul>

      {/* Preview selected codes */}
      {selectedCodes.length > 0 && (
        <div>
          <h4>Selected Codes:</h4>
          <p>{selectedCodes.join(', ')}</p>
        </div>
      )}

      {/* Submit button */}
      <button onClick={handleSubmit}>Open</button>
    </div>
  );
};

export default QRCodeScannerApp;
