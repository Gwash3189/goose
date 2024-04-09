-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ApiKey" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "expiresAt" DATETIME NOT NULL,
    "expired" BOOLEAN NOT NULL DEFAULT false,
    "key" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    CONSTRAINT "ApiKey_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "Owner" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_ApiKey" ("createdAt", "expired", "expiresAt", "id", "key", "ownerId", "updatedAt") SELECT "createdAt", "expired", "expiresAt", "id", "key", "ownerId", "updatedAt" FROM "ApiKey";
DROP TABLE "ApiKey";
ALTER TABLE "new_ApiKey" RENAME TO "ApiKey";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
