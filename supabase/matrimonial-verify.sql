select 'qa_rich_male_profiles' as check_name, count(*)::integer as total
from public.profiles
where id like 'qa-male-%' and gender = 'male'
union all
select 'qa_rich_female_profiles' as check_name, count(*)::integer as total
from public.profiles
where id like 'qa-female-%' and gender = 'female'
union all
select 'qa_rich_goals' as check_name, count(distinct preferences->>'matrimonialGoal')::integer as total
from public.profiles
where id like 'qa-male-%' or id like 'qa-female-%'
union all
select 'qa_rich_matches' as check_name, count(*)::integer as total
from public.matches
where id like 'qa-rich-match-%'
union all
select 'qa_rich_messages' as check_name, count(*)::integer as total
from public.messages
where id like 'qa-rich-msg-%'
union all
select 'qa_rich_blocked' as check_name, count(*)::integer as total
from public.interactions
where id = 'qa-rich-block-01' and action = 'block'
union all
select 'qa_rich_push_tokens' as check_name, count(*)::integer as total
from public.push_tokens
where id in ('qa-rich-push-male-01', 'qa-rich-push-female-01');
