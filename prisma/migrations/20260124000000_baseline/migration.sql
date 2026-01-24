-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "pooplet_user" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "email_verified" BOOLEAN NOT NULL DEFAULT false,
    "name" TEXT,
    "image" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pooplet_user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pooplet_record" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "occurred_at" TIMESTAMP(3) NOT NULL,
    "quality_rating" INTEGER NOT NULL,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pooplet_record_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pooplet_session" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pooplet_session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pooplet_account" (
    "id" TEXT NOT NULL,
    "account_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "provider_id" TEXT NOT NULL,
    "provider_user_id" TEXT,
    "password" TEXT,
    "access_token" TEXT,
    "refresh_token" TEXT,
    "expires_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pooplet_account_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "pooplet_user_email_key" ON "pooplet_user"("email");

-- CreateIndex
CREATE INDEX "idx_pooplet_record_user_covering" ON "pooplet_record"("user_id" DESC, "occurred_at" DESC);

-- CreateIndex
CREATE INDEX "idx_pooplet_record_date_quality" ON "pooplet_record"("occurred_at", "quality_rating");

-- CreateIndex
CREATE INDEX "idx_pooplet_record_daily_stats" ON "pooplet_record"("user_id", "occurred_at");

-- CreateIndex
CREATE UNIQUE INDEX "pooplet_session_token_key" ON "pooplet_session"("token");

-- CreateIndex
CREATE INDEX "pooplet_session_user_id_idx" ON "pooplet_session"("user_id");

-- CreateIndex
CREATE INDEX "pooplet_session_token_idx" ON "pooplet_session"("token");

-- CreateIndex
CREATE INDEX "pooplet_account_user_id_idx" ON "pooplet_account"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "pooplet_account_provider_id_provider_user_id_key" ON "pooplet_account"("provider_id", "provider_user_id");

-- AddForeignKey
ALTER TABLE "pooplet_record" ADD CONSTRAINT "pooplet_record_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "pooplet_user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pooplet_session" ADD CONSTRAINT "pooplet_session_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "pooplet_user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pooplet_account" ADD CONSTRAINT "pooplet_account_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "pooplet_user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

