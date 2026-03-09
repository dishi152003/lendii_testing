-- Seed data for Lendii FWP
-- Run this after schema.sql

-- Insert admin user
INSERT INTO users (email, role) VALUES
('admin@lendii.test', 'admin'),
('laura@example.com', 'borrower')
ON CONFLICT (email) DO NOTHING;

-- Get admin user ID for listings
DO $$
DECLARE
  admin_id UUID;
BEGIN
  SELECT id INTO admin_id FROM users WHERE email = 'admin@lendii.test' LIMIT 1;

  -- Insert sample listings
  INSERT INTO listings (
    title,
    description,
    category,
    size,
    brand,
    condition,
    rental_price,
    retail_price,
    deposit,
    images,
    status,
    is_available,
    owner_id
  ) VALUES
  (
    'Elegant Black Evening Gown',
    'Stunning floor-length evening gown in classic black. Perfect for galas, weddings, and formal events. Features a fitted bodice with delicate beading and a flowing skirt.',
    'dresses',
    'M',
    'Armani',
    'excellent',
    150.00,
    1200.00,
    200.00,
    ARRAY['https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=800', 'https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=800'],
    'published',
    TRUE,
    admin_id
  ),
  (
    'Designer Cocktail Dress - Gold',
    'Glamorous gold cocktail dress with sequin detailing. Perfect for parties and special occasions. Fits true to size with a flattering silhouette.',
    'dresses',
    'S',
    'Versace',
    'new',
    200.00,
    2500.00,
    300.00,
    ARRAY['https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=800'],
    'published',
    TRUE,
    admin_id
  ),
  (
    'Classic Navy Blazer',
    'Timeless navy blue blazer perfect for business meetings or smart casual events. Premium wool blend with satin lining.',
    'outerwear',
    'L',
    'Hugo Boss',
    'excellent',
    75.00,
    800.00,
    100.00,
    ARRAY['https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800'],
    'published',
    TRUE,
    admin_id
  ),
  (
    'Leather Biker Jacket',
    'Edgy genuine leather biker jacket in black. Perfect for adding edge to any outfit. Features metal hardware and quilted shoulders.',
    'outerwear',
    'M',
    'AllSaints',
    'good',
    100.00,
    1500.00,
    150.00,
    ARRAY['https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800'],
    'published',
    TRUE,
    admin_id
  ),
  (
    'Floral Summer Dress',
    'Light and airy floral print dress perfect for summer events. Features a wrap style and flattering midi length.',
    'dresses',
    'M',
    'Reformation',
    'excellent',
    80.00,
    350.00,
    75.00,
    ARRAY['https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=800'],
    'published',
    TRUE,
    admin_id
  )
  ON CONFLICT DO NOTHING;

END $$;

-- Insert sample order (optional)
DO $$
DECLARE
  user_id UUID;
  listing_id UUID;
BEGIN
  SELECT id INTO user_id FROM users WHERE email = 'laura@example.com' LIMIT 1;
  SELECT id INTO listing_id FROM listings WHERE title = 'Elegant Black Evening Gown' LIMIT 1;

  IF user_id IS NOT NULL AND listing_id IS NOT NULL THEN
    INSERT INTO orders (
      user_id,
      listing_id,
      start_date,
      end_date,
      total_amount,
      deposit_amount,
      status
    ) VALUES (
      user_id,
      listing_id,
      NOW() + INTERVAL '7 days',
      NOW() + INTERVAL '10 days',
      450.00,
      200.00,
      'confirmed'
    )
    ON CONFLICT DO NOTHING;
  END IF;
END $$;
