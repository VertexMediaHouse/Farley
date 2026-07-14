-- Run once in Supabase SQL editor
create table if not exists product_prices (
  url            text primary key,
  name           text,
  price_per_lft  numeric not null,
  updated_at     timestamptz default now()
);

-- Example row:
-- insert into product_prices (url, name, price_per_lft) values
-- ('https://www.homedepot.com/p/Kelleher-LWM623-9-16-in-x-3-1-4-in-MDF-Baseboard-Molding-MDF221A/202071604', 'Kelleher Baseboard', 0.81);
