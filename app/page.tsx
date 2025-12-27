import Link from "next/link";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-900 text-white">
      <h1 className="mb-8 text-4xl font-bold">Potree Viewer</h1>
      <p className="mb-8 text-gray-400"></p>
      <Link
        href="/demo"
        className="rounded-lg bg-blue-600 px-6 py-3 text-lg font-medium hover:bg-blue-700 transition-colors"
      >
        Open Demo
      </Link>
    </div>
  );
}
