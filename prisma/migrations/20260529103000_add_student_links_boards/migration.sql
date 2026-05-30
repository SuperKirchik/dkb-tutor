ALTER TABLE "User" ADD COLUMN "lessonCallLink" TEXT;

CREATE TABLE "StudentBoard" (
  "id" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "subject" TEXT NOT NULL,
  "url" TEXT NOT NULL,
  "studentId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "StudentBoard_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "StudentBoard" ADD CONSTRAINT "StudentBoard_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
