import Link from "next/link";
import { Button } from "@/components/ui/button";

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
        <section className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-4">Simplified Compliance Management</h2>
          <p className="text-gray-600 mb-8 text-lg">
            Streamline your compliance process with our intuitive platform.
          </p>
          <div className="space-x-4">
            <Button asChild>
              <Link href="/auth/signup">Get Started</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/frameworks">View Frameworks</Link>
            </Button>
          </div>
        </section>
      </main>
    </div>
  );
}
