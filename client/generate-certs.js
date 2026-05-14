const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function generateCerts() {
  const certDir = __dirname;
  
  try {
    execSync(`openssl req -x509 -newkey rsa:2048 -keyout "${path.join(certDir, 'localhost-key.pem')}" -out "${path.join(certDir, 'localhost.pem')}" -days 365 -nodes -subj "/CN=localhost"`, { stdio: 'pipe' });
    console.log('✅ Certificates generated successfully!');
    console.log('  - localhost-key.pem');
    console.log('  - localhost.pem');
  } catch (e) {
    console.log('OpenSSL not available, trying alternative...');
    
    const crypto = require('crypto');
    const { pki } = require('node-forge');
    
    const keys = pki.rsa.generateKeyPair(2048);
    const cert = pki.createCertificate();
    cert.publicKey = keys.publicKey;
    cert.serialNumber = '01';
    cert.validity.notBefore = new Date();
    cert.validity.notAfter = new Date();
    cert.validity.notAfter.setFullYear(cert.validity.notBefore.getFullYear() + 1);
    
    const attrs = [{ name: 'commonName', value: 'localhost' }];
    cert.setSubject(attrs);
    cert.setIssuer(attrs);
    cert.setExtensions([{ name: 'basicConstraints', cA: true }]);
    cert.sign(keys.privateKey, 'sha256');
    
    fs.writeFileSync('localhost-key.pem', pki.privateKeyToPem(keys.privateKey));
    fs.writeFileSync('localhost.pem', pki.certificateToPem(cert));
    
    console.log('✅ Certificates generated with node-forge!');
  }
}

generateCerts();