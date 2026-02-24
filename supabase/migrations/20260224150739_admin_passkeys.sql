-- Create admin_passkeys table
create table if not exists public.admin_passkeys (
    id uuid default gen_random_uuid() primary key,
    passkey text not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    expires_at timestamp with time zone not null
);

-- Enable RLS
alter table public.admin_passkeys enable row level security;

-- Policies
-- Since this is an admin passkey system, we allow anyone (anon) to insert (generate) 
-- and select (to check if it exists/valid), but we'll enforce the logic in the app.
-- For better security, we could restrict select to only the exact passkey being checked.

create policy "Enable insert for all" on public.admin_passkeys
    for insert with check (true);

create policy "Enable read for all" on public.admin_passkeys
    for select using (true);

create policy "Enable delete for all" on public.admin_passkeys
    for delete using (true);
