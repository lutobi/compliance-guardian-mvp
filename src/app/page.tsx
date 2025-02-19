import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen p-8">
      <header className="mb-8">
        <h1 className="text-2xl font-bold">Compliance Guardian</h1>
        <nav className="mt-4">
          <Link href="/auth/login" className="mr-4 text-blue-600 hover:underline">Login</Link>
          <Link href="/auth/signup" className="text-blue-600 hover:underline">Sign Up</Link>
        </nav>
      </header>
      <main>
        <h2 className="text-4xl font-bold mb-4">Simplified Compliance Management</h2>
        <p className="text-gray-600 mb-8 max-w-2xl">
          Streamline your compliance process with our intuitive platform.
        </p>
        <div>
          <Link href="/auth/signup" className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg mr-4 hover:bg-blue-700">
            Get Started
          </Link>
          <Link href="/frameworks" className="inline-block border border-blue-600 text-blue-600 px-6 py-2 rounded-lg hover:bg-blue-50">
            View Frameworks
          </Link>
        </div>
      </main>
    </div>
  );
}
