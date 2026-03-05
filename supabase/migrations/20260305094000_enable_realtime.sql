-- ============================================
-- Enable Realtime for All Tables
-- ============================================

-- First, create a helper function
create or replace function public.executeschematables(_schema text, _query text)
returns text
language plpgsql
as $$
declare
  row record;
begin
  for row in select tablename from pg_tables as t
  where t.schemaname = _schema
  loop
    begin
      execute format(_query, row.tablename);
    exception when others then
      -- Table might already be in publication, skip error
      raise notice 'Table %: %', row.tablename, SQLERRM;
    end;
  end loop;
  return 'success';
end;
$$;

-- Then use it to add all public tables to realtime
select executeschematables('public', 'alter publication supabase_realtime add table %I;');
