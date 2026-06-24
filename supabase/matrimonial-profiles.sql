-- 20 richer QA profiles: 10 male and 10 female, each with a distinct matrimonial goal.

with seeded_profiles (
  id,
  handle,
  full_name,
  age,
  gender,
  city,
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
  matrimonial_goal,
  preferred_goal,
  preferred_location,
  preferred_status,
  open_to_children,
  bio,
  tags,
  verification,
  compatibility
) as (
  values
    ('qa-male-01', '@qa.adnan', 'Adnan Malik', 41, 'male', 'Karachi', 'Widower', 'Bank Manager', 'MBA', 'Own house', '2 children', 'Rs. 2,00,000+', 'Sunni', '5 times daily', 'Can recite Quran', 'Family involved', 'Blur before mutual match', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=900&q=80', 'Widow/widower with children welcome', 'Widow/widower with children welcome', 'Same city', 'Widow', true, 'A widower seeking a kind partner who understands children, family review, and a calm second marriage.', array['Widower','Children welcome','Karachi'], array['ID','Family'], 92),
    ('qa-male-02', '@qa.saif', 'Saif Rahman', 34, 'male', 'Lahore', 'Divorced', 'Software Engineer', 'BS Computer Science', 'Rented', 'No children', 'Rs. 1,00,000-2,00,000', 'Sunni', 'Regular prayer', 'Can recite Quran', 'Nuclear family', 'Show after mutual match', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=900&q=80', 'Fresh start after divorce', 'Fresh start after divorce', 'Same province', 'Divorced', false, 'Divorced with no children, seeking a respectful fresh start with clear communication and family involvement.', array['Divorced','Fresh start','Lahore'], array['ID'], 86),
    ('qa-male-03', '@qa.usman.second', 'Usman Farid', 46, 'male', 'Karachi', 'Currently married', 'Trader', 'Bachelor''s', 'Separate residence', '4 children', 'Rs. 2,00,000+', 'Sunni', 'Regular prayer', 'Can recite Quran', 'Family involved', 'Show to verified profiles only', 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=900&q=80', 'Open to second wife arrangement', 'Open to second wife arrangement', 'Same city', 'Divorced', true, 'Seeking a second wife within Islamic guidelines, declared consent, fair support, and separate residence.', array['Second marriage','Consent declared','Separate residence'], array['ID','Professional'], 78),
    ('qa-male-04', '@qa.hamid.overseas', 'Hamid Javed', 39, 'male', 'Islamabad', 'Divorced', 'Consultant', 'Master''s', 'Own house', 'No children', 'Rs. 2,00,000+', 'Sunni', 'Regular prayer', 'Can recite with Tajweed', 'Nuclear family', 'Blur before mutual match', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=900&q=80', 'Overseas relocation possible', 'Overseas relocation possible', 'Open to overseas Pakistanis', 'Any', false, 'Works between Islamabad and Dubai, seeking someone open to overseas relocation after family meetings.', array['Overseas','Relocation','Divorced'], array['ID','Professional'], 84),
    ('qa-male-05', '@qa.rizwan.family', 'Rizwan Shah', 44, 'male', 'Peshawar', 'Widower', 'School Principal', 'Master''s in Education', 'Own house', '3 children', 'Rs. 1,00,000-2,00,000', 'Sunni', '5 times daily', 'Can recite Quran', 'Joint family', 'Show after mutual match', 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=900&q=80', 'Companionship with family involvement', 'Companionship with family involvement', 'Anywhere in Pakistan', 'Widow', true, 'A family-first widower seeking companionship with elders involved from the beginning.', array['Widower','Principal','Family involvement'], array['ID','Family'], 88),
    ('qa-male-06', '@qa.talha.simple', 'Talha Siddiq', 32, 'male', 'Multan', 'Divorced', 'Accountant', 'ACCA', 'With parents', 'No children', 'Rs. 50,000-1,00,000', 'Sunni', '5 times daily', 'Can recite with Tajweed', 'Joint family', 'Blur before mutual match', 'https://images.unsplash.com/photo-1531891437562-4301cf35b7e4?auto=format&fit=crop&w=900&q=80', 'Religious household and simple Nikah', 'Religious household and simple Nikah', 'Same province', 'Divorced', false, 'Seeking a religious household, simple Nikah, and modest family-centered lifestyle.', array['Religious','Simple Nikah','Multan'], array['ID'], 90),
    ('qa-male-07', '@qa.noman.support', 'Noman Ali', 37, 'male', 'Faisalabad', 'Divorced', 'Textile Business', 'Bachelor''s', 'Own house', '1 child', 'Rs. 2,00,000+', 'Sunni', 'Regular prayer', 'Can recite Quran', 'Nuclear family', 'Show to verified profiles only', 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?auto=format&fit=crop&w=900&q=80', 'Career-supportive partnership', 'Career-supportive partnership', 'Same province', 'Either', true, 'Seeking a mature partner who values business, education, and shared family responsibilities.', array['Business','Career supportive','Father'], array['Professional'], 81),
    ('qa-male-08', '@qa.farhan.home', 'Farhan Qureshi', 40, 'male', 'Quetta', 'Divorced', 'Civil Engineer', 'Bachelor''s in Engineering', 'Separate residence', 'No children', 'Rs. 1,00,000-2,00,000', 'Sunni', 'Occasional', 'Learning', 'Nuclear family', 'Show after mutual match', 'https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?auto=format&fit=crop&w=900&q=80', 'Separate residence after Nikah', 'Separate residence after Nikah', 'Anywhere in Pakistan', 'Any', false, 'Looking for a calm marriage with separate residence and respectful family boundaries.', array['Separate residence','Engineer','Divorced'], array['ID','Professional'], 79),
    ('qa-male-09', '@qa.muneeb.soon', 'Muneeb Akhtar', 35, 'male', 'Hyderabad', 'Divorced', 'Doctor', 'MBBS', 'With family', 'No children', 'Rs. 2,00,000+', 'Sunni', '5 times daily', 'Can recite Quran', 'Family involved', 'Blur before mutual match', 'https://images.unsplash.com/photo-1615109398623-88346a601842?auto=format&fit=crop&w=900&q=80', 'Religious household and simple Nikah', 'Religious household and simple Nikah', 'Same province', 'Either', false, 'Ready for a simple Nikah after family due diligence and compatibility discussions.', array['Doctor','Simple Nikah','Verified'], array['ID','Professional','Family'], 93),
    ('qa-male-10', '@qa.kamran.guardian', 'Kamran Hussain', 48, 'male', 'Rawalpindi', 'Widower', 'Government Officer', 'Master''s', 'Own house', '2 children', 'Rs. 1,00,000-2,00,000', 'Sunni', 'Regular prayer', 'Can recite Quran', 'Family involved', 'Family viewing only', 'https://images.unsplash.com/photo-1564564321837-a57b7070ac4f?auto=format&fit=crop&w=900&q=80', 'Companionship with family involvement', 'Companionship with family involvement', 'Same province', 'Widow', true, 'Seeking dignified companionship, wali involvement, and clarity for children on both sides.', array['Widower','Guardian involved','Rawalpindi'], array['ID','Family'], 87),
    ('qa-female-01', '@qa.mehreen', 'Mehreen Ahmed', 36, 'female', 'Karachi', 'Widow', 'Teacher', 'Master''s in Education', 'With family', '2 children', null, 'Sunni', 'Regular prayer', 'Can recite Quran', 'Family involved', 'Show to verified profiles only', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=900&q=80', 'Widow/widower with children welcome', 'Widow/widower with children welcome', 'Same city', 'Widower', true, 'A widow and mother seeking a responsible widower who welcomes children and family review.', array['Widow','Children','Teacher'], array['ID','Family'], 94),
    ('qa-female-02', '@qa.hira.fresh', 'Hira Saleem', 30, 'female', 'Lahore', 'Divorced', 'UX Designer', 'Bachelor''s', 'With parents', 'No children', null, 'Sunni', 'Regular prayer', 'Learning', 'Nuclear family', 'Show after mutual match', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=900&q=80', 'Fresh start after divorce', 'Fresh start after divorce', 'Same province', 'Divorced', false, 'Divorced with no children, seeking a kind partner and a fresh start with patience.', array['Divorced','Fresh start','Designer'], array['ID'], 85),
    ('qa-female-03', '@qa.nadia.overseas', 'Nadia Tariq', 33, 'female', 'Islamabad', 'Widow', 'Business Analyst', 'MBA', 'Own house', '1 child', null, 'Sunni', 'Regular prayer', 'Can recite Quran', 'Nuclear family', 'Blur before mutual match', 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=900&q=80', 'Overseas relocation possible', 'Overseas relocation possible', 'Open to overseas Pakistanis', 'Any', true, 'Open to overseas relocation if family compatibility and child stability are respected.', array['Overseas','Widow','One child'], array['ID','Professional'], 89),
    ('qa-female-04', '@qa.sana.career', 'Sana Rauf', 32, 'female', 'Faisalabad', 'Divorced', 'Doctor', 'MBBS', 'With family', 'No children', null, 'Sunni', '5 times daily', 'Can recite Quran', 'Family involved', 'Show to verified profiles only', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=900&q=80', 'Career-supportive partnership', 'Career-supportive partnership', 'Same province', 'Either', false, 'Seeking a partner who supports her medical career and values family-led decisions.', array['Doctor','Career supportive','Divorced'], array['ID','Professional'], 91),
    ('qa-female-05', '@qa.rabia.companion', 'Rabia Noor', 45, 'female', 'Peshawar', 'Widow', 'Homemaker', 'Intermediate', 'With family', '3 children', null, 'Sunni', '5 times daily', 'Can recite Quran', 'Joint family', 'Family viewing only', 'https://images.unsplash.com/photo-1499952127939-9bbf5af6c51c?auto=format&fit=crop&w=900&q=80', 'Companionship with family involvement', 'Companionship with family involvement', 'Anywhere in Pakistan', 'Widower', true, 'Seeking mature companionship, elder involvement, and emotional responsibility.', array['Widow','Family','Companionship'], array['Family'], 82),
    ('qa-female-06', '@qa.ayesha.children', 'Ayesha Tariq', 29, 'female', 'Multan', 'Divorced', 'Lecturer', 'MPhil', 'With parents', 'No children', null, 'Sunni', 'Regular prayer', 'Can recite Quran', 'Family involved', 'Show after mutual match', 'https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?auto=format&fit=crop&w=900&q=80', 'Fresh start after divorce', 'Fresh start after divorce', 'Same province', 'Divorced', false, 'Would like children in the future and wants a patient, educated partner.', array['Lecturer','Wants children','Divorced'], array['ID','Family'], 86),
    ('qa-female-07', '@qa.zainab.second', 'Zainab Iqbal', 35, 'female', 'Karachi', 'Divorced', 'Boutique Owner', 'Bachelor''s', 'Own house', 'No children', null, 'Sunni', 'Regular prayer', 'Can recite Quran', 'Family involved', 'Show to verified profiles only', 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80', 'Open to second wife arrangement', 'Open to second wife arrangement', 'Same city', 'Currently married', false, 'Open to a declared second-wife arrangement only with consent, fairness, and separate residence.', array['Second wife arrangement','Consent required','Karachi'], array['ID','Family'], 80),
    ('qa-female-08', '@qa.maryam.home', 'Maryam Siddiqui', 38, 'female', 'Quetta', 'Widow', 'Small Business Owner', 'Bachelor''s', 'Own house', '1 child', null, 'Sunni', 'Occasional', 'Learning', 'Nuclear family', 'Blur before mutual match', 'https://images.unsplash.com/photo-1520813792240-56fc4a3765a7?auto=format&fit=crop&w=900&q=80', 'Separate residence after Nikah', 'Separate residence after Nikah', 'Anywhere in Pakistan', 'Any', true, 'Prefers separate residence and a partner who respects her business and child.', array['Business','Separate residence','Widow'], array['Professional'], 78),
    ('qa-female-09', '@qa.fatima.education', 'Fatima Khan', 34, 'female', 'Hyderabad', 'Divorced', 'School Coordinator', 'Master''s', 'With family', '1 child', null, 'Sunni', '5 times daily', 'Can recite with Tajweed', 'Family involved', 'Show after mutual match', 'https://images.unsplash.com/photo-1512316609839-ce289d3eba0a?auto=format&fit=crop&w=900&q=80', 'Career-supportive partnership', 'Career-supportive partnership', 'Same province', 'Either', true, 'Values education, a kind role model for her child, and thoughtful communication.', array['Education','One child','Verified'], array['ID','Family','Professional'], 90),
    ('qa-female-10', '@qa.safiya.simple', 'Safiya Bano', 42, 'female', 'Rawalpindi', 'Widow', 'Quran Teacher', 'Dars-e-Nizami', 'With family', '2 children', null, 'Sunni', '5 times daily', 'Can recite with Tajweed', 'Family involved', 'Family viewing only', 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=900&q=80', 'Religious household and simple Nikah', 'Religious household and simple Nikah', 'Same province', 'Widower', true, 'Seeking a religious household, simple Nikah, and respectful guardian involvement.', array['Quran teacher','Simple Nikah','Widow'], array['ID','Family'], 95)
)
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
  first_wife_consent,
  planned_arrangement,
  updated_at
)
select
  id,
  handle,
  replace(id, 'qa-', '') || '@nikkah-noor.test',
  full_name,
  age,
  gender,
  city,
  'Pakistan',
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
  to_jsonb(tags),
  to_jsonb(verification),
  jsonb_build_object(
    'ageMin', case when gender = 'male' then '28' else '34' end,
    'ageMax', case when gender = 'male' then '46' else '50' end,
    'location', preferred_location,
    'maritalStatus', preferred_status,
    'openToChildren', open_to_children,
    'matrimonialGoal', preferred_goal,
    'prayerImportant', prayer in ('5 times daily', 'Regular prayer'),
    'familyInvolvement', family_type = 'Family involved'
  ),
  jsonb_build_object('views', 20 + compatibility, 'likes', compatibility % 9, 'matches', 0, 'completion', 88),
  compatibility,
  marital_status = 'Currently married',
  case when marital_status = 'Currently married' then 'Consent declared, fair support, and separate residence.' else '' end,
  now()
from seeded_profiles
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
  first_wife_consent = excluded.first_wife_consent,
  planned_arrangement = excluded.planned_arrangement,
  updated_at = now();

insert into public.profile_private (id, email, phone, first_wife_consent, planned_arrangement, updated_at)
select
  id,
  replace(id, 'qa-', '') || '@nikkah-noor.test',
  '+92 300 ' || lpad((row_number() over (order by id))::text, 7, '0'),
  marital_status = 'Currently married',
  case when marital_status = 'Currently married' then 'Consent declared, fair support, and separate residence.' else '' end,
  now()
from public.profiles
where id like 'qa-male-%' or id like 'qa-female-%'
on conflict (id) do update set
  email = excluded.email,
  phone = excluded.phone,
  first_wife_consent = excluded.first_wife_consent,
  planned_arrangement = excluded.planned_arrangement,
  updated_at = now();

insert into public.matches (id, user_id, matched_user_id, unread, matched_at)
values
  ('qa-rich-match-01', 'qa-male-01', 'qa-female-01', 1, now()),
  ('qa-rich-match-02', 'qa-male-03', 'qa-female-07', 0, now()),
  ('qa-rich-match-03', 'qa-male-04', 'qa-female-03', 0, now()),
  ('qa-rich-match-04', 'qa-male-07', 'qa-female-04', 2, now()),
  ('qa-rich-match-05', 'qa-male-10', 'qa-female-10', 0, now()),
  ('qa-rich-match-06', 'qa-female-01', 'qa-male-01', 0, now()),
  ('qa-rich-match-07', 'qa-female-07', 'qa-male-03', 1, now())
on conflict (id) do update set
  user_id = excluded.user_id,
  matched_user_id = excluded.matched_user_id,
  unread = excluded.unread,
  matched_at = excluded.matched_at;

insert into public.messages (id, conversation_id, sender_id, receiver_id, body, time_label, created_at)
values
  ('qa-rich-msg-01', 'qa-rich-match-01', 'qa-female-01', 'qa-male-01', 'As-salamu Alaykum. Family involvement is important to me before moving forward.', 'Now', now()),
  ('qa-rich-msg-02', 'qa-rich-match-01', 'qa-male-01', 'qa-female-01', 'Wa Alaikum Assalam. I agree, and I would like both families to review first.', 'Now · Sent', now()),
  ('qa-rich-msg-03', 'qa-rich-match-04', 'qa-female-04', 'qa-male-07', 'I appreciate that your profile mentions career support and family boundaries.', 'Now', now()),
  ('qa-rich-msg-04', 'qa-rich-match-07', 'qa-male-03', 'qa-female-07', 'Thank you for being clear about consent and separate residence requirements.', 'Now', now())
on conflict (id) do update set
  conversation_id = excluded.conversation_id,
  sender_id = excluded.sender_id,
  receiver_id = excluded.receiver_id,
  body = excluded.body,
  time_label = excluded.time_label,
  created_at = excluded.created_at;

insert into public.interactions (id, actor_id, target_id, action, created_at)
values
  ('qa-rich-pass-01', 'qa-male-01', 'qa-female-02', 'pass', now()),
  ('qa-rich-block-01', 'qa-male-01', 'qa-female-08', 'block', now()),
  ('qa-rich-like-01', 'qa-female-03', 'qa-male-04', 'like', now()),
  ('qa-rich-super-01', 'qa-male-09', 'qa-female-10', 'super_like', now())
on conflict (id) do nothing;

insert into public.notifications (id, user_id, type, title, time_label, read, created_at)
values
  ('qa-rich-note-01', 'qa-male-01', 'message', 'Mehreen sent you a message', 'Now', false, now()),
  ('qa-rich-note-02', 'qa-female-07', 'match', 'You matched with Usman Farid', 'Now', false, now()),
  ('qa-rich-note-03', 'qa-male-01', 'system', 'Blocked profile hidden from discovery', 'Now', false, now())
on conflict (id) do update set
  user_id = excluded.user_id,
  type = excluded.type,
  title = excluded.title,
  time_label = excluded.time_label,
  read = excluded.read,
  created_at = excluded.created_at;

insert into public.push_tokens (id, user_id, token, platform, device_name, enabled, updated_at)
values
  ('qa-rich-push-male-01', 'qa-male-01', 'ExpoPushToken[qaRichMale01Android]', 'android', 'QA Android Male 01', true, now()),
  ('qa-rich-push-female-01', 'qa-female-01', 'ExpoPushToken[qaRichFemale01Ios]', 'ios', 'QA iPhone Female 01', true, now())
on conflict (id) do update set
  token = excluded.token,
  platform = excluded.platform,
  device_name = excluded.device_name,
  enabled = excluded.enabled,
  updated_at = now();
