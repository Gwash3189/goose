-- DropIndex
DROP INDEX "ApiKey_entity_key";

-- CreateIndex
CREATE INDEX "ApiKey_key_entity_idx" ON "ApiKey"("key", "entity");
