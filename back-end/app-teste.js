"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const Postagem_1 = require("./Postagem");
const app = (0, express_1.default)();
app.use(express_1.default.json());
// Endpoint para listar todas as postagens
app.get('/postagem', (req, res) => {
    const postagem = new Postagem_1.Postagem(1, "Minha primeira postagem...", "Este é o conteúdo da minha primeira postagem.", new Date("2024-09-02"), 0);
    res.json(postagem);
});
app.use((req, res, next) => {
    res.status(404).send('Não encontrado');
});
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
//# sourceMappingURL=app-teste.js.map