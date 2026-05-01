import QRCode from 'qrcode';

export const generateQRCode = async (data) => {
  try {
    const stringData = typeof data === 'string' ? data : JSON.stringify(data);
    const qrCodeDataUri = await QRCode.toDataURL(stringData, {
      errorCorrectionLevel: 'M',
      margin: 1,
      width: 400,
      color: {
        dark: '#000000',
        light: '#ffffff',
      },
    });
    return qrCodeDataUri;
  } catch (err) {
    console.error('QR Code generation failed:', err);
    return null;
  }
};
