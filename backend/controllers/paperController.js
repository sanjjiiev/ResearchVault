const cryptoEngine = require('../utils/cryptoEngine');
const supabase = require('../config/supabase');

exports.uploadPaper = async (req, res) => {
    try {
        const fileBuffer = req.file.buffer;
        const { title, abstract } = req.body;
        const userId = req.user.id;

        // 1. Encrypt File (AES)
        const { encryptedData, aesKey, iv } = cryptoEngine.encryptFileBuffer(fileBuffer);

        // 2. Encrypt Key (RSA) - Hybrid Approach
        const encryptedAesKey = cryptoEngine.wrapKey(aesKey);

        // 3. Encode to Base64 (Encoding Requirement)
        const fileBase64 = encryptedData.toString('base64');
        const ivHex = iv.toString('hex');

        // 4. Upload to Storage (Simulated by DB insert for Lab convenience)
        // In real Supabase, we'd upload 'fileBase64' to Storage bucket
        const { data, error } = await supabase.from('papers').insert({
            author_id: userId,
            title,
            abstract,
            encrypted_content: fileBase64, // Storing encrypted data encoded as Base64
            encrypted_key: encryptedAesKey, // RSA encrypted AES key
            iv: ivHex
        });

        if (error) throw error;
        res.json({ message: 'Paper encrypted and uploaded securely.' });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.downloadPaper = async (req, res) => {
    // 1. Fetch Encrypted Data
    const { data: paper } = await supabase.from('papers').select('*').eq('id', req.params.id).single();
    
    // 2. Decrypt AES Key using Server Private Key (RSA)
    const aesKey = cryptoEngine.unwrapKey(paper.encrypted_key);
    
    // 3. Decode Base64 Content
    const encryptedBuffer = Buffer.from(paper.encrypted_content, 'base64');
    const iv = Buffer.from(paper.iv, 'hex');

    // 4. Decrypt File Content (AES)
    const decryptedPdf = cryptoEngine.decryptFileBuffer(encryptedBuffer, aesKey, iv);

    res.contentType('application/pdf');
    res.send(decryptedPdf);
};