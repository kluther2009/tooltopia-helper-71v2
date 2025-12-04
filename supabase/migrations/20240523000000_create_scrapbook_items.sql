-- Create enum for item types
create type scrapbook_item_type as enum ('photo', 'note', 'voice', 'link');

-- Create the scrapbook_items table
create table scrapbook_items (
  id uuid default gen_random_uuid() primary key,
  project_id uuid references projects(id) on delete cascade not null,
  type scrapbook_item_type not null,
  content jsonb not null default '{}'::jsonb,
  media_url text,
  tags text[],
  created_at timestamptz default now() not null,
  created_by uuid references auth.users(id) default auth.uid()
);

-- Enable RLS
alter table scrapbook_items enable row level security;

-- Policies
-- We assume projects table has user_id which is the owner.
-- If projects are shared, this logic might need adjustment, but for now we stick to owner-only or simple checks.

create policy "Users can view scrapbook items for their projects"
  on scrapbook_items for select
  using (
    exists (
      select 1 from projects
      where projects.id = scrapbook_items.project_id
      and projects.user_id = auth.uid()
    )
  );

create policy "Users can insert scrapbook items for their projects"
  on scrapbook_items for insert
  with check (
    exists (
      select 1 from projects
      where projects.id = scrapbook_items.project_id
      and projects.user_id = auth.uid()
    )
  );

create policy "Users can update scrapbook items for their projects"
  on scrapbook_items for update
  using (
    exists (
      select 1 from projects
      where projects.id = scrapbook_items.project_id
      and projects.user_id = auth.uid()
    )
  );

create policy "Users can delete scrapbook items for their projects"
  on scrapbook_items for delete
  using (
    exists (
      select 1 from projects
      where projects.id = scrapbook_items.project_id
      and projects.user_id = auth.uid()
    )
  );
