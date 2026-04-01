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

async function getSubjectsData() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";
    const res = await fetch(`${baseUrl}/api/subjects`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.data || [];
  } catch {
    return [];
  }
}

export default async function LandingPage() {
  const subjects = await getSubjectsData();
  return <LandingClient subjects={subjects} />;
}