"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Postagem = void 0;
class Postagem {
    constructor(id, titulo, conteudo, data, curtidas) {
        this.id = id;
        this.titulo = titulo;
        this.conteudo = conteudo;
        this.data = data;
        this.curtidas = curtidas;
    }
    getId() {
        return this.id;
    }
    getTitulo() {
        return this.titulo;
    }
    getConteudo() {
        return this.conteudo;
    }
    getData() {
        return this.data;
    }
    getCurtidas() {
        return this.curtidas;
    }
}
exports.Postagem = Postagem;
//# sourceMappingURL=Postagem.js.map