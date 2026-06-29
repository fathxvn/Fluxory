UPDATE "User"
SET "role" = 'user'
WHERE "role" = 'staff';

ALTER TABLE "User"
ALTER COLUMN "role" SET DEFAULT 'user';
