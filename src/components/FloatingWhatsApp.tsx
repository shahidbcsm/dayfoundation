import React from "react";
import { MessageCircle } from "lucide-react";
import "../styles/pages.css";

export const FloatingWhatsApp: React.FC = () => {
  const whatsappNumber = "918982144416"; // +91 89821 44416
  const prefilledMessage = "Hello DAY Foundation team! I am interested in volunteering/supporting your missions. Can you please guide me?";
  
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(prefilledMessage)}`;

  return (
    <a 
      href={whatsappUrl} 
      target="_blank" 
      rel="noopener noreferrer" 
      className="whatsapp-widget"
      aria-label="Contact DAY Foundation on WhatsApp"
    >
      <MessageCircle size={28} className="fill-current" />
    </a>
  );
};
export default FloatingWhatsApp;
