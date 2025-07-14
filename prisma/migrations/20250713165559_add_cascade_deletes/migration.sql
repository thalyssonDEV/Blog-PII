-- DropForeignKey
ALTER TABLE "comentario" DROP CONSTRAINT "comentario_autor_id_fkey";

-- DropForeignKey
ALTER TABLE "comentario" DROP CONSTRAINT "comentario_post_id_fkey";

-- DropForeignKey
ALTER TABLE "post" DROP CONSTRAINT "post_autor_id_fkey";

-- AddForeignKey
ALTER TABLE "post" ADD CONSTRAINT "post_autor_id_fkey" FOREIGN KEY ("autor_id") REFERENCES "usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comentario" ADD CONSTRAINT "comentario_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comentario" ADD CONSTRAINT "comentario_autor_id_fkey" FOREIGN KEY ("autor_id") REFERENCES "usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;
