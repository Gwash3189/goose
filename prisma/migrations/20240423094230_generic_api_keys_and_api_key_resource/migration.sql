/*
  Warnings:

  - You are about to drop the column `ownerId` on the `ApiKey` table. All the data in the column will be lost.

*/
-- CreateTable
CREATE TABLE "ApiKeyAssignment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "apiKeyId" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    CONSTRAINT "ApiKeyAssignment_apiKeyId_fkey" FOREIGN KEY ("apiKeyId") REFERENCES "ApiKey" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ApiKey" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "expiresAt" DATETIME NOT NULL,
    "expired" BOOLEAN NOT NULL DEFAULT false,
    "key" TEXT NOT NULL
);
INSERT INTO "new_ApiKey" ("createdAt", "expired", "expiresAt", "id", "key", "updatedAt") SELECT "createdAt", "expired", "expiresAt", "id", "key", "updatedAt" FROM "ApiKey";
DROP TABLE "ApiKey";
ALTER TABLE "new_ApiKey" RENAME TO "ApiKey";
CREATE UNIQUE INDEX "ApiKey_key_key" ON "ApiKey"("key");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;

-- CreateIndex
CREATE UNIQUE INDEX "ApiKeyAssignment_entity_key" ON "ApiKeyAssignment"("entity");
