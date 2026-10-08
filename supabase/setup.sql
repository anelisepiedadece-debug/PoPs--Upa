-- Run once in the SQL Editor of a dedicated Supabase Free project.
-- Safe to rerun: it does not delete accounts, documents or versions.
begin;
create table if not exists public.pops_upa_users (
 id text primary key, name text not null, email text unique not null,
 password text not null, role text not null check(role in ('admin','member')),
 active integer not null default 1 check(active in (0,1))
);
create unique index if not exists pops_upa_single_admin on public.pops_upa_users(role) where role='admin';
create table if not exists public.pops_upa_sessions (
 hash text primary key, user_id text references public.pops_upa_users(id) on delete cascade,
 expires timestamptz not null
);
create table if not exists public.pops_upa_pops (id text primary key, body jsonb not null);
create unique index if not exists pops_upa_unique_code on public.pops_upa_pops(lower(body->>'code'));
create table if not exists public.pops_upa_versions (
 id text primary key, pop_id text references public.pops_upa_pops(id) on delete cascade,
 version text not null, date text not null, body jsonb not null,
 sequence bigint generated always as identity
);
create table if not exists public.pops_upa_attempts (email text primary key, count integer not null, expires timestamptz not null);
-- No browser/client access: application authenticates users on the server.
alter table public.pops_upa_users enable row level security;
alter table public.pops_upa_sessions enable row level security;
alter table public.pops_upa_pops enable row level security;
alter table public.pops_upa_versions enable row level security;
alter table public.pops_upa_attempts enable row level security;
revoke all on public.pops_upa_users,public.pops_upa_sessions,public.pops_upa_pops,public.pops_upa_versions,public.pops_upa_attempts from anon,authenticated;
grant all on public.pops_upa_users,public.pops_upa_sessions,public.pops_upa_pops,public.pops_upa_versions,public.pops_upa_attempts to service_role;
grant usage,select on sequence public.pops_upa_versions_sequence_seq to service_role;

create or replace function public.pops_upa(operation text, args jsonb default '{}'::jsonb)
returns jsonb language plpgsql security invoker set search_path = public as $$
declare
 result jsonb; old_pop jsonb; person public.pops_upa_users%rowtype;
 attempt public.pops_upa_attempts%rowtype; identifier text := args->>'id';
 identity text := args->>'email';
begin
 case operation
 when 'list_pops' then
  select coalesce(jsonb_agg(body order by id),'[]'::jsonb) into result from pops_upa_pops
   where coalesce((args->>'includeInactive')::boolean,false) or body->>'status'='active';
 when 'get_pop' then select body into result from pops_upa_pops where id=identifier;
 when 'save_pop' then
  -- Serialize mutations so concurrent edits cannot lose a version or view count.
  perform pg_advisory_xact_lock(781346);
  select body into old_pop from pops_upa_pops where id=args->'pop'->>'id' for update;
  if old_pop is not null then
   insert into pops_upa_versions(id,pop_id,version,date,body)
    values(gen_random_uuid()::text,old_pop->>'id',old_pop->>'version',old_pop->>'updatedAt',old_pop);
  end if;
  insert into pops_upa_pops(id,body) values(args->'pop'->>'id',
   case when old_pop is null then args->'pop' else jsonb_set(args->'pop','{views}',old_pop->'views') end)
   on conflict(id) do update set body=excluded.body;
  result := 'true'::jsonb;
 when 'delete_pop' then delete from pops_upa_pops where id=identifier; result := 'true'::jsonb;
 when 'increment_views' then
  perform pg_advisory_xact_lock(781346);
  update pops_upa_pops set body=jsonb_set(body,'{views}',to_jsonb(coalesce((body->>'views')::integer,0)+1)) where id=identifier;
  result := 'true'::jsonb;
 when 'versions' then
  select coalesce(jsonb_agg(jsonb_build_object('id',id,'popId',pop_id,'version',version,'date',date,'snapshot',body) order by sequence desc),'[]'::jsonb)
   into result from pops_upa_versions where pop_id=identifier;
 when 'has_admin' then select to_jsonb(exists(select 1 from pops_upa_users where role='admin')) into result;
 when 'create_user' then
  insert into pops_upa_users(id,name,email,password,role)
   values(identifier,args->>'name',identity,args->>'password',args->>'role');
  if args->>'role'='admin' then delete from pops_upa_attempts where email=identity; end if;
  result := to_jsonb(identifier);
 when 'list_users' then
  select coalesce(jsonb_agg(jsonb_build_object('id',id,'name',name,'email',email,'role',role,'active',active) order by role,name),'[]'::jsonb)
   into result from pops_upa_users;
 when 'toggle_member','reset_password' then
  select * into person from pops_upa_users where id=identifier and role='member' for update;
  if person.id is null then raise exception 'Member missing'; end if;
  if operation='toggle_member' then update pops_upa_users set active=1-active where id=identifier;
  else update pops_upa_users set password=args->>'password' where id=identifier; end if;
  delete from pops_upa_sessions where user_id=identifier;
  result := 'true'::jsonb;
 when 'login_user' then
  select to_jsonb(u) into result from pops_upa_users u where email=identity;
 when 'login_finish' then
  -- Identity-specific lock makes rate limits work across serverless instances.
  perform pg_advisory_xact_lock(hashtextextended(identity,0));
  select * into attempt from pops_upa_attempts where email=identity;
  if attempt.expires>now() and attempt.count>=5 then return to_jsonb('blocked'::text); end if;
  select * into person from pops_upa_users where email=identity for update;
  -- Recheck active/password after verification to prevent reset/suspension races.
  if not coalesce((args->>'valid')::boolean,false) or person.id is null or person.active<>1
   or person.password is distinct from args->>'passwordHash' then
   insert into pops_upa_attempts(email,count,expires) values(identity,
    case when attempt.expires>now() then attempt.count+1 else 1 end,
    case when attempt.expires>now() then attempt.expires else now()+interval '15 minutes' end)
    on conflict(email) do update set count=excluded.count,expires=excluded.expires;
   return to_jsonb('invalid'::text);
  end if;
  delete from pops_upa_attempts where email=identity;
  delete from pops_upa_sessions where expires<now();
  insert into pops_upa_sessions values(args->>'hash',person.id,now()+interval '8 hours');
  result := to_jsonb('ok'::text);
 when 'session_user' then
  select jsonb_build_object('id',u.id,'name',u.name,'email',u.email,'role',u.role,'active',u.active)
   into result from pops_upa_sessions s join pops_upa_users u on u.id=s.user_id
   where s.hash=args->>'hash' and s.expires>now() and u.active=1;
 when 'end_session' then delete from pops_upa_sessions where hash=args->>'hash'; result := 'true'::jsonb;
 else raise exception 'Unknown operation';
 end case;
 return coalesce(result,'null'::jsonb);
end;
$$;
revoke all on function public.pops_upa(text,jsonb) from public,anon,authenticated;
grant execute on function public.pops_upa(text,jsonb) to service_role;
-- Private bucket; no policies granting reads/uploads to anon or authenticated.
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
 values('pops-upa-private','pops-upa-private',false,3145728,array['application/pdf'])
 on conflict(id) do update set public=false,file_size_limit=excluded.file_size_limit,allowed_mime_types=excluded.allowed_mime_types;
commit;
