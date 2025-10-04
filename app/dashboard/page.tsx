import { MainHeader } from "./components/components"
import { auth } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { BrandForm } from "./components/brand-form";

export default function Dashboard() {
  const { userId } = auth();
  
  if (!userId) {
    redirect("/auth/signin");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <MainHeader />
      <main className="pt-24 px-4">
        <div className="max-w-7xl mx-auto">
          <BrandForm />
        </div>
      </main>
    </div>
  )
}
