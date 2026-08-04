CREATE TABLE "ReportFeedback" (
    "id" SERIAL NOT NULL,
    "content" TEXT NOT NULL,
    "reportId" INTEGER NOT NULL,
    "authorId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "ReportFeedback_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "ReportFeedback_reportId_createdAt_idx" ON "ReportFeedback"("reportId", "createdAt");
CREATE INDEX "ReportFeedback_authorId_idx" ON "ReportFeedback"("authorId");
ALTER TABLE "ReportFeedback" ADD CONSTRAINT "ReportFeedback_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "Report"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ReportFeedback" ADD CONSTRAINT "ReportFeedback_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
