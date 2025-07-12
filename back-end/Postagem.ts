export class Postagem {
    private id: number;
    private titulo: string;
    private conteudo: string;
    private data: Date;
    private curtidas: number;

    constructor(id: number, titulo: string, conteudo: string, data: Date, curtidas: number) {
        this.id = id;
        this.titulo = titulo;
        this.conteudo = conteudo;
        this.data = data;
        this.curtidas = curtidas;
    }

    public getId(): number {
        return this.id;
    }

    public getTitulo(): string {
        return this.titulo;
    }

    public getConteudo(): string {
        return this.conteudo;
    }

    public getData(): Date {
        return this.data;
    }

    public getCurtidas(): number {
        return this.curtidas;
    }
}