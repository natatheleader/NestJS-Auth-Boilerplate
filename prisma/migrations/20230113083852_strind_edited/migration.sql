/*
  Warnings:

  - You are about to alter the column `user_id` on the `password_resets` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.
  - You are about to alter the column `reset_token` on the `password_resets` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.
  - You are about to alter the column `password` on the `users` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.
  - You are about to alter the column `refresh_token` on the `users` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.
  - You are about to alter the column `provider` on the `users` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.

*/
-- DropForeignKey
ALTER TABLE "password_resets" DROP CONSTRAINT "password_resets_user_id_fkey";

-- AlterTable
ALTER TABLE "password_resets" ALTER COLUMN "user_id" SET DATA TYPE VARCHAR(255),
ALTER COLUMN "reset_token" SET DATA TYPE VARCHAR(255);

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "password" SET DATA TYPE VARCHAR(255),
ALTER COLUMN "refresh_token" SET DATA TYPE VARCHAR(255),
ALTER COLUMN "provider" SET DATA TYPE VARCHAR(255);

-- AddForeignKey
ALTER TABLE "password_resets" ADD CONSTRAINT "password_resets_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
