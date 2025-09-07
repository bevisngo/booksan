-- DropIndex (drop the old unique constraint on phone only)
DROP INDEX "users_phone_key";

-- CreateIndex (create new unique constraint on phone + role)
CREATE UNIQUE INDEX "users_phone_role_key" ON "users"("phone", "role");
