/*
  Warnings:

  - You are about to drop the column `accountId` on the `ApiKeyAssignment` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ApiKeyAssignment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "apiKeyId" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    CONSTRAINT "ApiKeyAssignment_apiKeyId_fkey" FOREIGN KEY ("apiKeyId") REFERENCES "ApiKey" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_ApiKeyAssignment" ("apiKeyId", "createdAt", "entity", "id", "updatedAt") SELECT "apiKeyId", "createdAt", "entity", "id", "updatedAt" FROM "ApiKeyAssignment";
DROP TABLE "ApiKeyAssignment";
ALTER TABLE "new_ApiKeyAssignment" RENAME TO "ApiKeyAssignment";
CREATE UNIQUE INDEX "ApiKeyAssignment_entity_key" ON "ApiKeyAssignment"("entity");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
