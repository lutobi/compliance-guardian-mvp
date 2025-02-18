import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex h-16 items-center border-b px-4 md:px-6">
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-semibold">Compliance Guardian</h1>
        </div>
        <div className="ml-auto flex items-center gap-4">
          <Button asChild variant="outline">
            <Link href="/auth/login">Login</Link>
          </Button>
          <Button asChild>
            <Link href="/auth/signup">Sign Up</Link>
          </Button>
        </div>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center gap-4 text-center">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                Simplified Compliance Management
              </h1>
              <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
                Streamline your compliance process with our intuitive platform. Track, manage, and report on your compliance status with ease.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4">
                <Button asChild size="lg">
                  <Link href="/auth/signup">Get Started</Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link href="/frameworks">View Frameworks</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
