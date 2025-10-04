"use client";

import { useSignUp } from "@clerk/nextjs";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const SignUpPage = () => {
  const { isLoaded, signUp, setActive } = useSignUp();
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [pendingVerification, setPendingVerification] = useState(false);
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded) return;

    try {
      setIsLoading(true);
      setError("");

      const result = await signUp.create({
        emailAddress: email,
        password,
        firstName,
        lastName,
      });

      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      setPendingVerification(true);
    } catch (err: any) {
      console.error("Error: ", err);
      setError(err.errors?.[0]?.message || "An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const onPressVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded) return;

    try {
      setIsLoading(true);
      setError("");

      const result = await signUp.attemptEmailAddressVerification({
        code,
      });

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        router.push("/dashboard"); // Redirect to dashboard
      } else {
        console.log("Verification Result: ", result);
        setError("Something went wrong. Please try again.");
      }
    } catch (err: any) {
      console.error("Error: ", err);
      setError(err.errors?.[0]?.message || "An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isLoaded) {
    return null;
  }

  return (
    <div className="min-h-screen flex font-sans">
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-[#EEEEEE] dark:bg-[#EEEEEE]">
        <div className="relative z-10 flex flex-col justify-between w-full px-12 py-12">
          <div className="flex-1 flex flex-col justify-center">
            <h2 className="text-5xl text-black dark:text-black mb-6 leading-tight">See your brand mentioned on internet</h2>
            <p className="text-black/90 dark:text-black/90 text-lg leading-relaxed">
              Sign up to mention your brand across social media.
            </p>
          </div>

          <div className="flex justify-between items-center text-black/70 dark:text-black/70 text-sm">
            <span>Copyright © 2025 Searches.</span>
            <span className="cursor-pointer hover:text-black/90">Privacy Policy</span>
          </div>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white dark:bg-white">
        <div className="w-full max-w-md space-y-8">
          <div className="space-y-6">
            <div className="space-y-2 text-center">
              <h2 className="text-3xl text-black dark:text-black">Create an Account</h2>
              <p className="text-muted-foreground">
                Enter your information to create a new account.
              </p>
            </div>

            {!pendingVerification ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="p-3 text-sm text-red-500 bg-red-50 rounded-lg">
                    {error}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName" className="text-sm font-medium text-black dark:text-black">
                      First Name
                    </Label>
                    <Input
                      id="firstName"
                      type="text"
                      placeholder="John"
                      className="h-12 border-gray-200 focus:ring-0 shadow-none rounded-lg bg-white dark:bg-white text-black dark:text-black focus:border-[#3F3FF3] [&:-webkit-autofill]:shadow-[inset_0_0_0px_1000px_white] [&:-webkit-autofill]:[-webkit-text-fill-color:black]"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName" className="text-sm font-medium text-black dark:text-black">
                      Last Name
                    </Label>
                    <Input
                      id="lastName"
                      type="text"
                      placeholder="Doe"
                      className="h-12 border-gray-200 focus:ring-0 shadow-none rounded-lg bg-white dark:bg-white text-black dark:text-black focus:border-[#3F3FF3] [&:-webkit-autofill]:shadow-[inset_0_0_0px_1000px_white] [&:-webkit-autofill]:[-webkit-text-fill-color:black]"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-black dark:text-black">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="user@company.com"
                    className="h-12 border-gray-200 focus:ring-0 shadow-none rounded-lg bg-white dark:bg-white text-black dark:text-black focus:border-[#3F3FF3] [&:-webkit-autofill]:shadow-[inset_0_0_0px_1000px_white] [&:-webkit-autofill]:[-webkit-text-fill-color:black]"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium text-black dark:text-black">
                    Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Create a password"
                      className="h-12 pr-10 border-gray-200 focus:ring-0 shadow-none rounded-lg bg-white dark:bg-white text-black dark:text-black focus:border-[#3F3FF3] [&:-webkit-autofill]:shadow-[inset_0_0_0px_1000px_white] [&:-webkit-autofill]:[-webkit-text-fill-color:black]"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent cursor-pointer"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 text-sm font-medium text-white hover:opacity-90 rounded-lg shadow-none cursor-pointer mt-4"
                  style={{ backgroundColor: "#388E3C" }}
                  disabled={isLoading}
                >
                  {isLoading ? "Creating Account..." : "Create Account"}
                </Button>

                <div className="text-center text-sm text-muted-foreground">
                  Already have an account?{" "}
                  <Link
                    href="/auth/signin"
                    className="p-0 h-auto text-sm hover:text-opacity-80 font-medium cursor-pointer"
                    style={{ color: "#000000" }}
                  >
                    Sign In
                  </Link>
                </div>
              </form>
            ) : (
              <form onSubmit={onPressVerify} className="space-y-4">
                {error && (
                  <div className="p-3 text-sm text-red-500 bg-red-50 rounded-lg">
                    {error}
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="code" className="text-sm font-medium text-black dark:text-black">
                    Verification Code
                  </Label>
                  <Input
                    id="code"
                    type="text"
                    placeholder="Enter verification code"
                    className="h-12 border-gray-200 focus:ring-0 shadow-none rounded-lg bg-white dark:bg-white text-black dark:text-black focus:border-[#3F3FF3] [&:-webkit-autofill]:shadow-[inset_0_0_0px_1000px_white] [&:-webkit-autofill]:[-webkit-text-fill-color:black]"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    required
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 text-sm font-medium text-white hover:opacity-90 rounded-lg shadow-none cursor-pointer mt-4"
                  style={{ backgroundColor: "#388E3C" }}
                  disabled={isLoading}
                >
                  {isLoading ? "Verifying..." : "Verify Email"}
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;