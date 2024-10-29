-- CreateTable
CREATE TABLE "PostPhoto" (
    "id" SERIAL NOT NULL,
    "post_photo_id" TEXT NOT NULL,
    "post_id" INTEGER NOT NULL,

    CONSTRAINT "PostPhoto_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "PostPhoto" ADD CONSTRAINT "PostPhoto_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "Post"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
