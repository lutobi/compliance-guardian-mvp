import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="p-4 border-b">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">Compliance Guardian</h1>
          <nav className="flex space-x-4">
            <Link href="/auth/login" className="text-blue-600 hover:underline font-medium">Login</Link>
            <Link href="/auth/signup" className="text-blue-600 hover:underline font-medium">Sign Up</Link>
          </nav>
        </div>
      </header>
      
      <main className="flex-grow flex items-center">
        <div className="container mx-auto px-4 py-16">
          <section className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl sm:text-5xl font-bold mb-6">Simplified Compliance Management</h2>
            <p className="text-gray-600 mb-8 text-lg max-w-2xl mx-auto">
              Streamline your compliance process with our intuitive platform. Monitor, manage, and maintain compliance with ease.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button size="lg" asChild>
                <Link href="/auth/signup">Get Started</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/auth/login">Login</Link>
              </Button>
            </div>
          </section>
        </div>
      </main>
      
      <footer className="bg-gray-50 border-t py-8">
        <div className="container mx-auto px-4 text-center text-gray-500">
          <p>© 2025 Compliance Guardian. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
