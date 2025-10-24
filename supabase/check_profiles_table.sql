-- Check if profiles table exists and what columns it has
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'profiles'
ORDER BY ordinal_position;

-- Check if your user has a profile entry
SELECT id, email, subscription_status, stripe_customer_id, is_admin
FROM profiles 
WHERE id = '20701f05-2dc4-4740-a8a2-4a14c8974882';

-- If no stripe_customer_id, check Stripe dashboard for your customer ID
-- Then run this to add it:
-- UPDATE profiles 
-- SET stripe_customer_id = 'cus_YOUR_STRIPE_CUSTOMER_ID_HERE'
-- WHERE id = '20701f05-2dc4-4740-a8a2-4a14c8974882';
