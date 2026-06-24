-- Reusable QA personas for end-to-end browser and mobile testing.
-- These are app profile records, not Supabase Auth email inboxes.

insert into public.profiles (
  id,
  handle,
  email,
  full_name,
  age,
  gender,
  city,
  country,
  marital_status,
  profession,
  education,
  living_situation,
  children,
  income_range,
  sect,
  prayer,
  quran,
  family_type,
  photo_privacy,
  photo_url,
  bio,
  tags,
  verification,
  preferences,
  stats,
  compatibility,
  updated_at
)
values
  (
    'qa-omar-divorced',
    '@qa.omar',
    'qa.omar@nikkah-noor.test',
    'Omar Siddiqui',
    39,
    'male',
    'Karachi',
    'Pakistan',
    'Divorced',
    'Product Manager',
    'Master''s',
    'Separate residence',
    '1 child',
    'Rs. 2,00,000+',
    'Sunni',
    '5 times daily',
    'Can recite Quran',
    'Family involved',
    'Blur before mutual match',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=900&q=80',
    'QA profile for testing email auth, editable profile fields, matching, chat, reports, and notifications.',
    '["QA", "Divorced", "Karachi"]'::jsonb,
    '["ID", "Family"]'::jsonb,
    '{"ageMin":"28","ageMax":"45","location":"Anywhere in Pakistan","maritalStatus":"Any"}'::jsonb,
    '{"views":12,"likes":3,"matches":1,"completion":90}'::jsonb,
    91,
    now()
  ),
  (
    'qa-aisha-widow',
    '@qa.aisha',
    'qa.aisha@nikkah-noor.test',
    'Aisha Rahman',
    34,
    'female',
    'Karachi',
    'Pakistan',
    'Widow',
    'Teacher',
    'Master''s in Education',
    'With family',
    '2 children',
    null,
    'Sunni',
    'Regular prayer',
    'Can recite with Tajweed',
    'Joint family',
    'Show to verified profiles only',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=900&q=80',
    'QA profile for testing widow flow, family involvement, privacy controls, chat, and notification delivery.',
    '["QA", "Widow", "Family verified"]'::jsonb,
    '["ID", "Family"]'::jsonb,
    '{"ageMin":"35","ageMax":"48","location":"Same city","maritalStatus":"Divorced"}'::jsonb,
    '{"views":18,"likes":4,"matches":1,"completion":92}'::jsonb,
    88,
    now()
  ),
  (
    'qa-sara-divorced',
    '@qa.sara',
    'qa.sara@nikkah-noor.test',
    'Sara Ahmed',
    31,
    'female',
    'Lahore',
    'Pakistan',
    'Divorced',
    'Doctor',
    'MBBS',
    'With parents',
    'No children',
    null,
    'Sunni',
    '5 times daily',
    'Can recite Quran',
    'Nuclear family',
    'Show after mutual match',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=900&q=80',
    'QA profile for testing cross-city preferences, profile image privacy, reports, and chat edge cases.',
    '["QA", "Divorced", "Lahore"]'::jsonb,
    '["ID", "Professional"]'::jsonb,
    '{"ageMin":"34","ageMax":"46","location":"Anywhere in Pakistan","maritalStatus":"Any"}'::jsonb,
    '{"views":15,"likes":2,"matches":1,"completion":87}'::jsonb,
    84,
    now()
  )
on conflict (id) do update set
  handle = excluded.handle,
  email = excluded.email,
  full_name = excluded.full_name,
  age = excluded.age,
  gender = excluded.gender,
  city = excluded.city,
  country = excluded.country,
  marital_status = excluded.marital_status,
  profession = excluded.profession,
  education = excluded.education,
  living_situation = excluded.living_situation,
  children = excluded.children,
  income_range = excluded.income_range,
  sect = excluded.sect,
  prayer = excluded.prayer,
  quran = excluded.quran,
  family_type = excluded.family_type,
  photo_privacy = excluded.photo_privacy,
  photo_url = excluded.photo_url,
  bio = excluded.bio,
  tags = excluded.tags,
  verification = excluded.verification,
  preferences = excluded.preferences,
  stats = excluded.stats,
  compatibility = excluded.compatibility,
  updated_at = now();

insert into public.profile_private (
  id,
  email,
  phone,
  first_wife_consent,
  planned_arrangement,
  updated_at
)
values
  ('qa-omar-divorced', 'qa.omar@nikkah-noor.test', '+92 300 1111111', false, '', now()),
  ('qa-aisha-widow', 'qa.aisha@nikkah-noor.test', '+92 300 2222222', false, '', now()),
  ('qa-sara-divorced', 'qa.sara@nikkah-noor.test', '+92 300 3333333', false, '', now())
on conflict (id) do update set
  email = excluded.email,
  phone = excluded.phone,
  first_wife_consent = excluded.first_wife_consent,
  planned_arrangement = excluded.planned_arrangement,
  updated_at = now();

insert into public.matches (id, user_id, matched_user_id, unread, matched_at)
values
  ('qa-match-omar-aisha', 'qa-omar-divorced', 'qa-aisha-widow', 1, now()),
  ('qa-match-aisha-omar', 'qa-aisha-widow', 'qa-omar-divorced', 0, now()),
  ('qa-match-sara-omar', 'qa-sara-divorced', 'qa-omar-divorced', 0, now())
on conflict (id) do update set
  user_id = excluded.user_id,
  matched_user_id = excluded.matched_user_id,
  unread = excluded.unread,
  matched_at = excluded.matched_at;

insert into public.messages (id, conversation_id, sender_id, receiver_id, body, time_label, created_at)
values
  (
    'qa-msg-aisha-1',
    'qa-match-omar-aisha',
    'qa-aisha-widow',
    'qa-omar-divorced',
    'As-salamu Alaykum. This seeded message tests received chat state.',
    'Now',
    now()
  ),
  (
    'qa-msg-omar-1',
    'qa-match-aisha-omar',
    'qa-omar-divorced',
    'qa-aisha-widow',
    'Wa Alaikum Assalam. This seeded message tests sent chat state.',
    'Now · Sent',
    now()
  )
on conflict (id) do update set
  conversation_id = excluded.conversation_id,
  sender_id = excluded.sender_id,
  receiver_id = excluded.receiver_id,
  body = excluded.body,
  time_label = excluded.time_label,
  created_at = excluded.created_at;

insert into public.notifications (id, user_id, type, title, time_label, read, created_at)
values
  ('qa-note-omar-message', 'qa-omar-divorced', 'message', 'Aisha sent you a seeded QA message', 'Now', false, now()),
  ('qa-note-aisha-system', 'qa-aisha-widow', 'system', 'QA account ready for profile and chat testing', 'Now', false, now()),
  ('qa-note-sara-activity', 'qa-sara-divorced', 'activity', 'QA account ready for notification testing', 'Now', false, now())
on conflict (id) do update set
  user_id = excluded.user_id,
  type = excluded.type,
  title = excluded.title,
  time_label = excluded.time_label,
  read = excluded.read,
  created_at = excluded.created_at;

insert into public.push_tokens (id, user_id, token, platform, device_name, enabled, updated_at)
values
  ('qa-push-omar-android', 'qa-omar-divorced', 'ExpoPushToken[qaOmarAndroidToken]', 'android', 'QA Android', true, now()),
  ('qa-push-aisha-ios', 'qa-aisha-widow', 'ExpoPushToken[qaAishaIosToken]', 'ios', 'QA iPhone', true, now())
on conflict (id) do update set
  token = excluded.token,
  platform = excluded.platform,
  device_name = excluded.device_name,
  enabled = excluded.enabled,
  updated_at = now();
