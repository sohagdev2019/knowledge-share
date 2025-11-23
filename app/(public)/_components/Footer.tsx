"use client";

import Link from "next/link";
import Image from "next/image";
import Logo from "@/public/logo.png";

const socialLinks = [
  { name: "Facebook", icon: "📘", href: "#" },
  { name: "Twitter", icon: "🐦", href: "#" },
  { name: "Instagram", icon: "📷", href: "#" },
  { name: "LinkedIn", icon: "💼", href: "#" },
  { name: "YouTube", icon: "📺", href: "#" },
  { name: "TikTok", icon: "🎵", href: "#" },
];

const footerLinks = {
  Products: [
    { name: "Online Courses", href: "/courses" },
    { name: "Coaching", href: "#" },
    { name: "Podcasts", href: "#" },
    { name: "Memberships", href: "#" },
    { name: "Communities", href: "#" },
    { name: "Newsletters", href: "#" },
    { name: "Downloads", href: "#" },
  ],
  Features: [
    { name: "Email", href: "#" },
    { name: "No-Code Websites", href: "#" },
    { name: "Landing Pages", href: "#" },
    { name: "Contacts", href: "#" },
    { name: "Analytics", href: "#" },
    { name: "Branded Mobile App", href: "#" },
    { name: "Payments", href: "#" },
    { name: "Link In Bio", href: "#" },
  ],
  Company: [
    { name: "About Us", href: "#" },
    { name: "Careers", href: "#" },
    { name: "Press", href: "#" },
    { name: "Partner Program", href: "#" },
  ],
  Resources: [
    { name: "Blog", href: "#" },
    { name: "The Creator's Playbook Podcast", href: "#" },
    { name: "Training Webinars", href: "#" },
    { name: "Free Guides & Downloads", href: "#" },
    { name: "Creator Stories", href: "#" },
    { name: "Learning Hub", href: "#" },
  ],
  Support: [
    { name: "Contact Support", href: "#" },
    { name: "FAQs", href: "#" },
    { name: "Help Center", href: "#" },
    { name: "Status", href: "#" },
  ],
  Legal: [
    { name: "Policy Center", href: "#" },
    { name: "Privacy Notice", href: "#" },
    { name: "Income Disclaimer", href: "#" },
    { name: "Privacy Settings", href: "#" },
    { name: "Your Privacy Choices", href: "#" },
  ],
};

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full border-t border-border bg-background">
      <div className="w-full px-4 sm:px-6 lg:px-8 pt-12 sm:pt-16 lg:pt-20 pb-8 sm:pb-12">
        <div className="max-w-7xl mx-auto">
          {/* Top Section - Logo, Social, Apps */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-8 gap-8 lg:gap-12 mb-12 lg:mb-16">
            {/* Logo and Social Section */}
            <div className="md:col-span-2 lg:col-span-2 space-y-6 sm:space-y-6">
              <div className="flex items-center space-x-2">
                <Image src={Logo} alt="Logo" className="size-8 sm:size-9" />
                <span className="font-bold text-lg sm:text-xl text-foreground">KnowledgeShare.</span>
              </div>

              {/* Social Media Icons */}
              <div className="flex items-center gap-4 sm:gap-5 flex-wrap">
                {socialLinks.map((social) => (
                  <Link
                    key={social.name}
                    href={social.href}
                    className="text-xl sm:text-2xl hover:opacity-70 transition-all duration-300 hover:scale-110"
                    aria-label={social.name}
                  >
                    {social.icon}
                  </Link>
                ))}
              </div>

              {/* App Download Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  href="#"
                  className="inline-flex items-center justify-center px-4 py-2.5 border border-border rounded-lg hover:bg-accent transition-all duration-300 hover:border-primary/50 text-xs sm:text-sm font-medium w-full sm:w-auto sm:min-w-[150px] group"
                >
                  <span className="mr-2 text-base sm:text-lg group-hover:scale-110 transition-transform">🍎</span>
                  <div className="text-left">
                    <div className="text-[10px] leading-tight text-muted-foreground">Download on the</div>
                    <div className="text-xs font-semibold text-foreground">App Store</div>
                  </div>
                </Link>
                <Link
                  href="#"
                  className="inline-flex items-center justify-center px-4 py-2.5 border border-border rounded-lg hover:bg-accent transition-all duration-300 hover:border-primary/50 text-xs sm:text-sm font-medium w-full sm:w-auto sm:min-w-[150px] group"
                >
                  <span className="mr-2 text-base sm:text-lg group-hover:scale-110 transition-transform">▶</span>
                  <div className="text-left">
                    <div className="text-[10px] leading-tight text-muted-foreground">GET IT ON</div>
                    <div className="text-xs font-semibold text-foreground">Google Play</div>
                  </div>
                </Link>
              </div>
            </div>

            {/* Navigation Links - Responsive Grid */}
            <div className="md:col-span-2 lg:col-span-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-8 sm:gap-10 lg:gap-12">
              {Object.entries(footerLinks).map(([category, links]) => (
                <div key={category} className="space-y-4 sm:space-y-4">
                  <h3 className="font-bold text-xs sm:text-sm uppercase tracking-wider text-foreground">
                    {category}
                  </h3>
                  <ul className="space-y-3 sm:space-y-3">
                    {links.map((link) => (
                      <li key={link.name}>
                        <Link
                          href={link.href}
                          className="text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors duration-200 block"
                        >
                          {link.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Copyright */}
          <div className="pt-8 sm:pt-10 border-t border-border">
            <p className="text-xs sm:text-sm text-muted-foreground text-center">
              ©2010-{currentYear} All Rights Reserved. KnowledgeShare®
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

