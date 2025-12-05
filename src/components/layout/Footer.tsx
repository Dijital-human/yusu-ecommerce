/**
 * Footer Component
 * This component provides the main footer with links and information
 */

import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { DarkModeToggle } from "@/components/ui/DarkModeToggle";
import { 
  Facebook, 
  Twitter, 
  Instagram, 
  Linkedin, 
  Mail, 
  Phone, 
  MapPin,
  CreditCard,
  Shield,
  Truck,
  RotateCcw
} from "lucide-react";

export function Footer() {
  const t = useTranslations("footer");
  return (
    <footer className="bg-gray-900 dark:bg-gray-950 text-white dark:text-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info / Şirkət Məlumatı */}
          <div className="space-y-4">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-lg">U</span>
              </div>
              <span className="ml-2 text-xl font-bold">Ulustore</span>
            </div>
            <p className="text-gray-300 text-sm">
              {t("company.description")}
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">{t("quickLinks.title")}</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="text-gray-300 hover:text-white transition-colors text-sm">
                  {t("quickLinks.about")}
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-300 hover:text-white transition-colors text-sm">
                  {t("quickLinks.contact")}
                </Link>
              </li>
              <li>
                <Link href="/careers" className="text-gray-300 hover:text-white transition-colors text-sm">
                  {t("quickLinks.careers")}
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-gray-300 hover:text-white transition-colors text-sm">
                  {t("quickLinks.blog")}
                </Link>
              </li>
              <li>
                <Link href="/help" className="text-gray-300 hover:text-white transition-colors text-sm">
                  {t("quickLinks.help")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">{t("customerService.title")}</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/shipping" className="text-gray-300 hover:text-white transition-colors text-sm">
                  {t("customerService.shipping")}
                </Link>
              </li>
              <li>
                <Link href="/returns" className="text-gray-300 hover:text-white transition-colors text-sm">
                  {t("customerService.returns")}
                </Link>
              </li>
              <li>
                <Link href="/size-guide" className="text-gray-300 hover:text-white transition-colors text-sm">
                  {t("customerService.sizeGuide")}
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-gray-300 hover:text-white transition-colors text-sm">
                  {t("customerService.faq")}
                </Link>
              </li>
              <li>
                <Link href="/track-order" className="text-gray-300 hover:text-white transition-colors text-sm">
                  {t("customerService.trackOrder")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">{t("contact.title")}</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <MapPin className="h-5 w-5 text-gray-400" />
                <span className="text-gray-300 text-sm">
                  123 Business Street, Baku, Azerbaijan
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-gray-400" />
                <span className="text-gray-300 text-sm">
                  +994 12 345 67 89
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-gray-400" />
                <span className="text-gray-300 text-sm">
                  info@azliner.info
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="mt-12 pt-8 border-t border-gray-800 dark:border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="flex items-center space-x-3">
                  <div className="bg-gradient-to-br from-primary-500 to-primary-600 p-2 rounded-lg shadow-md">
                    <Truck className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm">{t("features.freeShipping")}</h4>
                    <p className="text-gray-400 text-xs">{t("features.freeShippingDesc")}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="bg-gradient-to-br from-primary-400 to-primary-500 p-2 rounded-lg shadow-md">
                    <RotateCcw className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm">{t("features.easyReturns")}</h4>
                    <p className="text-gray-400 text-xs">{t("features.easyReturnsDesc")}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="bg-gradient-to-br from-primary-600 to-primary-700 p-2 rounded-lg shadow-md">
                    <Shield className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm">{t("features.securePayment")}</h4>
                    <p className="text-gray-400 text-xs">{t("features.securePaymentDesc")}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="bg-gradient-to-br from-primary-500 to-primary-600 p-2 rounded-lg shadow-md">
                    <CreditCard className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm">{t("features.multiplePayment")}</h4>
                    <p className="text-gray-400 text-xs">{t("features.multiplePaymentDesc")}</p>
                  </div>
                </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-gray-800 dark:border-gray-700">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-gray-400 text-sm">
              {t("bottom.copyright")}
            </div>
            <div className="flex items-center space-x-6">
              <div className="flex space-x-6">
                <Link href="/privacy" className="text-gray-400 hover:text-white transition-colors text-sm">
                  {t("bottom.privacy")}
                </Link>
                <Link href="/terms" className="text-gray-400 hover:text-white transition-colors text-sm">
                  {t("bottom.terms")}
                </Link>
                <Link href="/cookies" className="text-gray-400 hover:text-white transition-colors text-sm">
                  {t("bottom.cookies")}
                </Link>
              </div>
              {/* Dark Mode Toggle / Dark Mode Dəyişdirici */}
              <div className="flex items-center">
                <DarkModeToggle variant="footer" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
