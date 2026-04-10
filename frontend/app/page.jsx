import LandingClient from "./LandingClient";

export const revalidate = 3600;

export const metadata = {
  title: "NoteSwap — India's #1 Student Notes Sharing Platform",
  description:
    "Access thousands of verified student notes organised by subject, unit and semester. Upload your notes and help fellow students ace their exams. 100% free forever.",
  keywords:
    "student notes, college notes, AKTU notes, engineering notes, India, free notes, study material",
  openGraph: {
    title: "NoteSwap — Study Smarter Together",
    description: "India's leading verified student notes platform. Free forever.",
    type: "website",
  },
};

// async function getSubjectsData() {
//   try {
//     const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000" || process.env.API_URL;
//     const controller = new AbortController();
//     const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout — Render free tier sleeps
//     const res = await fetch(`${baseUrl}/api/subjects`, {
//       next: { revalidate: 3600 },
//       signal: controller.signal,
//     });
//     clearTimeout(timeoutId);
//     if (!res.ok) return [];
//     const data = await res.json();
//     return data.data || [];
//   } catch {
//     return []; // Falls back to hardcoded subjects in LandingClient
//   }
// }


async function getSubjectsData() {
  try {
    // ✅ Use API_URL for server side — works both locally and in production
    const baseUrl = process.env.API_URL || 'http://localhost:5000'
    const res = await fetch(`${baseUrl}/api/subjects`, {
      cache: 'no-store'
    })
    if (!res.ok) return []
    const data = await res.json()
    return data.data || []
  } catch (err) {
    console.error('Failed to fetch subjects:', err)
    return []
  }
}

export default async function LandingPage() {
  const subjects = await getSubjectsData();
  return <LandingClient subjects={subjects} />;
}