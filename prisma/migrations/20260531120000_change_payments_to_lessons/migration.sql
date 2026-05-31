ALTER TABLE "Payment" DROP CONSTRAINT IF EXISTS "Payment_studentId_fkey";
DROP INDEX IF EXISTS "Payment_studentId_month_key";

DELETE FROM "Payment";

ALTER TABLE "Payment" DROP COLUMN IF EXISTS "studentId";
ALTER TABLE "Payment" DROP COLUMN IF EXISTS "month";
ALTER TABLE "Payment" ADD COLUMN "lessonId" TEXT NOT NULL;

CREATE UNIQUE INDEX "Payment_lessonId_key" ON "Payment"("lessonId");

ALTER TABLE "Payment" ADD CONSTRAINT "Payment_lessonId_fkey"
  FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
