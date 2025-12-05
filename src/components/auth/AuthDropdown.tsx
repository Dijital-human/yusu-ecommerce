/**
 * Auth Dropdown Component / Autentifikasiya Dropdown Komponenti
 * Hover ilə açılan login formu - Categories, LanguageSwitcher və CurrencySwitcher kimi
 * Login form that opens on hover - Similar to Categories, LanguageSwitcher and CurrencySwitcher
 */

"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { User, Mail, Lock, Eye, EyeOff, LogIn } from "lucide-react";

interface AuthDropdownProps {
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

export function AuthDropdown({ onMouseEnter, onMouseLeave }: AuthDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("auth");

  // Handle mouse enter - open dropdown / Mouse enter - dropdown aç
  // Desktop-da yalnız işləyir / Only works on desktop
  const handleMouseEnter = () => {
    // Mobil-də hover yoxdur / No hover on mobile
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      return;
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setIsOpen(true);
    if (onMouseEnter) {
      onMouseEnter();
    }
  };

  // Handle mouse leave - close dropdown with delay / Mouse leave - dropdown bağla (gecikmə ilə)
  // Desktop-da yalnız işləyir / Only works on desktop
  const handleMouseLeave = () => {
    // Mobil-də hover yoxdur / No hover on mobile
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      return;
    }
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 200);
    if (onMouseLeave) {
      onMouseLeave();
    }
  };

  // Handle menu enter - keep dropdown open / Menyu enter - dropdown açıq saxla
  const handleMenuEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setIsOpen(true);
  };

  // Handle menu leave - close dropdown / Menyu leave - dropdown bağla
  const handleMenuLeave = () => {
    setIsOpen(false);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };

  // Handle input change / Input dəyişikliyi
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing / İstifadəçi yazmağa başlayanda xətanı təmizlə
    if (error) {
      setError(null);
    }
  };

  // Handle form submit / Form göndərmə
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const result = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (result?.error) {
        setError(t("invalidCredentials"));
      } else if (result?.ok) {
        // Success - reload page with locale preserved / Uğur - locale saxlanaraq səhifəni yenilə
        const currentPath = window.location.pathname;
        const pathWithoutLocale = currentPath.replace(/^\/(az|en|ru|tr|zh)/, '') || '/';
        const cleanPath = pathWithoutLocale === '/' ? '' : pathWithoutLocale;
        const searchParams = window.location.search;
        const hash = window.location.hash;
        window.location.href = `/${locale}${cleanPath}${searchParams}${hash}`;
      }
    } catch (err) {
      setError(t("errorOccurred"));
    } finally {
      setIsLoading(false);
    }
  };

  // Cleanup timeout on unmount / Unmount zamanı timeout təmizlə
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Close menu when clicking outside / Kənara kliklə dropdown bağla
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div
      ref={menuRef}
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Trigger Button / Trigger Düyməsi */}
      {/* Desktop: hover ilə açılır, Mobile: kliklə açılır / Desktop: opens on hover, Mobile: opens on click */}
      <button
        onClick={() => {
          // Mobil-də kliklə açılır / Opens on click on mobile
          if (typeof window !== 'undefined' && window.innerWidth < 768) {
            setIsOpen(!isOpen);
          }
        }}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
          isOpen
            ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md"
            : "bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700"
        }`}
      >
        <User className="h-4 w-4" />
        <span className="text-sm font-medium">{t("signIn")}</span>
      </button>

      {/* Desktop Dropdown Menu / Desktop Dropdown Menyu */}
      {isOpen && (
        <div
          className="hidden md:block absolute top-full right-0 mt-2 w-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 opacity-100"
          onMouseEnter={handleMenuEnter}
          onMouseLeave={handleMenuLeave}
        >
          <div className="p-4">
            {/* Header / Başlıq */}
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {t("signIn")}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {t("enterCredentials")}
              </p>
            </div>

            {/* Form / Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email Input / Email Input */}
              <div>
                <Label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t("email")}
                </Label>
                <div className="relative mt-1">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="pl-10"
                    placeholder={t("email")}
                  />
                </div>
              </div>

              {/* Password Input / Şifrə Input */}
              <div>
                <Label htmlFor="password" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t("password")}
                </Label>
                <div className="relative mt-1">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    className="pl-10 pr-10"
                    placeholder={t("password")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Error Message / Xəta Mesajı */}
              {error && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                </div>
              )}

              {/* Sign In Button / Giriş Düyməsi */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="animate-spin">⏳</span>
                    {t("signIn")}...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <LogIn className="h-4 w-4" />
                    {t("signIn")}
                  </span>
                )}
              </Button>

              {/* Links / Linklər */}
              <div className="flex items-center justify-between text-sm">
                <Link
                  href="/auth/forgot-password"
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                  onClick={() => setIsOpen(false)}
                >
                  {t("forgotPassword")}
                </Link>
                <Link
                  href="/auth/signup"
                  className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                  onClick={() => setIsOpen(false)}
                >
                  {t("signUp")}
                </Link>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Mobile Bottom Sheet / Mobil Bottom Sheet */}
      {isOpen && (
        <>
          <div
            className="md:hidden fixed inset-0 bg-black/60 z-[90]"
            onClick={() => setIsOpen(false)}
          />
          <div className="md:hidden fixed bottom-0 left-0 right-0 z-[100] bg-white dark:bg-gray-800 rounded-t-2xl shadow-2xl max-h-[80vh] overflow-y-auto opacity-100 animate-slide-up">
            {/* Drag handle / Sürükləmə tutacağı */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-12 h-1 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
            </div>

            {/* Header / Başlıq */}
            <div className="px-4 pb-3 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                {t("signIn")}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {t("enterCredentials")}
              </p>
            </div>

            {/* Form / Form */}
            <div className="p-4">
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Email Input / Email Input */}
                <div>
                  <Label htmlFor="mobile-email" className="text-base font-medium text-gray-700 dark:text-gray-300">
                    {t("email")}
                  </Label>
                  <div className="relative mt-2">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      id="mobile-email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="pl-11 text-base py-3 touch-manipulation"
                      placeholder={t("email")}
                    />
                  </div>
                </div>

                {/* Password Input / Şifrə Input */}
                <div>
                  <Label htmlFor="mobile-password" className="text-base font-medium text-gray-700 dark:text-gray-300">
                    {t("password")}
                  </Label>
                  <div className="relative mt-2">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      id="mobile-password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={handleInputChange}
                      required
                      className="pl-11 pr-11 text-base py-3 touch-manipulation"
                      placeholder={t("password")}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-2 touch-manipulation"
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Error Message / Xəta Mesajı */}
                {error && (
                  <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                  </div>
                )}

                {/* Sign In Button / Giriş Düyməsi */}
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white min-h-[56px] text-base font-semibold touch-manipulation"
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <span className="animate-spin">⏳</span>
                      {t("signIn")}...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <LogIn className="h-5 w-5" />
                      {t("signIn")}
                    </span>
                  )}
                </Button>

                {/* Links / Linklər */}
                <div className="flex items-center justify-between text-base pt-2">
                  <Link
                    href="/auth/forgot-password"
                    className="text-blue-600 dark:text-blue-400 hover:underline touch-manipulation"
                    onClick={() => setIsOpen(false)}
                  >
                    {t("forgotPassword")}
                  </Link>
                  <Link
                    href="/auth/signup"
                    className="text-blue-600 dark:text-blue-400 hover:underline font-semibold touch-manipulation"
                    onClick={() => setIsOpen(false)}
                  >
                    {t("signUp")}
                  </Link>
                </div>
              </form>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

