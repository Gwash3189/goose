/*
  Warnings:

  - You are about to drop the `ApiKeyAssignment` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `entity` to the `ApiKey` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "ApiKeyAssignment_apiKeyId_key";

-- DropIndex
DROP INDEX "ApiKeyAssignment_entity_key";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "ApiKeyAssignment";
PRAGMA foreign_keys=on;

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ApiKey" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "expiresAt" DATETIME NOT NULL,
    "expired" BOOLEAN NOT NULL DEFAULT false,
    "key" TEXT NOT NULL,
    "entity" TEXT NOT NULL
);
INSERT INTO "new_ApiKey" ("createdAt", "expired", "expiresAt", "id", "key", "updatedAt") SELECT "createdAt", "expired", "expiresAt", "id", "key", "updatedAt" FROM "ApiKey";
DROP TABLE "ApiKey";
ALTER TABLE "new_ApiKey" RENAME TO "ApiKey";
CREATE UNIQUE INDEX "ApiKey_key_key" ON "ApiKey"("key");
CREATE UNIQUE INDEX "ApiKey_entity_key" ON "ApiKey"("entity");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
