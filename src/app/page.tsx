'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Clock, MapPin, Phone, ChevronDown, Star, Users, Award, Cookie, Cake } from 'lucide-react';
import { FEATURED_PRODUCTS, TESTIMONIALS } from '@/data/landing-data';

const ICONS: Record<string, React.ComponentType<{ className?: string; style?: object }>> = {
  Clock, MapPin, Phone, Award, Cookie, Users, Cake
};

export default function LandingPage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToContent = () => {
    document.getElementById('discover')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="bg-dark-900 text-stone-100 font-sans overflow-x-hidden">
      <style jsx global>{`
        
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
        
        .grain-overlay::before {
          content: '';
          position: absolute;
          top: -50%; left: -50%;
          width: 200%; height: 200%;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.08'/%3E%3C/svg%3E");
          animation: grain 8s steps(10) infinite;
          pointer-events: none;
        }
        
        .text-gradient {
          background: linear-gradient(135deg, #D97706 0%, #F59E0B 50%, #D97706 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
      `}</style>

      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 py-4 px-6 transition-all duration-400 ${
        scrollY > 50 ? 'bg-dark-900/95 backdrop-blur-xl border-b border-amber-600/20' : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-600 to-amber-500 flex items-center justify-center">
              <Cake className="w-5 h-5 text-dark-900" />
            </div>
            <span className="font-display text-xl font-semibold tracking-tight">Caraballo</span>
          </div>
          
          <div className="flex items-center gap-8">
            <div className="hidden md:flex gap-8">
              {['Nosotros', 'Menú', 'Testimonios'].map(item => (
                <a 
                  key={item} 
                  href={`#${item.toLowerCase()}`} 
                  className="text-stone-400 text-sm font-medium hover:text-amber-500 transition-colors duration-300 cursor-pointer"
                >
                  {item}
                </a>
              ))}
            </div>
            <div className="flex gap-3">
              <Link 
                href="/login" 
                className="px-6 py-2.5 rounded-full border border-amber-600/50 text-amber-500 text-sm font-medium hover:bg-amber-600/10 transition-all duration-300"
              >
                Iniciar Sesión
              </Link>
              <Link 
                href="/register" 
                className="px-6 py-2.5 rounded-full bg-gradient-to-r from-amber-600 to-amber-500 text-dark-900 text-sm font-semibold hover:scale-105 transition-transform duration-300"
              >
                Regístrate
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section ref={heroRef} className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 grain-overlay" />
        <div className="absolute inset-0">
          <div 
            className="absolute inset-0 bg-cover bg-center opacity-25"
            style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=1920&h=1080&fit=crop)', transform: `translateY(${scrollY * 0.3}px)` }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-dark-900/30 via-dark-900/70 to-dark-900" />
        </div>

        <div className="relative z-10 text-center max-w-4xl px-6">
          <div className="animate-fade-in-up opacity-0 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-600/15 border border-amber-600/30 mb-8">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span className="text-xs font-medium text-amber-500 tracking-wide">DESDE 2018 — DULCES, REFRESCOS Y COMIDA</span>
          </div>
          
          <h1 className="animate-fade-in-up opacity-0 font-display text-5xl md:text-7xl font-bold leading-tight mb-6 tracking-tight" style={{ animationDelay: '0.2s' }}>
            Dulces, Refrescos<br />
            <span className="text-gradient">y Más</span>
          </h1>
          
          <p className="animate-fade-in-up opacity-0 text-lg md:text-xl text-stone-400 max-w-xl mx-auto mb-10 leading-relaxed" style={{ animationDelay: '0.4s' }}>
            Dulces artesanales, refrescos naturales y comida deliciosa, 
            preparados cada día con ingredientes frescos y mucho amor.
          </p>
          
          <div className="animate-fade-in-up opacity-0 flex gap-4 justify-center flex-wrap" style={{ animationDelay: '0.6s' }}>
            <Link 
              href="/register" 
              className="px-10 py-4 rounded-full bg-gradient-to-r from-amber-600 to-amber-500 text-dark-900 font-semibold shadow-lg shadow-amber-600/40 hover:scale-105 transition-transform"
            >
              Crear Cuenta Gratis
            </Link>
            <Link 
              href="/login" 
              className="px-10 py-4 rounded-full border border-white/20 text-white font-medium hover:bg-white/10 transition-colors"
            >
              Ya tengo cuenta
            </Link>
          </div>
        </div>

        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10 animate-float">
          <button onClick={scrollToContent} className="bg-none border-none cursor-pointer flex flex-col items-center gap-2 text-stone-400">
            <span className="text-xs tracking-widest">DESCUBRIR</span>
            <ChevronDown className="w-5 h-5" />
          </button>
        </div>
      </section>

      {/* Info Bar */}
      <section className="bg-amber-600/8 border-y border-amber-600/15 py-12 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          {[
            { icon: Clock, title: '7:00 AM - 10:00 PM', subtitle: 'Todos los días' },
            { icon: MapPin, title: 'Centro Comercial Norte', subtitle: 'Bogotá, Colombia' },
            { icon: Phone, title: '+57 300 123 4567', subtitle: 'Llámanos para reservas' },
            { icon: Award, title: 'Ingredientes Frescos', subtitle: 'Calidad garantizada' },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-amber-600/15 flex items-center justify-center flex-shrink-0">
                <item.icon className="w-6 h-6 text-amber-500" />
              </div>
              <div>
                <p className="font-semibold text-sm mb-0.5">{item.title}</p>
                <p className="text-sm text-stone-400">{item.subtitle}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* About Section */}
      <section id="nosotros" className="py-36 px-6 max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-20 items-center">
          <div className="relative rounded-2xl overflow-hidden group">
            <div className="relative h-[500px]">
              <Image
                src="https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&h=700&fit=crop"
                alt="Dulces"
                fill
                priority
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
            <div className="absolute -bottom-5 -right-5 w-44 h-44 rounded-2xl bg-gradient-to-br from-amber-600 to-amber-500 flex flex-col items-center justify-center shadow-xl">
              <span className="font-display text-5xl font-bold text-dark-900 leading-none">7+</span>
              <span className="text-sm text-amber-700 font-medium mt-1">Años de</span>
              <span className="text-sm font-semibold text-amber-700">Excelencia</span>
            </div>
          </div>

          <div>
            <span className="inline-block text-xs font-semibold text-amber-500 tracking-widest mb-4">NUESTRA HISTORIA</span>
            <h2 className="font-display text-4xl md:text-5xl font-semibold leading-tight mb-6 tracking-tight">
              Más que dulces,<br />
              <span className="text-amber-500">creamos sonrisas</span>
            </h2>
            <p className="text-stone-400 leading-relaxed mb-4">
              En Caraballo, cada dulce es elaborado con ingredientes de la mejor calidad. 
              Nuestros postres, refrescos y comidas se preparan diariamente con receta 
              tradicionales y un toque especial.
            </p>
            <p className="text-stone-400 leading-relaxed mb-8">
              Con más de 7 años deleitando a nuestros clientes, hemos convertido a Caraballo 
              en el lugar favorito para satisfacer esos antojos dulces.
            </p>

            <div className="grid grid-cols-2 gap-6">
              {[
                { number: '15K+', label: 'Clientes felices' },
                { number: '100+', label: 'Recetas dulces' },
                { number: '3', label: 'Refrescos naturales' },
                { number: '98%', label: 'Satisfacción' },
              ].map((stat, i) => (
                <div key={i}>
                  <span className="font-display text-2xl font-bold text-amber-500">{stat.number}</span>
                  <p className="text-sm text-stone-400 mt-0.5">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section id="menú" className="py-20 bg-gradient-to-b from-amber-600/5 to-transparent px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-block text-xs font-semibold text-amber-500 tracking-widest mb-4">NUESTRO MENÚ</span>
            <h2 className="font-display text-4xl md:text-5xl font-semibold tracking-tight">
              Productos <span className="text-amber-500">Destacados</span>
            </h2>
            <p className="text-stone-400 mt-3 max-w-md mx-auto">
              Los favoritos de nuestros clientes, preparados con los mejores ingredientes y recetas tradicionales.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {FEATURED_PRODUCTS.map((product, i) => (
              <div key={i} className="bg-dark-800 rounded-2xl overflow-hidden border border-white/5 hover:-translate-y-3 hover:shadow-2xl transition-all duration-400 group">
                <div className="relative h-60 overflow-hidden">
                  <Image 
                    src={product.image} 
                    alt={product.name} 
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-600"
                  />
                  {product.popular && (
                    <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-gradient-to-r from-amber-600 to-amber-500 flex items-center gap-1">
                      <Star className="w-3 h-3 fill-dark-900 text-dark-900" />
                      <span className="text-xs font-bold text-dark-900">POPULAR</span>
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <h3 className="font-display text-xl font-semibold mb-2">{product.name}</h3>
                  <p className="text-sm text-stone-400 mb-5 line-clamp-2">{product.description}</p>
                  <div className="flex justify-between items-center">
                    <span className="font-display text-2xl font-bold text-amber-500">${product.price.toFixed(2)}</span>
                    <Link 
                      href="/register" 
                      className="px-5 py-2.5 rounded-full bg-amber-600/15 text-amber-500 text-sm font-semibold hover:bg-amber-600/30 transition-colors"
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
      <section className="py-24 px-6 max-w-7xl mx-auto">
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { icon: Cookie, title: 'Dulces Artesanales', desc: 'Postres elaborados con ingredientes frescos y recetas tradicionales que cambian cada día para sorprenderte.' },
            { icon: Users, title: 'Equipo Experto', desc: 'Nuestros reposteros tienen años de experiencia creando los dulces más deliciosos de la zona.' },
            { icon: Award, title: 'Calidad Garantizada', desc: 'Usamos ingredientes de primera calidad y procesos de control estrictos para garantizar frescura.' },
          ].map((item, i) => (
            <div key={i} className="bg-dark-800 rounded-2xl p-10 text-center border border-white/5 hover:-translate-y-3 hover:shadow-2xl transition-all duration-400">
              <div className="w-18 h-18 rounded-2xl bg-gradient-to-br from-amber-600/20 to-amber-500/10 flex items-center justify-center mx-auto mb-6">
                <item.icon className="w-8 h-8 text-amber-500" />
              </div>
              <h3 className="font-display text-xl font-semibold mb-3">{item.title}</h3>
              <p className="text-sm text-stone-400 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonios" className="py-30 bg-gradient-to-b from-transparent via-amber-600/5 to-transparent px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-block text-xs font-semibold text-amber-500 tracking-widest mb-4">TESTIMONIOS</span>
            <h2 className="font-display text-4xl md:text-5xl font-semibold tracking-tight">
              Lo que dicen <span className="text-amber-500">nuestros clientes</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="bg-dark-800 rounded-2xl p-8 border border-amber-600/15 hover:-translate-y-3 hover:shadow-2xl transition-all duration-400">
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: 5 }).map((_, s) => (
                    <Star key={s} className={`w-4 h-4 ${s < t.rating ? 'text-amber-500 fill-amber-500' : 'text-stone-600'}`} />
                  ))}
                </div>
                <p className="text-stone-300 leading-relaxed italic mb-5">&quot;{t.text}&quot;</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-600 to-amber-500 flex items-center justify-center font-bold text-dark-900">
                    {t.name.charAt(0)}
                  </div>
                  <span className="font-semibold text-sm">{t.name}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-30 relative overflow-hidden px-6">
        <div className="absolute inset-0 bg-radial-gradient from-amber-600/20 to-transparent" style={{ background: 'radial-gradient(ellipse at 50%, rgba(217,119,6,0.2), transparent 70%)' }} />
        <div className="relative z-10 max-w-2xl mx-auto text-center">
          <h2 className="font-display text-4xl md:text-5xl font-bold leading-tight mb-5 tracking-tight">
            ¿Listo para tu<br />
            <span className="text-gradient">primer antojo?</span>
          </h2>
          <p className="text-lg text-stone-400 mb-10 leading-relaxed">
            Crea tu cuenta en segundos y disfruta de nuestros dulces, refrescos y comida 
            preparados con amor. Delivery y para llevar disponibles.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link 
              href="/register" 
              className="px-12 py-4.5 rounded-full bg-gradient-to-r from-amber-600 to-amber-500 text-dark-900 font-bold shadow-lg shadow-amber-600/50 hover:scale-105 transition-transform"
            >
              Crear Cuenta Gratis
            </Link>
            <Link 
              href="/login" 
              className="px-12 py-4.5 rounded-full border border-white/20 text-white font-medium hover:bg-white/10 transition-colors"
            >
              Iniciar Sesión
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-10 mb-12">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-600 to-amber-500 flex items-center justify-center">
                  <Cake className="w-4 h-4 text-dark-900" />
                </div>
                <span className="font-display text-lg font-semibold">Caraballo</span>
              </div>
              <p className="text-sm text-stone-400 leading-relaxed">Dulces, refrescos y comida preparada con amor y los mejores ingredientes desde 2018.</p>
            </div>
            <div>
              <h4 className="text-xs font-semibold mb-4 tracking-wide">HORARIO</h4>
              <p className="text-sm text-stone-400">Lun - Vie: 7:00 AM - 10:00 PM</p>
              <p className="text-sm text-stone-400">Sáb - Dom: 8:00 AM - 11:00 PM</p>
            </div>
            <div>
              <h4 className="text-xs font-semibold mb-4 tracking-wide">CONTACTO</h4>
              <p className="text-sm text-stone-400">+57 300 123 4567</p>
              <p className="text-sm text-stone-400">Centro Comercial Norte</p>
              <p className="text-sm text-stone-400">Bogotá, Colombia</p>
            </div>
          </div>
          <div className="border-t border-white/5 pt-6 text-center">
            <p className="text-xs text-stone-600">© 2026 Caraballo. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}