import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center space-y-6 p-8">
        <div className="flex justify-center mb-4">
          <Image
            src="/images/logo.png"
            alt="UR Services Logo"
            width={200}
            height={200}
            className="object-contain"
            priority
          />
        </div>
        <h1 className="text-5xl font-bold text-gray-900">
          UR Services
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl">
          Multi-tenant customer communication platform. Connect with your customers in real-time.
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/register">
            <Button size="lg">Get Started</Button>
          </Link>
          <Link href="/login">
            <Button variant="outline" size="lg">Login</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
