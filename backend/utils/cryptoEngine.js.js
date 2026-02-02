const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// --- 1. RSA Key Management (Key Exchange Mechanism) ---
// Keys are generated once and saved to disk to simulate a persistent secure keystore.
const PUBLIC_KEY_PATH = path.join(__dirname, '../keys/public.pem');
const PRIVATE_KEY_PATH = path.join(__dirname, '../keys/private.pem');

if (!fs.existsSync('../keys')) fs.mkdirSync(path.join(__dirname, '../keys'));

let publicKey, privateKey;

if (!fs.existsSync(PRIVATE_KEY_PATH)) {
    const keys = crypto.generateKeyPairSync('rsa', {
        modulusLength: 2048,
        publicKeyEncoding: { type: 'spki', format: 'pem' },
        privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
    });
    fs.writeFileSync(PUBLIC_KEY_PATH, keys.publicKey);
    fs.writeFileSync(PRIVATE_KEY_PATH, keys.privateKey);
    publicKey = keys.publicKey;
    privateKey = keys.privateKey;
    console.log("⚠️ NEW RSA KEYS GENERATED");
} else {
    publicKey = fs.readFileSync(PUBLIC_KEY_PATH, 'utf8');
    privateKey = fs.readFileSync(PRIVATE_KEY_PATH, 'utf8');
}

// --- 2. AES Encryption (Symmetric) for Files ---
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

// --- 3. RSA Key Wrapping (Hybrid Encryption) ---
// We encrypt the AES key with the Server's Public Key.
// Only the Server (holding Private Key) can unwrap it.
exports.wrapKey = (aesKeyBuffer) => {
    return crypto.publicEncrypt(publicKey, aesKeyBuffer).toString('base64');
};

exports.unwrapKey = (wrappedKeyBase64) => {
    const buffer = Buffer.from(wrappedKeyBase64, 'base64');
    return crypto.privateDecrypt(privateKey, buffer);
};

// --- 4. Digital Signatures (Authenticity) ---
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