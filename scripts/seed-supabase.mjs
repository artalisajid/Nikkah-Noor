import fs from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

function loadEnvFile(file) {
  const fullPath = path.resolve(process.cwd(), file);
  if (!fs.existsSync(fullPath)) return;

  for (const line of fs.readFileSync(fullPath, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) continue;
    const [key, ...valueParts] = trimmed.split("=");
    if (!process.env[key]) {
      process.env[key] = valueParts.join("=").replace(/^["']|["']$/g, "");
    }
  }
}

loadEnvFile(".env");
loadEnvFile(".env.local");

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const publishableKey =
  process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !publishableKey) {
  console.error("Missing EXPO_PUBLIC_SUPABASE_URL or EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY.");
  console.error("Create .env.local from .env.example, run supabase/schema.sql, then rerun this script.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, publishableKey);

const profiles = [
  ["user-ahmed-raza", "@ahmed.karachi", "Ahmed Raza", 38, "male", "Karachi", "Divorced", "Business Owner"],
  ["user-fatima-khan", "@fatima.teacher", "Fatima Khan", 32, "female", "Karachi", "Widow", "School Teacher"],
  ["user-sana-ali", "@sana.lahore", "Sana Ali", 31, "female", "Lahore", "Divorced", "Doctor"],
  ["user-maryam-siddiqui", "@maryam.isb", "Maryam Siddiqui", 40, "female", "Islamabad", "Widow", "Business Owner"],
  ["user-ayesha-noor", "@ayesha.noor", "Ayesha Noor", 35, "female", "Karachi", "Divorced", "Lecturer"],
  ["user-hamza-qureshi", "@hamza.lahore", "Hamza Qureshi", 42, "male", "Lahore", "Widower", "Engineer"],
  ["user-bilal-hassan", "@bilal.isb", "Bilal Hassan", 36, "male", "Islamabad", "Divorced", "Civil Servant"],
  ["user-zainab-saleem", "@zainab.saleem", "Zainab Saleem", 29, "female", "Multan", "Divorced", "Designer"],
  ["user-usman-farooq", "@usman.farooq", "Usman Farooq", 45, "male", "Karachi", "Currently married", "Trader"],
  ["user-nadia-rahman", "@nadia.rahman", "Nadia Rahman", 37, "female", "Peshawar", "Widow", "Homemaker"],
].map(([id, handle, full_name, age, gender, city, marital_status, profession], index) => ({
  id,
  handle,
  email: `${id.replace("user-", "")}@nikkah-noor.test`,
  full_name,
  age,
  gender,
  city,
  country: "Pakistan",
  phone: `30${index} 000000${index}`,
  marital_status,
  profession,
  education: index % 2 === 0 ? "Bachelor's" : "Master's",
  living_situation: index % 2 === 0 ? "Own house" : "With family",
  children: index % 3 === 0 ? "2 children" : "No children",
  sect: "Sunni",
  prayer: index % 2 === 0 ? "Regular prayer" : "5 times daily",
  quran: "Can recite Quran",
  family_type: "Family involved",
  photo_privacy: "Blur before mutual match",
  photo_url:
    index % 2 === 0
      ? "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80"
      : "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=600&q=80",
  bio: `${full_name} is a seeded test profile for complete Nikkah Noor flow testing.`,
  tags: ["Verified", marital_status, city],
  verification: ["ID", "Family"],
  preferences: { ageMin: "28", ageMax: "45", location: "Same city" },
  stats: { views: 100 + index, likes: index, matches: 0, completion: 80 },
  compatibility: 70 + index,
}));

const matches = [
  {
    id: "match-ayesha",
    user_id: "user-ahmed-raza",
    matched_user_id: "user-ayesha-noor",
    unread: 2,
  },
  {
    id: "match-sana",
    user_id: "user-ahmed-raza",
    matched_user_id: "user-sana-ali",
    unread: 0,
  },
];

const messages = [
  {
    id: "msg-seed-1",
    conversation_id: "match-ayesha",
    sender_id: "user-ayesha-noor",
    receiver_id: "user-ahmed-raza",
    body: "السلام علیکم. Thank you for connecting.",
    time_label: "10:12 AM",
  },
  {
    id: "msg-seed-2",
    conversation_id: "match-ayesha",
    sender_id: "user-ahmed-raza",
    receiver_id: "user-ayesha-noor",
    body: "Wa Alaikum Assalam. Family involvement is important to me.",
    time_label: "10:14 AM · Read",
  },
];

async function upsert(table, rows) {
  const { error } = await supabase.from(table).upsert(rows);
  if (error) throw new Error(`${table}: ${error.message}`);
  console.log(`Seeded ${rows.length} ${table}`);
}

await upsert("profiles", profiles);
await upsert("matches", matches);
await upsert("messages", messages);

console.log("Supabase seed complete: 10 profiles plus starter matches/messages.");
