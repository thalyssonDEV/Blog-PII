import multer from 'multer';
import path from 'path';
import fs from 'fs';

const uploadPath = path.resolve(__dirname, '..', '..', 'public', 'imagens');

// Garante que o diretório de upload exista
if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        // Salva o arquivo com um nome temporário único
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const extension = path.extname(file.originalname);
        cb(null, uniqueSuffix + extension);
    }
});

const upload = multer({ storage: storage });

export default upload;