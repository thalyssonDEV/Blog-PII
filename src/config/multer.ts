import multer from 'multer';

// 1. Usa o armazenamento em memória
// O arquivo ficará disponível em req.file.buffer
const storage = multer.memoryStorage();

// 2. Define limites para o upload para segurança
const limits = {
    fileSize: 5 * 1024 * 1024, // Limite de 5 MB por arquivo
};

const upload = multer({
    storage: storage,
    limits: limits,
});

export default upload;