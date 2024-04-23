/*
  Warnings:

  - A unique constraint covering the columns `[apiKeyId]` on the table `ApiKeyAssignment` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "ApiKeyAssignment_apiKeyId_key" ON "ApiKeyAssignment"("apiKeyId");
