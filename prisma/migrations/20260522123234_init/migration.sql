-- CreateEnum
CREATE TYPE "ToneMode" AS ENUM ('FRIEND', 'FORMAL');

-- CreateEnum
CREATE TYPE "FoodCategory" AS ENUM ('CHICKEN', 'CHINESE', 'PIZZA', 'SNACK', 'BURGER', 'KOREAN', 'OTHER');

-- CreateEnum
CREATE TYPE "WeatherType" AS ENUM ('SUNNY', 'CLOUDY', 'RAINY');

-- CreateEnum
CREATE TYPE "PM25Level" AS ENUM ('GOOD', 'MODERATE', 'BAD', 'VERY_BAD');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "clerkId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT '',
    "district" TEXT NOT NULL DEFAULT '',
    "toneMode" "ToneMode" NOT NULL DEFAULT 'FRIEND',
    "notificationsEnabled" BOOLEAN NOT NULL DEFAULT false,
    "hasCompletedOnboarding" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Order" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "restaurant" TEXT NOT NULL,
    "category" "FoodCategory" NOT NULL,
    "items" JSONB NOT NULL,
    "plasticG" INTEGER NOT NULL,
    "actualG" INTEGER,
    "unrequested" TEXT[],
    "weather" "WeatherType" NOT NULL,
    "pm25" "PM25Level" NOT NULL,
    "usedMessage" BOOLEAN NOT NULL DEFAULT false,
    "lenses" JSONB NOT NULL,
    "scannedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WeeklyReport" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "weekStart" TIMESTAMP(3) NOT NULL,
    "weekEnd" TIMESTAMP(3) NOT NULL,
    "totalG" INTEGER NOT NULL,
    "insight" TEXT NOT NULL,
    "narrative" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WeeklyReport_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_clerkId_key" ON "User"("clerkId");

-- CreateIndex
CREATE INDEX "User_clerkId_idx" ON "User"("clerkId");

-- CreateIndex
CREATE INDEX "Order_userId_idx" ON "Order"("userId");

-- CreateIndex
CREATE INDEX "Order_userId_scannedAt_idx" ON "Order"("userId", "scannedAt");

-- CreateIndex
CREATE INDEX "Order_userId_category_idx" ON "Order"("userId", "category");

-- CreateIndex
CREATE INDEX "WeeklyReport_userId_idx" ON "WeeklyReport"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "WeeklyReport_userId_weekStart_key" ON "WeeklyReport"("userId", "weekStart");

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WeeklyReport" ADD CONSTRAINT "WeeklyReport_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
