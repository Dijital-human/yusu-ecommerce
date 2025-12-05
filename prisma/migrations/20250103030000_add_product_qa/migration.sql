-- CreateTable
-- Product Question Model / Məhsul Sual Modeli
-- Customer questions about products / Məhsullar haqqında müştəri sualları
CREATE TABLE "product_questions" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "helpfulCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
-- Product Answer Model / Məhsul Cavab Modeli
-- Answers to product questions / Məhsul suallarına cavablar
CREATE TABLE "product_answers" (
    "id" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "isSeller" BOOLEAN NOT NULL DEFAULT false,
    "helpfulCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_answers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
-- Question Vote Model / Sual Səs Modeli
-- Votes on questions (helpful/not helpful) / Suallara səslər (faydalı/faydasız)
CREATE TABLE "question_votes" (
    "id" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "voteType" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "question_votes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
-- Answer Vote Model / Cavab Səs Modeli
-- Votes on answers (helpful/not helpful) / Cavablara səslər (faydalı/faydasız)
CREATE TABLE "answer_votes" (
    "id" TEXT NOT NULL,
    "answerId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "voteType" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "answer_votes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
-- Indexes for better query performance / Daha yaxşı sorğu performansı üçün index-lər
CREATE INDEX "product_questions_productId_idx" ON "product_questions"("productId");

CREATE INDEX "product_questions_userId_idx" ON "product_questions"("userId");

CREATE INDEX "product_questions_status_idx" ON "product_questions"("status");

CREATE INDEX "product_questions_helpfulCount_idx" ON "product_questions"("helpfulCount");

CREATE INDEX "product_questions_createdAt_idx" ON "product_questions"("createdAt");

CREATE INDEX "product_answers_questionId_idx" ON "product_answers"("questionId");

CREATE INDEX "product_answers_userId_idx" ON "product_answers"("userId");

CREATE INDEX "product_answers_isSeller_idx" ON "product_answers"("isSeller");

CREATE INDEX "product_answers_helpfulCount_idx" ON "product_answers"("helpfulCount");

CREATE INDEX "product_answers_createdAt_idx" ON "product_answers"("createdAt");

CREATE INDEX "question_votes_questionId_idx" ON "question_votes"("questionId");

CREATE INDEX "question_votes_userId_idx" ON "question_votes"("userId");

CREATE INDEX "answer_votes_answerId_idx" ON "answer_votes"("answerId");

CREATE INDEX "answer_votes_userId_idx" ON "answer_votes"("userId");

-- CreateUniqueConstraint
-- Unique constraints / Unikal məhdudiyyətlər
CREATE UNIQUE INDEX "question_votes_questionId_userId_key" ON "question_votes"("questionId", "userId");

CREATE UNIQUE INDEX "answer_votes_answerId_userId_key" ON "answer_votes"("answerId", "userId");

-- AddForeignKey
-- Foreign key constraints / Xarici açar məhdudiyyətləri
ALTER TABLE "product_questions" ADD CONSTRAINT "product_questions_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "product_questions" ADD CONSTRAINT "product_questions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "product_answers" ADD CONSTRAINT "product_answers_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "product_questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "product_answers" ADD CONSTRAINT "product_answers_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "question_votes" ADD CONSTRAINT "question_votes_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "product_questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "question_votes" ADD CONSTRAINT "question_votes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "answer_votes" ADD CONSTRAINT "answer_votes_answerId_fkey" FOREIGN KEY ("answerId") REFERENCES "product_answers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "answer_votes" ADD CONSTRAINT "answer_votes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

