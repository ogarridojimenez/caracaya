import { ReactNode } from 'react';

interface SectionProps {
  children: ReactNode;
  id?: string;
  className?: string;
  background?: 'dark' | 'light' | 'gradient';
}

export function Section({ children, id, className = '', background = 'dark' }: SectionProps) {
  const bgClasses = {
    dark: 'bg-[#0C0A09]',
    light: 'bg-white',
    gradient: 'bg-gradient-to-b from-[#0C0A09] to-[#1a1a1a]',
  };

  return (
    <section id={id} className={`py-16 md:py-24 ${bgClasses[background]} ${className}`}>
      {children}
    </section>
  );
}