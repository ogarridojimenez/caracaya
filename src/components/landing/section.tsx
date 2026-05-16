'use client';

import { ReactNode } from 'react';

interface SectionProps {
  children: ReactNode;
  id?: string;
  className?: string;
  style?: object;
}

export function LandingSection({ children, id, className = '', style }: SectionProps) {
  return (
    <section id={id} style={style} className={className}>
      {children}
    </section>
  );
}

interface ContainerProps {
  children: ReactNode;
  className?: string;
  style?: object;
}

export function LandingContainer({ children, className = '', style }: ContainerProps) {
  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', ...style }} className={className}>
      {children}
    </div>
  );
}