-- First, create a new temporary column with the correct type
ALTER TABLE "user" ADD COLUMN "phone_verified_temp" boolean;

-- Update the new column based on the old column's value
UPDATE "user" SET "phone_verified_temp" = CASE 
  WHEN "phoneVerified" = 'true' THEN true
  WHEN "phoneVerified" = 'false' THEN false
  ELSE NULL
END;

-- Drop the old column
ALTER TABLE "user" DROP COLUMN "phoneVerified";

-- Rename the new column to the original name
ALTER TABLE "user" RENAME COLUMN "phone_verified_temp" TO "phoneVerified";
