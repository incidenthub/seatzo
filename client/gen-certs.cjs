const forge = require('node-forge');
const fs = require('fs');

const keys = forge.pki.rsa.generateKeyPair(2048);
const cert = forge.pki.createCertificate();

cert.publicKey = keys.publicKey;
cert.serialNumber = '01';
cert.validity.notBefore = new Date();
cert.validity.notAfter = new Date();
cert.validity.notAfter.setFullYear(cert.validity.notBefore.getFullYear() + 1);

const attrs = [{ name: 'commonName', value: 'localhost' }];
cert.setSubject(attrs);
cert.setIssuer(attrs);
cert.setExtensions([
  { name: 'basicConstraints', cA: true },
  { name: 'keyUsage', keyCertSign: true, digitalSignature: true },
  { name: 'subjectAltName', altNames: [{ type: 2, value: 'localhost' }] }
]);

cert.sign(keys.privateKey, forge.md.sha256.create());

const privateKeyPem = forge.pki.privateKeyToPem(keys.privateKey);
const certPem = forge.pki.certificateToPem(cert);

fs.writeFileSync('localhost-key.pem', privateKeyPem);
fs.writeFileSync('localhost.pem', certPem);

console.log('✅ Certificates generated successfully!');
console.log('  - localhost-key.pem');
console.log('  - localhost.pem');