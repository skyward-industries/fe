-- Fix NSN values by removing extra leading zeros from the last segment
-- Example: 8940-00-000-000042 becomes 8940-00-000-0042

-- First, let's see some examples of current NSN values that need fixing
SELECT nsn, 
       CASE 
           WHEN nsn ~ '^[0-9]{4}-[0-9]{2}-[0-9]{3}-[0-9]+$' THEN
               SUBSTRING(nsn FROM 1 FOR 14) || 
               LPAD(LTRIM(SUBSTRING(nsn FROM 15), '0'), 4, '0')
           ELSE nsn
       END as corrected_nsn
FROM inc 
WHERE nsn ~ '^[0-9]{4}-[0-9]{2}-[0-9]{3}-[0-9]{5,}$'
LIMIT 10;

-- Update query to fix the NSN values
UPDATE inc 
SET nsn = SUBSTRING(nsn FROM 1 FOR 14) || 
          LPAD(LTRIM(SUBSTRING(nsn FROM 15), '0'), 4, '0')
WHERE nsn ~ '^[0-9]{4}-[0-9]{2}-[0-9]{3}-[0-9]{5,}$'
  AND SUBSTRING(nsn FROM 15) ~ '^0+[0-9]+$';

-- Verify the changes
SELECT COUNT(*) as total_updated_records
FROM inc 
WHERE nsn ~ '^[0-9]{4}-[0-9]{2}-[0-9]{3}-[0-9]{4}$';