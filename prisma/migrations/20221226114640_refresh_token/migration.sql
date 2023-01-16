/*
  Warnings:

  - A unique constraint covering the columns `[username]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - Made the column `is_verified` on table `users` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "users" ADD COLUMN     "refresh_token" TEXT,
ALTER COLUMN "is_verified" SET NOT NULL,
ALTER COLUMN "is_verified" SET DEFAULT false;

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");
