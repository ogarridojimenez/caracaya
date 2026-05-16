'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Clock, MapPin, Phone, ChevronDown, Star, Users, Award, Cake, Cookie, IceCream, Sandwich } from 'lucide-react';
import { FEATURED_PRODUCTS, TESTIMONIALS } from '@/data/landing-data';

const ICONS: Record<string, React.ComponentType<{ className?: string; style?: object }>> = {
  Clock, MapPin, Phone, Award, Cookie, Users, Cake
};

export default function LandingPage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToContent = () => {
    document.getElementById('discover')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div style={{ backgroundColor: '#0C0A09', color: '#FAFAF9', fontFamily: 'system-ui, sans-serif', overflowX: 'hidden' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400&family=DM+Sans:wght@300;400;500;600&display=swap');
        
        * { margin: 0; padding: 0; box-sizing: border-box; }
        
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(3deg); }
        }
        
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 20px rgba(217, 119, 6, 0.3); }
          50% { box-shadow: 0 0 40px rgba(217, 119, 6, 0.6); }
        }
        
        @keyframes grain {
          0%, 100% { transform: translate(0, 0); }
          10% { transform: translate(-5%, -10%); }
          20% { transform: translate(-15%, 5%); }
          30% { transform: translate(7%, -25%); }
          40% { transform: translate(-5%, 25%); }
          50% { transform: translate(-15%, 10%); }
          60% { transform: translate(15%, 0%); }
          70% { transform: translate(0%, 15%); }
          80% { transform: translate(3%, 35%); }
          90% { transform: translate(-10%, 10%); }
        }
        
        .animate-in { animation: fadeInUp 0.8s ease forwards; }
        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-float-delay { animation: float 6s ease-in-out 2s infinite; }
        .animate-glow { animation: pulse-glow 3s ease-in-out infinite; }
        
        .hero-text-1 { animation: fadeInUp 0.8s ease 0.2s forwards; opacity: 0; }
        .hero-text-2 { animation: fadeInUp 0.8s ease 0.4s forwards; opacity: 0; }
        .hero-text-3 { animation: fadeInUp 0.8s ease 0.6s forwards; opacity: 0; }
        .hero-cta { animation: fadeInUp 0.8s ease 0.8s forwards; opacity: 0; }
        
        .grain-overlay::before {
          content: '';
          position: absolute;
          top: -50%; left: -50%;
          width: 200%; height: 200%;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.08'/%3E%3C/svg%3E");
          animation: grain 8s steps(10) infinite;
          pointer-events: none;
        }
        
        .card-hover {
          transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275), box-shadow 0.4s ease;
        }
        .card-hover:hover {
          transform: translateY(-12px) scale(1.02);
          box-shadow: 0 30px 60px rgba(0,0,0,0.4);
        }
        
        .text-gradient {
          background: linear-gradient(135deg, #D97706 0%, #F59E0B 50%, #D97706 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        
        .scroll-indicator {
          animation: float 2s ease-in-out infinite;
        }
      `}</style>

      {/* Navigation */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        padding: '16px 0',
        background: scrollY > 50 ? 'rgba(12,10,9,0.95)' : 'transparent',
        backdropFilter: scrollY > 50 ? 'blur(20px)' : 'none',
        borderBottom: scrollY > 50 ? '1px solid rgba(217,119,6,0.2)' : 'none',
        transition: 'all 0.4s ease',
      }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg, #D97706, #F59E0B)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Cake style={{ width: 22, height: 22, color: '#0C0A09' }} />
            </div>
            <span style={{ fontFamily: '"Playfair Display", serif', fontSize: 22, fontWeight: 600, letterSpacing: '-0.5px' }}>Caracaya</span>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
            <div className="desktop-nav" style={{ display: 'flex', gap: 32 }}>
              {['Nosotros', 'Menú', 'Testimonios'].map(item => (
                <a key={item} href={`#${item.toLowerCase()}`} style={{ color: '#A8A29E', textDecoration: 'none', fontSize: 14, fontWeight: 500, transition: 'color 0.3s', cursor: 'pointer' }}
                  onMouseEnter={e => (e.target as HTMLElement).style.color = '#F59E0B'}
                  onMouseLeave={e => (e.target as HTMLElement).style.color = '#A8A29E'}
                >
                  {item}
                </a>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <Link href="/login" style={{ padding: '10px 24px', borderRadius: 100, border: '1px solid rgba(217,119,6,0.5)', color: '#F59E0B', textDecoration: 'none', fontSize: 14, fontWeight: 500, transition: 'all 0.3s' }}
                onMouseEnter={e => { (e.target as HTMLElement).style.background = 'rgba(217,119,6,0.1)'; }}
                onMouseLeave={e => { (e.target as HTMLElement).style.background = 'transparent'; }}
              >
                Iniciar Sesión
              </Link>
              <Link href="/register" style={{ padding: '10px 24px', borderRadius: 100, background: 'linear-gradient(135deg, #D97706, #F59E0B)', color: '#0C0A09', textDecoration: 'none', fontSize: 14, fontWeight: 600, transition: 'all 0.3s' }}
                onMouseEnter={e => { (e.target as HTMLElement).style.transform = 'scale(1.05)'; }}
                onMouseLeave={e => { (e.target as HTMLElement).style.transform = 'scale(1)'; }}
              >
                Regístrate
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section ref={heroRef} style={{ position: 'relative', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
        <div className="grain-overlay" style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 0%, rgba(217,119,6,0.15) 0%, transparent 60%), radial-gradient(ellipse at 80% 50%, rgba(245,158,11,0.08) 0%, transparent 50%)' }} />
        
        <div style={{ position: 'absolute', inset: 0 }}>
          <img 
            src="https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=1920&h=1080&fit=crop" 
            alt="" 
            style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.25, transform: `translateY(${scrollY * 0.3}px)` }}
          />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(12,10,9,0.3) 0%, rgba(12,10,9,0.7) 50%, #0C0A09 100%)' }} />
        </div>

        <div style={{ position: 'relative', zIndex: 2, textAlign: 'center', maxWidth: 900, padding: '0 24px' }}>
          <div className="hero-text-1" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 16px', borderRadius: 100, background: 'rgba(217,119,6,0.15)', border: '1px solid rgba(217,119,6,0.3)', marginBottom: 32 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#F59E0B', display: 'inline-block' }} />
            <span style={{ fontSize: 13, fontWeight: 500, color: '#F59E0B', letterSpacing: '0.5px' }}>DESDE 2018 — DULCES, REFRESCOS Y COMIDA</span>
          </div>
          
          <h1 className="hero-text-2" style={{ fontFamily: '"Playfair Display", serif', fontSize: 'clamp(3rem, 8vw, 6rem)', fontWeight: 700, lineHeight: 1.1, marginBottom: 24, letterSpacing: '-2px' }}>
            Dulces, Refrescos<br />
            <span className="text-gradient">y Más</span>
          </h1>
          
          <p className="hero-text-3" style={{ fontSize: 'clamp(1rem, 2vw, 1.25rem)', color: '#A8A29E', maxWidth: 600, margin: '0 auto 40px', lineHeight: 1.7 }}>
            Dulces artesanales, refrescos naturales y comida deliciosa, 
            preparados cada día con ingredientes frescos y mucho amor.
          </p>
          
          <div className="hero-cta" style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/register" style={{ padding: '16px 40px', borderRadius: 100, background: 'linear-gradient(135deg, #D97706, #F59E0B)', color: '#0C0A09', textDecoration: 'none', fontSize: 16, fontWeight: 600, boxShadow: '0 4px 20px rgba(217,119,6,0.4)' }}>
              Crear Cuenta Gratis
            </Link>
            <Link href="/login" style={{ padding: '16px 40px', borderRadius: 100, border: '1px solid rgba(255,255,255,0.2)', color: 'white', textDecoration: 'none', fontSize: 16, fontWeight: 500 }}>
              Ya tengo cuenta
            </Link>
          </div>
        </div>

        <div style={{ position: 'absolute', bottom: 40, left: '50%', transform: 'translateX(-50%)', zIndex: 2 }} className="scroll-indicator">
          <button onClick={scrollToContent} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, color: '#A8A29E' }}>
            <span style={{ fontSize: 12, letterSpacing: '1px' }}>DESCUBRIR</span>
            <ChevronDown style={{ width: 20, height: 20 }} />
          </button>
        </div>
      </section>

      {/* Info Bar */}
      <section style={{ background: 'rgba(217,119,6,0.08)', borderTop: '1px solid rgba(217,119,6,0.15)', borderBottom: '1px solid rgba(217,119,6,0.15)', padding: '48px 24px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 32 }}>
          {[
            { icon: Clock, title: '7:00 AM - 10:00 PM', subtitle: 'Todos los días' },
            { icon: MapPin, title: 'Centro Comercial Norte', subtitle: 'Bogotá, Colombia' },
            { icon: Phone, title: '+57 300 123 4567', subtitle: 'Llámanos para reservas' },
            { icon: Award, title: 'Ingredientes Frescos', subtitle: 'Calidad garantizada' },
          ].map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ width: 56, height: 56, borderRadius: 16, background: 'rgba(217,119,6,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <item.icon style={{ width: 24, height: 24, color: '#F59E0B' }} />
              </div>
              <div>
                <p style={{ fontWeight: 600, fontSize: 15, marginBottom: 2 }}>{item.title}</p>
                <p style={{ fontSize: 13, color: '#A8A29E' }}>{item.subtitle}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* About Section */}
      <section id="nosotros" style={{ padding: '140px 24px', maxWidth: 1280, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'center' }}>
          <div className="card-hover" style={{ position: 'relative', borderRadius: 24, overflow: 'hidden' }}>
            <img src="https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&h=700&fit=crop" alt="Dulces" style={{ width: '100%', height: 500, objectFit: 'cover', borderRadius: 24 }} />
            <div style={{ position: 'absolute', bottom: -20, right: -20, width: 180, height: 180, borderRadius: 24, background: 'linear-gradient(135deg, #D97706, #F59E0B)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', boxShadow: '0 20px 40px rgba(0,0,0,0.3)' }}>
              <span style={{ fontFamily: '"Playfair Display", serif', fontSize: 48, fontWeight: 700, color: '#0C0A09', lineHeight: 1 }}>7+</span>
              <span style={{ fontSize: 14, color: '#78350F', fontWeight: 500, marginTop: 4 }}>Años de</span>
              <span style={{ fontSize: 14, color: '#78350F', fontWeight: 600 }}>Excelencia</span>
            </div>
          </div>

          <div>
            <span style={{ display: 'inline-block', fontSize: 12, fontWeight: 600, color: '#F59E0B', letterSpacing: '2px', marginBottom: 16 }}>NUESTRA HISTORIA</span>
            <h2 style={{ fontFamily: '"Playfair Display", serif', fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 600, lineHeight: 1.2, marginBottom: 24, letterSpacing: '-1px' }}>
              Más que dulces,<br />
              <span style={{ color: '#F59E0B' }}>creamos sonrisas</span>
            </h2>
            <p style={{ fontSize: 16, color: '#A8A29E', lineHeight: 1.8, marginBottom: 16 }}>
              En Caracaya, cada dulce es elaborado con ingredientes de la mejor calidad. 
              Nuestros postres, refrescos y comidas se preparan diariamente con receta 
              tradicionales y un toque especial.
            </p>
            <p style={{ fontSize: 16, color: '#A8A29E', lineHeight: 1.8, marginBottom: 32 }}>
              Con más de 7 años deleitando a nuestros clientes, hemos convertido a Caracaya 
              en el lugar favorito para satisfacer esos antojos dulces.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
              {[
                { number: '15K+', label: 'Clientes felices' },
                { number: '100+', label: 'Recetas dulces' },
                { number: '3', label: 'Refrescos naturales' },
                { number: '98%', label: 'Satisfacción' },
              ].map((stat, i) => (
                <div key={i}>
                  <span style={{ fontFamily: '"Playfair Display", serif', fontSize: 28, fontWeight: 700, color: '#F59E0B' }}>{stat.number}</span>
                  <p style={{ fontSize: 13, color: '#A8A29E', marginTop: 2 }}>{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section id="menú" style={{ padding: '80px 24px 140px', background: 'linear-gradient(180deg, rgba(217,119,6,0.03) 0%, transparent 100%)' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <span style={{ display: 'inline-block', fontSize: 12, fontWeight: 600, color: '#F59E0B', letterSpacing: '2px', marginBottom: 16 }}>NUESTRO MENÚ</span>
            <h2 style={{ fontFamily: '"Playfair Display", serif', fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 600, letterSpacing: '-1px' }}>
              Productos <span style={{ color: '#F59E0B' }}>Destacados</span>
            </h2>
            <p style={{ color: '#A8A29E', marginTop: 12, maxWidth: 500, margin: '12px auto 0' }}>
              Los favoritos de nuestros clientes, preparados con los mejores ingredientes y recetas tradicionales.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
            {FEATURED_PRODUCTS.map((product, i) => (
              <div key={i} className="card-hover" style={{ background: '#1C1917', borderRadius: 20, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ position: 'relative', height: 240, overflow: 'hidden' }}>
                  <img src={product.image} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.6s' }}
                    onMouseEnter={e => (e.target as HTMLImageElement).style.transform = 'scale(1.1)'}
                    onMouseLeave={e => (e.target as HTMLImageElement).style.transform = 'scale(1)'}
                  />
                  {product.popular && (
                    <div style={{ position: 'absolute', top: 16, left: 16, padding: '4px 12px', borderRadius: 100, background: 'linear-gradient(135deg, #D97706, #F59E0B)', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Star style={{ width: 12, height: 12, fill: '#0C0A09', color: '#0C0A09' }} />
                      <span style={{ fontSize: 11, fontWeight: 700, color: '#0C0A09' }}>POPULAR</span>
                    </div>
                  )}
                </div>
                <div style={{ padding: 24 }}>
                  <h3 style={{ fontFamily: '"Playfair Display", serif', fontSize: 20, fontWeight: 600, marginBottom: 8 }}>{product.name}</h3>
                  <p style={{ fontSize: 14, color: '#A8A29E', marginBottom: 20, lineHeight: 1.5 }}>{product.description}</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontFamily: '"Playfair Display", serif', fontSize: 24, fontWeight: 700, color: '#F59E0B' }}>${product.price.toFixed(2)}</span>
                    <Link href="/register" style={{ padding: '10px 20px', borderRadius: 100, background: 'rgba(217,119,6,0.15)', color: '#F59E0B', textDecoration: 'none', fontSize: 13, fontWeight: 600, transition: 'all 0.3s' }}
                      onMouseEnter={e => { (e.target as HTMLElement).style.background = 'rgba(217,119,6,0.3)'; }}
                      onMouseLeave={e => { (e.target as HTMLElement).style.background = 'rgba(217,119,6,0.15)'; }}
                    >
                      Pedir ahora
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: '100px 24px', maxWidth: 1280, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 32 }}>
          {[
            { icon: Cookie, title: 'Dulces Artesanales', desc: 'Postres elaborados con ingredientes frescos y recetas tradicionales que cambian cada día para sorprenderte.' },
            { icon: Users, title: 'Equipo Experto', desc: 'Nuestros reposteros tienen años de experiencia creando los dulces más deliciosos de la zona.' },
            { icon: Award, title: 'Calidad Garantizada', desc: 'Usamos ingredientes de primera calidad y procesos de control estrictos para garantizar frescura.' },
          ].map((item, i) => (
            <div key={i} className="card-hover" style={{ background: '#1C1917', borderRadius: 20, padding: 40, textAlign: 'center', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ width: 72, height: 72, borderRadius: 24, background: 'linear-gradient(135deg, rgba(217,119,6,0.2), rgba(245,158,11,0.1))', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                <item.icon style={{ width: 32, height: 32, color: '#F59E0B' }} />
              </div>
              <h3 style={{ fontFamily: '"Playfair Display", serif', fontSize: 20, fontWeight: 600, marginBottom: 12 }}>{item.title}</h3>
              <p style={{ fontSize: 14, color: '#A8A29E', lineHeight: 1.7 }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonios" style={{ padding: '120px 24px', background: 'linear-gradient(180deg, transparent 0%, rgba(217,119,6,0.05) 50%, transparent 100%)' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <span style={{ display: 'inline-block', fontSize: 12, fontWeight: 600, color: '#F59E0B', letterSpacing: '2px', marginBottom: 16 }}>TESTIMONIOS</span>
            <h2 style={{ fontFamily: '"Playfair Display", serif', fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 600, letterSpacing: '-1px' }}>
              Lo que dicen <span style={{ color: '#F59E0B' }}>nuestros clientes</span>
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24 }}>
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="card-hover animate-glow" style={{ background: '#1C1917', borderRadius: 20, padding: 32, border: '1px solid rgba(217,119,6,0.15)' }}>
                <div style={{ display: 'flex', gap: 4, marginBottom: 16 }}>
                  {Array.from({ length: 5 }).map((_, s) => (
                    <Star key={s} style={{ width: 16, height: 16, color: s < t.rating ? '#F59E0B' : '#44403C', fill: s < t.rating ? '#F59E0B' : 'transparent' }} />
                  ))}
                </div>
                <p style={{ fontSize: 15, color: '#D6D3D1', lineHeight: 1.7, fontStyle: 'italic', marginBottom: 20 }}>"{t.text}"</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg, #D97706, #F59E0B)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 16, color: '#0C0A09' }}>
                    {t.name.charAt(0)}
                  </div>
                  <span style={{ fontWeight: 600, fontSize: 14 }}>{t.name}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{ padding: '120px 24px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50%, rgba(217,119,6,0.2), transparent 70%)' }} />
        <div style={{ position: 'relative', zIndex: 1, maxWidth: 700, margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontFamily: '"Playfair Display", serif', fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 700, lineHeight: 1.2, marginBottom: 20, letterSpacing: '-1px' }}>
            ¿Listo para tu<br />
            <span className="text-gradient">primer antojo?</span>
          </h2>
          <p style={{ fontSize: 18, color: '#A8A29E', marginBottom: 40, lineHeight: 1.6 }}>
            Crea tu cuenta en segundos y disfruta de nuestros dulces, refrescos y comida 
            preparados con amor. Delivery y para llevar disponibles.
          </p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/register" style={{ padding: '18px 48px', borderRadius: 100, background: 'linear-gradient(135deg, #D97706, #F59E0B)', color: '#0C0A09', textDecoration: 'none', fontSize: 16, fontWeight: 700, boxShadow: '0 4px 30px rgba(217,119,6,0.5)' }}>
              Crear Cuenta Gratis
            </Link>
            <Link href="/login" style={{ padding: '18px 48px', borderRadius: 100, border: '1px solid rgba(255,255,255,0.2)', color: 'white', textDecoration: 'none', fontSize: 16, fontWeight: 500 }}>
              Iniciar Sesión
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.05)', padding: '48px 24px 32px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 40, marginBottom: 48 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, #D97706, #F59E0B)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Cake style={{ width: 18, height: 18, color: '#0C0A09' }} />
                </div>
                <span style={{ fontFamily: '"Playfair Display", serif', fontSize: 18, fontWeight: 600 }}>Caracaya</span>
              </div>
              <p style={{ fontSize: 14, color: '#A8A29E', lineHeight: 1.6 }}>Dulces, refrescos y comida preparada con amor y los mejores ingredientes desde 2018.</p>
            </div>
            <div>
              <h4 style={{ fontSize: 13, fontWeight: 600, marginBottom: 16, letterSpacing: '0.5px' }}>HORARIO</h4>
              <p style={{ fontSize: 14, color: '#A8A29E' }}>Lun - Vie: 7:00 AM - 10:00 PM</p>
              <p style={{ fontSize: 14, color: '#A8A29E' }}>Sáb - Dom: 8:00 AM - 11:00 PM</p>
            </div>
            <div>
              <h4 style={{ fontSize: 13, fontWeight: 600, marginBottom: 16, letterSpacing: '0.5px' }}>CONTACTO</h4>
              <p style={{ fontSize: 14, color: '#A8A29E' }}>+57 300 123 4567</p>
              <p style={{ fontSize: 14, color: '#A8A29E' }}>Centro Comercial Norte</p>
              <p style={{ fontSize: 14, color: '#A8A29E' }}>Bogotá, Colombia</p>
            </div>
          </div>
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 24, textAlign: 'center' }}>
            <p style={{ fontSize: 13, color: '#57534E' }}>© 2026 Caracaya. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}