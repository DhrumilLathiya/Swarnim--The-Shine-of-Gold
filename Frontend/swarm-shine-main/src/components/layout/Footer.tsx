import { Link } from "react-router-dom";
import { Facebook, Instagram, Twitter, Youtube, MapPin, Phone, Mail } from "lucide-react";

const Footer = () => {
  const footerLinks = {
    shop: [
      { name: "Rings", href: "/rings" },
      { name: "Necklaces", href: "/necklaces" },
      { name: "Earrings", href: "/earrings" },
      { name: "Bangles", href: "/bangles" },
    ],
    company: [
      { name: "About Us", href: "/about" },
      { name: "Our Story", href: "/story" },
      { name: "Careers", href: "/careers" },
    ],
    support: [
      { name: "Contact Us", href: "/contact" },
      { name: "FAQs", href: "/faqs" },
      { name: "Shipping", href: "/shipping" },
    ],
  };

  return (
    <footer className="bg-wine text-ivory">
      <div className="container mx-auto px-6 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-12">
          <div className="lg:col-span-2">
            <h2 className="font-display text-3xl font-semibold mb-4">
              <span className="text-ivory">Swar</span>
              <span className="text-gold">nim</span>
            </h2>
            <p className="text-ivory/60 text-base leading-relaxed mb-6 max-w-sm">
              Crafting timeless gold jewelry that celebrates tradition with contemporary elegance.
            </p>
            <div className="space-y-3 text-base">
              <div className="flex items-center gap-3 text-ivory/60">
                <MapPin className="h-5 w-5 text-gold" />
                <span>Mumbai, Maharashtra, India</span>
              </div>
              <div className="flex items-center gap-3 text-ivory/60">
                <Phone className="h-5 w-5 text-gold" />
                <span>+91 22 1234 5678</span>
              </div>
              <div className="flex items-center gap-3 text-ivory/60">
                <Mail className="h-5 w-5 text-gold" />
                <span>hello@swarnim.com</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-base tracking-wide uppercase mb-6">Shop</h3>
            <ul className="space-y-3">
              {footerLinks.shop.map((link) => (
                <li key={link.name}>
                  <Link to={link.href} className="text-base text-ivory/60 hover:text-gold transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-base tracking-wide uppercase mb-6">Company</h3>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link to={link.href} className="text-base text-ivory/60 hover:text-gold transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-base tracking-wide uppercase mb-6">Support</h3>
            <ul className="space-y-3">
              {footerLinks.support.map((link) => (
                <li key={link.name}>
                  <Link to={link.href} className="text-base text-ivory/60 hover:text-gold transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-ivory/10 flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-base text-ivory/40">© 2024 Swarnim. All rights reserved.</p>
          <div className="flex items-center gap-4">
            {[
              { Icon: Facebook, href: "https://facebook.com" },
              { Icon: Instagram, href: "https://instagram.com" },
              { Icon: Twitter, href: "https://twitter.com" },
              { Icon: Youtube, href: "https://youtube.com" },
            ].map(({ Icon, href }, i) => (
              <a key={i} href={href} target="_blank" rel="noopener noreferrer" className="w-11 h-11 rounded-full bg-ivory/10 flex items-center justify-center hover:bg-gold hover:text-wine transition-colors">
                <Icon className="h-5 w-5" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;