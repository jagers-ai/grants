-- CreateIndex (성능 최적화 인덱스만 추가)
CREATE INDEX "idx_date_sorting" ON "Program"("endDate", "createdAt");

-- CreateIndex
CREATE INDEX "idx_category" ON "Program"("category");

-- CreateIndex
CREATE INDEX "idx_region" ON "Program"("region");

-- CreateIndex
CREATE INDEX "idx_status" ON "Program"("status");
