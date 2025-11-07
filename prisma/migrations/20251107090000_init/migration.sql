-- CreateTable
CREATE TABLE "Program" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "source" TEXT,
    "sourceId" TEXT,
    "summary" TEXT,
    "description" TEXT,
    "category" TEXT,
    "region" TEXT,
    "target" TEXT,
    "method" TEXT,
    "amountMin" INTEGER,
    "amountMax" INTEGER,
    "startDate" DATETIME,
    "endDate" DATETIME,
    "status" TEXT DEFAULT 'open',
    "url" TEXT,
    "organizer" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Program_sourceId_key" ON "Program"("sourceId");
