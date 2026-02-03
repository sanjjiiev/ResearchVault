const crypto = require('crypto');
// FIX: Import keys from the central config instead of generating them here.
const { publicKey, privateKey } = require('../config/keys');

// --- 1. AES Encryption (Symmetric) for Files ---
exports.encryptFileBuffer = (buffer) => {
    // Generate fresh AES key and IV for EVERY file (NIST Requirement)
    const aesKey = crypto.randomBytes(32); // 256 bits
    const iv = crypto.randomBytes(16);     // 128 bits

    const cipher = crypto.createCipheriv('aes-256-cbc', aesKey, iv);
    const encrypted = Buffer.concat([cipher.update(buffer), cipher.final()]);

    return {
        encryptedData: encrypted, // The encrypted PDF
        aesKey: aesKey,           // The key needed to decrypt it
        iv: iv                    // The IV needed to decrypt it
    };
};

exports.decryptFileBuffer = (encryptedBuffer, aesKey, iv) => {
    const decipher = crypto.createDecipheriv('aes-256-cbc', aesKey, iv);
    return Buffer.concat([decipher.update(encryptedBuffer), decipher.final()]);
};

// --- 2. RSA Key Wrapping (Hybrid Encryption) ---
// We encrypt the AES key with the Server's Public Key.
exports.wrapKey = (aesKeyBuffer) => {
    return crypto.publicEncrypt(publicKey, aesKeyBuffer).toString('base64');
};

exports.unwrapKey = (wrappedKeyBase64) => {
    const buffer = Buffer.from(wrappedKeyBase64, 'base64');
    return crypto.privateDecrypt(privateKey, buffer);
};

// --- 3. Digital Signatures (Authenticity) ---
exports.createSignature = (data) => {
    const sign = crypto.createSign('SHA256');
    sign.update(data);
    sign.end();
    return sign.sign(privateKey, 'base64');
};

exports.verifySignature = (data, signature) => {
    const verify = crypto.createVerify('SHA256');
    verify.update(data);
    verify.end();
    return verify.verify(publicKey, signature, 'base64');
};