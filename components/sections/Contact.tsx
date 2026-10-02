"use client"

import React, { useState } from 'react'

export default function Contact() {
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus('submitting');

    const form = e.currentTarget;
    const data = new FormData(form);

    try {
      const response = await fetch('https://formspree.io/f/xnpnwzwn', {
        method: 'POST',
        body: data,
        headers: {
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        setStatus('success');
        form.reset();
      } else {
        setStatus('error');
      }
    } catch (error) {
      setStatus('error');
    }
  };

  return (
    <section id="contact" className="bg-[#FEFDF9] pt-20 pb-10 md:pt-28 md:pb-16 relative">
      <style>{`
        @keyframes scaleUpFade {
          from { opacity: 0; transform: scale(0.95) translateY(10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes drawCheck {
          from { stroke-dashoffset: 50; }
          to { stroke-dashoffset: 0; }
        }
        .animate-success-container {
          animation: scaleUpFade 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .animate-check-path {
          stroke-dasharray: 50;
          stroke-dashoffset: 50;
          animation: drawCheck 0.6s cubic-bezier(0.65, 0, 0.45, 1) 0.2s forwards;
        }
      `}</style>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-start">
          <div className="flex flex-col gap-10">
            <div>
              <div className="w-8 h-1 bg-[#2F6B4A] rounded-full mb-8"></div>
              <h2 className="font-serif text-4xl md:text-5xl font-bold text-[#0F2A1D] mb-5 leading-tight">
                Let's get in touch.
              </h2>
              <p className="text-[#0F2A1D]/90 font-medium text-base md:text-lg max-w-md leading-relaxed">
                Whether you have a question about our initiatives, want to collaborate, or just want to say hello, we are always ready to listen.
              </p>
            </div>

            <div className="flex flex-col items-center md:items-start gap-8 pt-8 border-t border-[#0F2A1D]/10 text-center md:text-left">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#2F6B4A] mb-2">
                  Email Us
                </p>
                <a 
                  href="mailto:info@titanleos.org" 
                  className="font-serif text-lg md:text-xl font-medium text-[#0F2A1D] hover:text-[#2F6B4A] transition-colors"
                >
                  info@titanleos.org
                </a>
              </div>

              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#2F6B4A] mb-2">
                  Call Us
                </p>
                <a 
                  href="tel:+94705821820" 
                  className="font-serif text-lg md:text-xl font-medium text-[#0F2A1D] hover:text-[#2F6B4A] transition-colors"
                >
                  +94 70 582 1820
                </a>
              </div>
            </div>
          </div>

          <div className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-[0_4px_40px_rgb(0,0,0,0.03)] border border-[#0F2A1D]/5 min-h-[500px] flex flex-col justify-center">
            {status === 'success' ? (
              <div className="animate-success-container flex flex-col items-center justify-center text-center py-8">
                <div className="w-20 h-20 bg-[#2F6B4A]/10 text-[#2F6B4A] rounded-full flex items-center justify-center mb-8 relative">
                  <div className="absolute inset-0 rounded-full bg-[#2F6B4A]/20 animate-ping opacity-20" style={{ animationDuration: '2s' }}></div>
                  <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path 
                      className="animate-check-path"
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2.5} 
                      d="M5 13l4 4L19 7" 
                    />
                  </svg>
                </div>
                <h3 className="font-serif text-3xl font-bold text-[#0F2A1D] mb-3">Message Sent!</h3>
                <p className="text-[#0F2A1D]/70 mb-10 text-lg">Thank you for reaching out. We will get back to you.</p>
                <button 
                  onClick={() => setStatus('idle')}
                  className="text-xs font-bold uppercase tracking-widest text-[#2F6B4A] hover:text-[#0F2A1D] transition-colors"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                
                <div className="flex flex-col gap-2">
                  <label htmlFor="name" className="pl-4 text-[11px] font-bold uppercase tracking-widest text-[#0F2A1D]/80">
                    Full Name
                  </label>
                  <input 
                    type="text" 
                    id="name" 
                    name="name" 
                    required 
                    disabled={status === 'submitting'}
                    className="w-full bg-[#FEFDF9] border border-[#0F2A1D]/10 rounded-full px-6 py-4 text-[#0F2A1D] text-sm placeholder:text-[#0F2A1D]/30 focus:outline-none focus:border-[#2F6B4A] focus:ring-1 focus:ring-[#2F6B4A] transition-all disabled:opacity-50"
                    placeholder="Your Name"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label htmlFor="email" className="pl-4 text-[11px] font-bold uppercase tracking-widest text-[#0F2A1D]/80">
                    Email Address
                  </label>
                  <input 
                    type="email" 
                    id="email" 
                    name="email" 
                    required 
                    disabled={status === 'submitting'}
                    className="w-full bg-[#FEFDF9] border border-[#0F2A1D]/10 rounded-full px-6 py-4 text-[#0F2A1D] text-sm placeholder:text-[#0F2A1D]/30 focus:outline-none focus:border-[#2F6B4A] focus:ring-1 focus:ring-[#2F6B4A] transition-all disabled:opacity-50"
                    placeholder="Your Email"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label htmlFor="message" className="pl-4 text-[11px] font-bold uppercase tracking-widest text-[#0F2A1D]/80">
                    Your Message
                  </label>
                  <textarea 
                    id="message" 
                    name="message" 
                    rows={5} 
                    required 
                    disabled={status === 'submitting'}
                    className="w-full bg-[#FEFDF9] border border-[#0F2A1D]/10 rounded-[2rem] px-6 py-5 text-[#0F2A1D] text-sm placeholder:text-[#0F2A1D]/30 focus:outline-none focus:border-[#2F6B4A] focus:ring-1 focus:ring-[#2F6B4A] transition-all resize-none disabled:opacity-50"
                    placeholder="How can we help you today?"
                  ></textarea>
                </div>

                {status === 'error' && (
                  <p className="text-red-600 text-sm font-medium pl-4">Something went wrong. Please try again later.</p>
                )}

                <div className="pt-2">
                  <button 
                    type="submit" 
                    disabled={status === 'submitting'}
                    className="group flex w-full items-center justify-center gap-2 rounded-full bg-[#2F6B4A] px-8 py-4 text-sm font-bold text-white transition-all hover:bg-[#25573C] hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2F6B4A] focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {status === 'submitting' ? (
                      <span className="flex items-center gap-2">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Sending...
                      </span>
                    ) : 'Send Message'}
                  </button>
                </div>
              </form>
            )}
          </div>

        </div>
      </div>
    </section>
  )
}
