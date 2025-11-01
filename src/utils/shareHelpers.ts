/**
 * Funções para compartilhamento em redes sociais
 */

// Compartilhar no WhatsApp
export const shareToWhatsApp = (text: string) => {
  const maxLength = 1000; // WhatsApp tem limite
  const truncatedText = text.length > maxLength 
    ? text.substring(0, maxLength) + '...' 
    : text;
  const encodedText = encodeURIComponent(truncatedText);
  const url = `https://wa.me/?text=${encodedText}`;
  window.open(url, '_blank', 'noopener,noreferrer');
};

// Compartilhar no Telegram
export const shareToTelegram = (text: string) => {
  const maxLength = 1000;
  const truncatedText = text.length > maxLength 
    ? text.substring(0, maxLength) + '...' 
    : text;
  const encodedText = encodeURIComponent(truncatedText);
  const url = `https://t.me/share/url?text=${encodedText}`;
  window.open(url, '_blank', 'noopener,noreferrer');
};
