-- DropIndex
DROP INDEX "ApiKey_key_entity_idx";

-- CreateIndex
CREATE INDEX "ApiKey_entity_idx" ON "ApiKey"("entity");
