"use client"

import * as React from "react"
import { motion, AnimatePresence, MotionConfig, Variants } from "framer-motion"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { useState, useEffect } from "react"
import { 
  Check, 
  ChevronRight, 
  Info, 
  AlertCircle, 
  CheckCircle2,
  ChevronDown,
  LogOut,
  Menu,
  X,
  Search
} from "lucide-react"
import { useClerk, useUser } from "@clerk/nextjs"
import { useClickAway } from "@/hooks/use-click-away"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

// Types and Interfaces
interface AnimatedNavItemProps {
  href: string
  isActive: boolean
  children: React.ReactNode
}

interface MenuItem {
  id: string
  label: string
  icon: React.ElementType
  color: string
  shortcut?: string
}

// Animations and Constants
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      when: "beforeChildren",
      staggerChildren: 0.1,
    },
  },
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: -10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: "easeOut",
    },
  },
}

const menuItems: MenuItem[] = [
  { id: "logout", label: "Log out", icon: LogOut, color: "#F9C74F" },
]



// Utility Components
const IconWrapper = ({
  icon: Icon,
  isHovered,
  color,
}: {
  icon: React.ElementType
  isHovered: boolean
  color: string
}) => (
  <motion.div className="w-4 h-4 mr-2 relative" initial={false} animate={isHovered ? { scale: 1.2 } : { scale: 1 }}>
    <Icon className="w-4 h-4" />
    {isHovered && (
      <motion.div
        className="absolute inset-0"
        style={{ color }}
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
      >
        <Icon className="w-4 h-4" strokeWidth={2} />
      </motion.div>
    )}
  </motion.div>
)



// Navigation Components
export function BlankPanel({ title, description }: { title: string; description: string }) {
  return (
    <div className="mt-8 bg-white p-6 rounded-xl shadow-sm text-center">
      <h2 className="text-2xl font-semibold text-gray-800">{title}</h2>
      <p className="mt-2 text-gray-500">{description}</p>
    </div>
  )
}

export function AnimatedNavItem({ href, isActive, children }: AnimatedNavItemProps) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <Link
      href={href}
      className={cn(
        "relative px-3 py-2 rounded-md text-sm font-medium transition-all duration-200",
        isActive ? "text-green-700" : "text-gray-600 hover:text-gray-900",
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <span className="relative z-10">{children}</span>

      {/* Background hover effect */}
      {isHovered && !isActive && (
        <motion.div
          className="absolute inset-0 bg-gray-100 rounded-md z-0"
          layoutId="navHover"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        />
      )}

      {/* Active indicator */}
      {isActive && (
        <motion.div
          layoutId="activeIndicator"
          className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-green-500 to-green-500 rounded-full"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
        />
      )}
    </Link>
  )
}

export function AnimatedMobileNavItem({ href, isActive, children }: AnimatedNavItemProps) {
  const [isPressed, setIsPressed] = useState(false)

  return (
    <Link
      href={href}
      className={cn(
        "block relative px-3 py-2.5 rounded-md text-base font-medium transition-all duration-200",
        isActive ? "bg-green-50 text-green-700" : "text-gray-600",
      )}
      onTouchStart={() => setIsPressed(true)}
      onTouchEnd={() => setIsPressed(false)}
    >
      {/* Press animation for mobile */}
      <motion.div
        className="absolute inset-0 bg-gray-100 rounded-md z-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: isPressed ? 0.5 : 0 }}
        transition={{ duration: 0.2 }}
      />

      <span className="relative z-10">{children}</span>

      {/* Active indicator */}
      {isActive && (
        <motion.div
          layoutId="mobileActiveIndicator"
          className="absolute left-0 w-1 top-1 bottom-1 bg-gradient-to-b from-green-600 to-green-600 rounded-full"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
        />
      )}
    </Link>
  )
}

// Dropdown Components


// Navigation items
const navigationItems = [
  { name: "Dashboard", href: "/dashboard" },
  { name: "Posts", href: "/dashboard/posts" },
  { name: "Saved", href: "/dashboard/saved" },
]

// Mock user data - replace with your auth system
function ProfileDropdown() {
  const { user } = useUser();
  const { signOut } = useClerk();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);
  const router = useRouter();

  useClickAway(dropdownRef, () => setIsOpen(false));

  const handleSignOut = async () => {
    await signOut();
    router.push('/auth/signin');
  };

  if (!user) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 hover:opacity-80"
      >
        <Avatar>
          <AvatarImage src={user.imageUrl} />
          <AvatarFallback>{user.firstName?.charAt(0)}{user.lastName?.charAt(0)}</AvatarFallback>
        </Avatar>
        <span className="hidden md:inline-block font-medium text-sm text-gray-700">
          {user.fullName}
        </span>
        <ChevronDown className="h-4 w-4 text-gray-600" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-100 py-1"
          >
            <div className="px-4 py-3 border-b border-gray-100">
              <p className="text-sm font-medium text-gray-900">{user.fullName}</p>
              <p className="text-sm text-gray-500 truncate">{user.emailAddresses[0].emailAddress}</p>
            </div>

            <div className="py-1">
            </div>

            <div className="py-1 border-t border-gray-100">
              <button
                onClick={handleSignOut}
                className="flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-50"
              >
                <LogOut className="h-4 w-4 mr-3" />
                Log out
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function MainHeader({ onSearch }: { onSearch?: (query: string) => void }) {
  const pathname = usePathname()
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Handle search query changes
  useEffect(() => {
    if (onSearch) {
      onSearch(searchQuery);
    }
  }, [searchQuery, onSearch])

  // Close mobile menu when path changes
  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [pathname])

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out",
        isScrolled ? "bg-white/90 backdrop-blur-md shadow-sm py-2" : "bg-white/50 backdrop-blur-sm py-4",
      )}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          {/* Logo replaced with text */}
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-lg font-bold text-green-700">Searches</span>
          </Link>

          {/* Desktop Navigation - Now with animated nav items */}
          <nav className="hidden md:flex items-center space-x-1">
            <AnimatePresence>
              {navigationItems.map((item) => {
                const isActive = pathname === item.href

                return (
                  <AnimatedNavItem key={item.name} href={item.href} isActive={isActive}>
                    {item.name}
                  </AnimatedNavItem>
                )
              })}
            </AnimatePresence>
          </nav>

          {/* Right side actions */}
          <div className="flex items-center space-x-4">
            {/* Search - Desktop only */}
            <div className="hidden md:flex relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                type="search"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 w-[180px] lg:w-[240px] h-9 bg-gray-50 border border-gray-200 focus-visible:ring-1 focus-visible:ring-gray-100"
              />
            </div>

            {/* User Profile Dropdown */}
            <ProfileDropdown />

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden overflow-hidden"
            >
              <div className="py-4 space-y-1">
                {/* Mobile Search */}
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                  <Input 
                    type="search" 
                    placeholder="Search..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 bg-gray-50 border border-gray-200" />
                </div>

                {/* Mobile Nav Links - Now with animated mobile nav items */}
                {navigationItems.map((item) => {
                  const isActive = pathname === item.href
                  return (
                    <AnimatedMobileNavItem key={item.name} href={item.href} isActive={isActive}>
                      {item.name}
                    </AnimatedMobileNavItem>
                  )
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  )
}