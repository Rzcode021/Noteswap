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
    // Safely check both common env var names and remove any accidental trailing slashes
    let baseUrl = process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || 'http://localhost:5000';
    if (baseUrl.endsWith('/')) {
      baseUrl = baseUrl.slice(0, -1);
    }

    const targetUrl = `${baseUrl}/api/subjects`;
    console.log('Fetching subjects from:', targetUrl); // Check your production logs for this!

    const res = await fetch(targetUrl, {
      // Use next: { revalidate } instead of cache: 'no-store' so it plays nicely 
      // with your page-level export const revalidate = 3600
      next: { revalidate: 3600 } 
    });

    if (!res.ok) {
      console.error(`Failed to fetch: ${res.status} ${res.statusText}`);
      return [];
    }

    const data = await res.json();
    return data.data || [];
  } catch (err) {
    console.error('Server fetch error:', err);
    return []; // Falls back to hardcoded subjects in LandingClient
  }
}

export default async function LandingPage() {
  const subjects = await getSubjectsData();
  return <LandingClient subjects={subjects} />;
}