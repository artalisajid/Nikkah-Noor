select 'qa_profiles' as check_name, count(*)::integer as total
from public.profiles
where id in ('qa-omar-divorced', 'qa-aisha-widow', 'qa-sara-divorced')
union all
select 'qa_matches' as check_name, count(*)::integer as total
from public.matches
where id in ('qa-match-omar-aisha', 'qa-match-aisha-omar', 'qa-match-sara-omar')
union all
select 'qa_messages' as check_name, count(*)::integer as total
from public.messages
where id in ('qa-msg-aisha-1', 'qa-msg-omar-1')
union all
select 'qa_push_tokens' as check_name, count(*)::integer as total
from public.push_tokens
where id in ('qa-push-omar-android', 'qa-push-aisha-ios');
