-- CreateEnum
CREATE TYPE "public"."BookingStatus" AS ENUM ('PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED', 'NO_SHOW', 'EXPIRED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "public"."ParticipantRole" AS ENUM ('PLAYER', 'SPECTATOR', 'COACH', 'ORGANIZER');

-- CreateEnum
CREATE TYPE "public"."ParticipantStatus" AS ENUM ('INVITED', 'ACCEPTED', 'DECLINED', 'PENDING', 'CHECKED_IN', 'NO_SHOW');

-- CreateEnum
CREATE TYPE "public"."InviteContactType" AS ENUM ('EMAIL', 'PHONE', 'SMS', 'APP_USER', 'WHATSAPP', 'ZALO');

-- CreateEnum
CREATE TYPE "public"."InviteStatus" AS ENUM ('SENT', 'ACCEPTED', 'DECLINED', 'EXPIRED', 'CANCELLED', 'PENDING');

-- CreateEnum
CREATE TYPE "public"."ShareLinkScope" AS ENUM ('PUBLIC', 'PRIVATE', 'INVITE_ONLY', 'TEAM_ONLY');

-- CreateEnum
CREATE TYPE "public"."RecurrenceFrequency" AS ENUM ('DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY', 'CUSTOM');

-- CreateEnum
CREATE TYPE "public"."RecurrenceExceptionAction" AS ENUM ('CANCELLED', 'MODIFIED', 'MOVED', 'RESCHEDULED');

-- CreateEnum
CREATE TYPE "public"."RecurrenceExceptionReasonType" AS ENUM ('MAINTENANCE', 'WEATHER', 'PERSONAL', 'OTHER', 'HOLIDAY', 'TOURNAMENT');

-- CreateEnum
CREATE TYPE "public"."Sport" AS ENUM ('TENNIS', 'BADMINTON', 'SQUASH', 'BASKETBALL', 'FOOTBALL', 'VOLLEYBALL', 'TABLE_TENNIS', 'OTHER', 'PICKLEBALL', 'FUTSAL');

-- CreateEnum
CREATE TYPE "public"."Surface" AS ENUM ('HARD_COURT', 'CLAY', 'GRASS', 'CARPET', 'CONCRETE', 'WOODEN', 'SYNTHETIC', 'OTHER', 'ACRYLIC', 'SAND');

-- CreateEnum
CREATE TYPE "public"."PaymentChannel" AS ENUM ('ONLINE', 'CASH', 'BANK_TRANSFER', 'MOBILE_MONEY', 'CREDIT_CARD', 'DEBIT_CARD', 'E_WALLET', 'QR_CODE', 'OTHER');

-- CreateEnum
CREATE TYPE "public"."PaymentProvider" AS ENUM ('STRIPE', 'PAYPAL', 'MOBILE_MONEY', 'BANK', 'CASH', 'OTHER', 'VNPAY', 'MOMO', 'ZALOPAY');

-- CreateEnum
CREATE TYPE "public"."PaymentCurrency" AS ENUM ('USD', 'EUR', 'GBP', 'JPY', 'CNY', 'VND', 'OTHER', 'SGD', 'THB');

-- CreateEnum
CREATE TYPE "public"."PaymentStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'CANCELLED', 'REFUNDED', 'EXPIRED', 'PARTIALLY_PAID');

-- CreateEnum
CREATE TYPE "public"."FeeRuleScope" AS ENUM ('BOOKING', 'SLOT', 'FACILITY', 'COURT', 'USER', 'INVOICE');

-- CreateEnum
CREATE TYPE "public"."FeeRuleApplyOn" AS ENUM ('TOTAL', 'PER_SLOT', 'PER_HOUR', 'PER_BOOKING', 'PER_USER');

-- CreateEnum
CREATE TYPE "public"."FeeRuleCalcType" AS ENUM ('PERCENTAGE', 'FIXED_AMOUNT', 'PER_UNIT', 'TIERED');

-- CreateEnum
CREATE TYPE "public"."InvoiceStatus" AS ENUM ('DRAFT', 'SENT', 'PAID', 'OVERDUE', 'CANCELLED', 'PARTIALLY_PAID');

-- CreateEnum
CREATE TYPE "public"."BillingCycle" AS ENUM ('DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY', 'ONE_TIME', 'CUSTOM');

-- CreateEnum
CREATE TYPE "public"."PlanScope" AS ENUM ('FACILITY', 'COURT', 'USER', 'SYSTEM', 'ORGANIZATION');

-- CreateEnum
CREATE TYPE "public"."SubscriptionStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'PAST_DUE', 'CANCELLED', 'EXPIRED', 'TRIAL');

-- CreateEnum
CREATE TYPE "public"."UserRole" AS ENUM ('PLAYER', 'OWNER', 'MANAGER', 'STAFF', 'ADMIN');

-- CreateEnum
CREATE TYPE "public"."OAuthProvider" AS ENUM ('GOOGLE', 'FACEBOOK', 'ZALO');

-- CreateTable
CREATE TABLE "public"."bookings" (
    "_id" TEXT NOT NULL,
    "player_id" TEXT NOT NULL,
    "facility_id" TEXT NOT NULL,
    "court_id" TEXT NOT NULL,
    "status" "public"."BookingStatus" NOT NULL DEFAULT 'PENDING',
    "start_at" TEXT NOT NULL,
    "end_at" TEXT NOT NULL,
    "slot_minutes" INTEGER NOT NULL,
    "unit_price" INTEGER NOT NULL,
    "total_price" INTEGER NOT NULL,
    "is_recurrence" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bookings_pkey" PRIMARY KEY ("_id")
);

-- CreateTable
CREATE TABLE "public"."booking_slots" (
    "_id" TEXT NOT NULL,
    "booking_id" TEXT NOT NULL,
    "court_id" TEXT NOT NULL,
    "start_time" TIMESTAMP(3) NOT NULL,
    "end_time" TIMESTAMP(3) NOT NULL,
    "status" "public"."BookingStatus" NOT NULL DEFAULT 'PENDING',
    "cancel_reason" TEXT,
    "cancelled_by" TEXT,
    "cancelled_at" TEXT,
    "created_by" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "booking_slots_pkey" PRIMARY KEY ("_id")
);

-- CreateTable
CREATE TABLE "public"."booking_participants" (
    "_id" TEXT NOT NULL,
    "booking_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "role" "public"."ParticipantRole" NOT NULL DEFAULT 'PLAYER',
    "status" "public"."ParticipantStatus" NOT NULL DEFAULT 'INVITED',
    "added_by_user" TEXT NOT NULL,
    "note" TEXT,
    "until_date" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "booking_participants_pkey" PRIMARY KEY ("_id")
);

-- CreateTable
CREATE TABLE "public"."booking_participant_invites" (
    "_id" TEXT NOT NULL,
    "booking_id" TEXT NOT NULL,
    "contact_type" "public"."InviteContactType" NOT NULL,
    "contact_value" TEXT NOT NULL,
    "status" "public"."InviteStatus" NOT NULL DEFAULT 'SENT',
    "invite_token" TEXT NOT NULL,
    "invited_by_user_id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "booking_participant_invites_pkey" PRIMARY KEY ("_id")
);

-- CreateTable
CREATE TABLE "public"."booking_share_links" (
    "_id" TEXT NOT NULL,
    "booking_id" TEXT NOT NULL,
    "booking_slot_id" TEXT,
    "token" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "scope" "public"."ShareLinkScope" NOT NULL DEFAULT 'PRIVATE',
    "revoked" BOOLEAN NOT NULL DEFAULT false,
    "created_by_user_id" TEXT NOT NULL,
    "metadata" JSONB,
    "expires_at" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "booking_share_links_pkey" PRIMARY KEY ("_id")
);

-- CreateTable
CREATE TABLE "public"."booking_recurrences" (
    "_id" TEXT NOT NULL,
    "booking_id" TEXT NOT NULL,
    "frequency" "public"."RecurrenceFrequency" NOT NULL,
    "interval" INTEGER NOT NULL,
    "by_day" INTEGER[],
    "by_month_day" INTEGER[],
    "start_date" TEXT NOT NULL,
    "until_date" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "booking_recurrences_pkey" PRIMARY KEY ("_id")
);

-- CreateTable
CREATE TABLE "public"."booking_recurrence_exceptions" (
    "_id" TEXT NOT NULL,
    "recurrence_id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "action" "public"."RecurrenceExceptionAction" NOT NULL,
    "new_start_time" TIMESTAMP(3),
    "new_end_time" TIMESTAMP(3),
    "new_field_id" TEXT,
    "reason_type" "public"."RecurrenceExceptionReasonType",
    "reason" TEXT,
    "created_by" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "booking_recurrence_exceptions_pkey" PRIMARY KEY ("_id")
);

-- CreateTable
CREATE TABLE "public"."facilities" (
    "_id" TEXT NOT NULL,
    "owner_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "desc" TEXT,
    "phone" TEXT,
    "address" TEXT NOT NULL,
    "ward" TEXT,
    "city" TEXT,
    "is_published" BOOLEAN NOT NULL DEFAULT false,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "facilities_pkey" PRIMARY KEY ("_id")
);

-- CreateTable
CREATE TABLE "public"."courts" (
    "_id" TEXT NOT NULL,
    "facility_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sport" "public"."Sport" NOT NULL,
    "surface" "public"."Surface",
    "indoor" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "slot_minutes" INTEGER NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "courts_pkey" PRIMARY KEY ("_id")
);

-- CreateTable
CREATE TABLE "public"."facility_open_hours" (
    "_id" TEXT NOT NULL,
    "facility_id" TEXT NOT NULL,
    "week_day" INTEGER NOT NULL,
    "open_time" TEXT NOT NULL,
    "close_time" TEXT NOT NULL,

    CONSTRAINT "facility_open_hours_pkey" PRIMARY KEY ("_id")
);

-- CreateTable
CREATE TABLE "public"."facility_profiles" (
    "_id" TEXT NOT NULL,
    "owner_id" TEXT NOT NULL,
    "html" TEXT,
    "meta_keywords" TEXT[],
    "meta_description" TEXT,
    "open_graph" TEXT,

    CONSTRAINT "facility_profiles_pkey" PRIMARY KEY ("_id")
);

-- CreateTable
CREATE TABLE "public"."pricing_rules" (
    "_id" TEXT NOT NULL,
    "court_id" TEXT NOT NULL,
    "weekday_mask" INTEGER NOT NULL,
    "start_time" TEXT NOT NULL,
    "end_time" TEXT NOT NULL,
    "price_per_slot" INTEGER NOT NULL,
    "notes" TEXT,
    "slot_minutes" INTEGER NOT NULL,

    CONSTRAINT "pricing_rules_pkey" PRIMARY KEY ("_id")
);

-- CreateTable
CREATE TABLE "public"."payments" (
    "_id" TEXT NOT NULL,
    "payer_user_id" TEXT NOT NULL,
    "payee_owner_id" TEXT NOT NULL,
    "booking_id" TEXT,
    "booking_slot_id" TEXT,
    "channel" "public"."PaymentChannel" NOT NULL,
    "provider" "public"."PaymentProvider" NOT NULL,
    "currency" "public"."PaymentCurrency" NOT NULL DEFAULT 'USD',
    "amount_total" INTEGER NOT NULL,
    "amount_captured" INTEGER NOT NULL,
    "status" "public"."PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "expires_at" TIMESTAMP(3),
    "note" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("_id")
);

-- CreateTable
CREATE TABLE "public"."payment_proofs" (
    "_id" TEXT NOT NULL,
    "payment_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "file_url" TEXT NOT NULL,
    "note" TEXT,
    "uploaded_by" TEXT NOT NULL,
    "verified_by" TEXT,
    "verified_at" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payment_proofs_pkey" PRIMARY KEY ("_id")
);

-- CreateTable
CREATE TABLE "public"."fee_rules" (
    "_id" TEXT NOT NULL,
    "payment_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "scope" "public"."FeeRuleScope" NOT NULL,
    "applyOn" "public"."FeeRuleApplyOn" NOT NULL,
    "calc_type" "public"."FeeRuleCalcType" NOT NULL,
    "value" INTEGER NOT NULL,
    "conditions" JSONB,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "fee_rules_pkey" PRIMARY KEY ("_id")
);

-- CreateTable
CREATE TABLE "public"."fee_charges" (
    "_id" TEXT NOT NULL,
    "owner_id" TEXT NOT NULL,
    "booking_id" TEXT,
    "payment_id" TEXT,
    "booking_slot_id" TEXT,
    "fee_rule_id" TEXT,
    "value" INTEGER NOT NULL,
    "conditions" JSONB,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "fee_charges_pkey" PRIMARY KEY ("_id")
);

-- CreateTable
CREATE TABLE "public"."owner_invoices" (
    "_id" TEXT NOT NULL,
    "owner_id" TEXT NOT NULL,
    "period_start" TIMESTAMP(3) NOT NULL,
    "period_end" TIMESTAMP(3) NOT NULL,
    "amount_due" INTEGER NOT NULL,
    "amount_paid" INTEGER NOT NULL,
    "status" "public"."InvoiceStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "owner_invoices_pkey" PRIMARY KEY ("_id")
);

-- CreateTable
CREATE TABLE "public"."owner_invoice_items" (
    "_id" TEXT NOT NULL,
    "owner_invoice_id" TEXT NOT NULL,
    "fee_charge_id" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "owner_invoice_items_pkey" PRIMARY KEY ("_id")
);

-- CreateTable
CREATE TABLE "public"."plans" (
    "_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "scope" "public"."PlanScope" NOT NULL,
    "amount" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "billing_cycle" "public"."BillingCycle" NOT NULL,
    "features" JSONB,
    "end_date" TIMESTAMP(3),
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "plans_pkey" PRIMARY KEY ("_id")
);

-- CreateTable
CREATE TABLE "public"."subscriptions" (
    "_id" TEXT NOT NULL,
    "owner_id" TEXT NOT NULL,
    "plan_id" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "amount" INTEGER NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3),
    "next_billing_date" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "status" "public"."SubscriptionStatus" NOT NULL DEFAULT 'ACTIVE',

    CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("_id")
);

-- CreateTable
CREATE TABLE "public"."users" (
    "_id" TEXT NOT NULL,
    "fullname" TEXT NOT NULL,
    "phone" TEXT,
    "password" TEXT NOT NULL,
    "email" TEXT,
    "role" "public"."UserRole" NOT NULL DEFAULT 'PLAYER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "oauthId" TEXT,
    "oauthProvider" "public"."OAuthProvider",

    CONSTRAINT "users_pkey" PRIMARY KEY ("_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "booking_share_links_token_key" ON "public"."booking_share_links"("token");

-- CreateIndex
CREATE UNIQUE INDEX "booking_share_links_slug_key" ON "public"."booking_share_links"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "public"."users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_phone_key" ON "public"."users"("phone");

-- AddForeignKey
ALTER TABLE "public"."bookings" ADD CONSTRAINT "bookings_court_id_fkey" FOREIGN KEY ("court_id") REFERENCES "public"."courts"("_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."bookings" ADD CONSTRAINT "bookings_facility_id_fkey" FOREIGN KEY ("facility_id") REFERENCES "public"."facilities"("_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."bookings" ADD CONSTRAINT "bookings_player_id_fkey" FOREIGN KEY ("player_id") REFERENCES "public"."users"("_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."booking_slots" ADD CONSTRAINT "booking_slots_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."booking_slots" ADD CONSTRAINT "booking_slots_cancelled_by_fkey" FOREIGN KEY ("cancelled_by") REFERENCES "public"."users"("_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."booking_slots" ADD CONSTRAINT "booking_slots_court_id_fkey" FOREIGN KEY ("court_id") REFERENCES "public"."courts"("_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."booking_participants" ADD CONSTRAINT "booking_participants_added_by_user_fkey" FOREIGN KEY ("added_by_user") REFERENCES "public"."users"("_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."booking_participants" ADD CONSTRAINT "booking_participants_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."booking_participants" ADD CONSTRAINT "booking_participants_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."booking_participant_invites" ADD CONSTRAINT "booking_participant_invites_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."booking_participant_invites" ADD CONSTRAINT "booking_participant_invites_invited_by_user_id_fkey" FOREIGN KEY ("invited_by_user_id") REFERENCES "public"."users"("_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."booking_share_links" ADD CONSTRAINT "booking_share_links_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."booking_share_links" ADD CONSTRAINT "booking_share_links_booking_slot_id_fkey" FOREIGN KEY ("booking_slot_id") REFERENCES "public"."booking_slots"("_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."booking_share_links" ADD CONSTRAINT "booking_share_links_created_by_user_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."users"("_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."booking_recurrences" ADD CONSTRAINT "booking_recurrences_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."booking_recurrence_exceptions" ADD CONSTRAINT "booking_recurrence_exceptions_new_field_id_fkey" FOREIGN KEY ("new_field_id") REFERENCES "public"."booking_slots"("_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."booking_recurrence_exceptions" ADD CONSTRAINT "booking_recurrence_exceptions_recurrence_id_fkey" FOREIGN KEY ("recurrence_id") REFERENCES "public"."booking_recurrences"("_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."facilities" ADD CONSTRAINT "facilities_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."courts" ADD CONSTRAINT "courts_facility_id_fkey" FOREIGN KEY ("facility_id") REFERENCES "public"."facilities"("_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."facility_open_hours" ADD CONSTRAINT "facility_open_hours_facility_id_fkey" FOREIGN KEY ("facility_id") REFERENCES "public"."facilities"("_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."facility_profiles" ADD CONSTRAINT "facility_profiles_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."pricing_rules" ADD CONSTRAINT "pricing_rules_court_id_fkey" FOREIGN KEY ("court_id") REFERENCES "public"."courts"("_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."payments" ADD CONSTRAINT "payments_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."payments" ADD CONSTRAINT "payments_booking_slot_id_fkey" FOREIGN KEY ("booking_slot_id") REFERENCES "public"."booking_slots"("_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."payments" ADD CONSTRAINT "payments_payee_owner_id_fkey" FOREIGN KEY ("payee_owner_id") REFERENCES "public"."users"("_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."payments" ADD CONSTRAINT "payments_payer_user_id_fkey" FOREIGN KEY ("payer_user_id") REFERENCES "public"."users"("_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."payment_proofs" ADD CONSTRAINT "payment_proofs_payment_id_fkey" FOREIGN KEY ("payment_id") REFERENCES "public"."payments"("_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."payment_proofs" ADD CONSTRAINT "payment_proofs_uploaded_by_fkey" FOREIGN KEY ("uploaded_by") REFERENCES "public"."users"("_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."payment_proofs" ADD CONSTRAINT "payment_proofs_verified_by_fkey" FOREIGN KEY ("verified_by") REFERENCES "public"."users"("_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."fee_rules" ADD CONSTRAINT "fee_rules_payment_id_fkey" FOREIGN KEY ("payment_id") REFERENCES "public"."payments"("_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."fee_charges" ADD CONSTRAINT "fee_charges_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."fee_charges" ADD CONSTRAINT "fee_charges_booking_slot_id_fkey" FOREIGN KEY ("booking_slot_id") REFERENCES "public"."booking_slots"("_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."fee_charges" ADD CONSTRAINT "fee_charges_fee_rule_id_fkey" FOREIGN KEY ("fee_rule_id") REFERENCES "public"."fee_rules"("_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."fee_charges" ADD CONSTRAINT "fee_charges_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."fee_charges" ADD CONSTRAINT "fee_charges_payment_id_fkey" FOREIGN KEY ("payment_id") REFERENCES "public"."payments"("_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."owner_invoices" ADD CONSTRAINT "owner_invoices_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."owner_invoice_items" ADD CONSTRAINT "owner_invoice_items_fee_charge_id_fkey" FOREIGN KEY ("fee_charge_id") REFERENCES "public"."fee_charges"("_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."owner_invoice_items" ADD CONSTRAINT "owner_invoice_items_owner_invoice_id_fkey" FOREIGN KEY ("owner_invoice_id") REFERENCES "public"."owner_invoices"("_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."subscriptions" ADD CONSTRAINT "subscriptions_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."subscriptions" ADD CONSTRAINT "subscriptions_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "public"."plans"("_id") ON DELETE RESTRICT ON UPDATE CASCADE;
