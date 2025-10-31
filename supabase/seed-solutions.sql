-- Seed solutions with Lorem Ipsum content
-- Run this in Supabase SQL Editor to populate your solutions

-- Tire services
UPDATE solutions
SET 
  subtitle = 'Professional tire care and maintenance',
  description = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
  hero_title = 'Premium Tire Services for Every Vehicle',
  hero_subtitle = 'Expert Care, Maximum Safety',
  hero_description = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
  hero_cta_text = 'Book Tire Service',
  hero_cta_url = '/contact',
  description_heading = 'Why Choose Our Tire Services',
  description_text = 'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium.',
  key_benefits = '[
    {
      "heading": "Fast Installation",
      "text": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec vehicula augue eu neque malesuada luctus.",
      "image_url": "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=800&h=600&fit=crop"
    },
    {
      "heading": "Quality Brands",
      "text": "Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam.",
      "image_url": "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop"
    },
    {
      "heading": "Expert Technicians",
      "text": "Quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
      "image_url": "https://images.unsplash.com/photo-1621939514649-280e2ee25f60?w=800&h=600&fit=crop"
    }
  ]'::jsonb,
  footer_heading = 'Ready to Get Started?',
  footer_text = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Contact us today for professional tire services.',
  footer_cta_text = 'Schedule Appointment',
  footer_cta_url = '/contact'
WHERE id = '14f6a1ad-718f-4f2f-855f-2b0a950cbd96';

-- Car Wash
UPDATE solutions
SET 
  subtitle = 'Spotless results every time',
  description = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
  hero_title = 'Professional Car Wash Solutions',
  hero_subtitle = 'Shine Bright, Drive Clean',
  hero_description = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
  hero_cta_text = 'Book Car Wash',
  hero_cta_url = '/contact',
  description_heading = 'The Ultimate Clean Experience',
  description_text = 'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium.',
  key_benefits = '[
    {
      "heading": "Eco-Friendly Products",
      "text": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec vehicula augue eu neque malesuada luctus.",
      "image_url": "https://images.unsplash.com/photo-1601362840469-51e4d8d58785?w=800&h=600&fit=crop"
    },
    {
      "heading": "Quick Service",
      "text": "Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam.",
      "image_url": "https://images.unsplash.com/photo-1607860108855-64acf2078ed9?w=800&h=600&fit=crop"
    },
    {
      "heading": "Interior & Exterior",
      "text": "Quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
      "image_url": "https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?w=800&h=600&fit=crop"
    },
    {
      "heading": "Membership Plans",
      "text": "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.",
      "image_url": "https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?w=800&h=600&fit=crop"
    }
  ]'::jsonb,
  footer_heading = 'Get Your Car Sparkling Clean',
  footer_text = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Book your car wash today.',
  footer_cta_text = 'Book Now',
  footer_cta_url = '/contact'
WHERE id = '6a291618-f286-49bc-977e-2c63b68f8504';

-- Windscreen repair
UPDATE solutions
SET 
  subtitle = 'Clear vision, safe driving',
  description = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
  hero_title = 'Expert Windscreen Repair & Replacement',
  hero_subtitle = 'See Clearly, Drive Safely',
  hero_description = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
  hero_cta_text = 'Request Service',
  hero_cta_url = '/contact',
  description_heading = 'Professional Windscreen Solutions',
  description_text = 'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium.',
  key_benefits = '[
    {
      "heading": "Insurance Claims",
      "text": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec vehicula augue eu neque malesuada luctus.",
      "image_url": "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&h=600&fit=crop"
    },
    {
      "heading": "Mobile Service",
      "text": "Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam.",
      "image_url": "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=800&h=600&fit=crop"
    },
    {
      "heading": "Quality Guarantee",
      "text": "Quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
      "image_url": "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&h=600&fit=crop"
    }
  ]'::jsonb,
  footer_heading = 'Need Windscreen Repair?',
  footer_text = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Contact us for fast, professional service.',
  footer_cta_text = 'Get Quote',
  footer_cta_url = '/contact'
WHERE id = '6d78bae6-188d-465e-9d7a-71c444238840';

-- Car maintenance services
UPDATE solutions
SET 
  subtitle = 'Keep your vehicle running smoothly',
  description = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
  hero_title = 'Comprehensive Car Maintenance',
  hero_subtitle = 'Prevent Problems, Extend Life',
  hero_description = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
  hero_cta_text = 'Schedule Service',
  hero_cta_url = '/contact',
  description_heading = 'Complete Maintenance Solutions',
  description_text = 'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium.',
  key_benefits = '[
    {
      "heading": "Regular Inspections",
      "text": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec vehicula augue eu neque malesuada luctus.",
      "image_url": "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=800&h=600&fit=crop"
    },
    {
      "heading": "Oil Changes",
      "text": "Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam.",
      "image_url": "https://images.unsplash.com/photo-1625047509168-a7026f36de04?w=800&h=600&fit=crop"
    },
    {
      "heading": "Brake Service",
      "text": "Quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
      "image_url": "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800&h=600&fit=crop"
    },
    {
      "heading": "Fluid Checks",
      "text": "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.",
      "image_url": "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=800&h=600&fit=crop"
    }
  ]'::jsonb,
  footer_heading = 'Keep Your Car in Top Shape',
  footer_text = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Schedule your maintenance today.',
  footer_cta_text = 'Book Service',
  footer_cta_url = '/contact'
WHERE id = '73628da6-f1af-4596-bfa9-83927630bf4d';

-- Warranty recalls
UPDATE solutions
SET 
  subtitle = 'Stay safe with recall management',
  description = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
  hero_title = 'Warranty & Recall Services',
  hero_subtitle = 'Protection You Can Trust',
  hero_description = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
  hero_cta_text = 'Check Your Vehicle',
  hero_cta_url = '/contact',
  description_heading = 'Complete Recall Management',
  description_text = 'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium.',
  key_benefits = '[
    {
      "heading": "Automatic Notifications",
      "text": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec vehicula augue eu neque malesuada luctus.",
      "image_url": "https://images.unsplash.com/photo-1423666639041-f56000c27a9a?w=800&h=600&fit=crop"
    },
    {
      "heading": "Free Repairs",
      "text": "Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam.",
      "image_url": "https://images.unsplash.com/photo-1581092795360-fd1ca04f0952?w=800&h=600&fit=crop"
    },
    {
      "heading": "Priority Scheduling",
      "text": "Quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
      "image_url": "https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=800&h=600&fit=crop"
    }
  ]'::jsonb,
  footer_heading = 'Check for Recalls Today',
  footer_text = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ensure your vehicle is up to date.',
  footer_cta_text = 'Check Now',
  footer_cta_url = '/contact'
WHERE id = '89e62383-1c7d-4c77-9c12-560c462f117f';

-- Marketplace
UPDATE solutions
SET 
  subtitle = 'Buy and sell with confidence',
  description = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
  hero_title = 'Automotive Marketplace Platform',
  hero_subtitle = 'Connect Buyers & Sellers',
  hero_description = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
  hero_cta_text = 'Explore Marketplace',
  hero_cta_url = '/contact',
  description_heading = 'Your Trusted Automotive Marketplace',
  description_text = 'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium.',
  key_benefits = '[
    {
      "heading": "Secure Transactions",
      "text": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec vehicula augue eu neque malesuada luctus.",
      "image_url": "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800&h=600&fit=crop"
    },
    {
      "heading": "Verified Sellers",
      "text": "Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam.",
      "image_url": "https://images.unsplash.com/photo-1556742044-3c52d6e88c62?w=800&h=600&fit=crop"
    },
    {
      "heading": "Wide Selection",
      "text": "Quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
      "image_url": "https://images.unsplash.com/photo-1552960394-c81add8de6b8?w=800&h=600&fit=crop"
    }
  ]'::jsonb,
  footer_heading = 'Start Trading Today',
  footer_text = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Join our marketplace community.',
  footer_cta_text = 'Get Started',
  footer_cta_url = '/contact'
WHERE id = 'c71ba67a-fea9-4690-843c-859fc8a376be';

-- Fleet wash for business customers
UPDATE solutions
SET 
  subtitle = 'Professional fleet cleaning solutions',
  description = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
  hero_title = 'Fleet Wash for Business',
  hero_subtitle = 'Keep Your Fleet Looking Professional',
  hero_description = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
  hero_cta_text = 'Get Fleet Quote',
  hero_cta_url = '/contact',
  description_heading = 'Enterprise Fleet Solutions',
  description_text = 'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium.',
  key_benefits = '[
    {
      "heading": "Bulk Pricing",
      "text": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec vehicula augue eu neque malesuada luctus.",
      "image_url": "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800&h=600&fit=crop"
    },
    {
      "heading": "Flexible Scheduling",
      "text": "Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam.",
      "image_url": "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&h=600&fit=crop"
    },
    {
      "heading": "On-Site Service",
      "text": "Quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
      "image_url": "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&h=600&fit=crop"
    },
    {
      "heading": "Detailed Reporting",
      "text": "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.",
      "image_url": "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop"
    }
  ]'::jsonb,
  footer_heading = 'Ready for Professional Fleet Care?',
  footer_text = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Contact us for a custom fleet solution.',
  footer_cta_text = 'Request Quote',
  footer_cta_url = '/contact'
WHERE id = 'affd455b-7ed6-4918-9ec7-e4f81c7c6419';
