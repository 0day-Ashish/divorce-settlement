import { useNavigate } from "@tanstack/react-router";
import { Scale, Wallet, Shield, ArrowRight, Activity, Lock, Users, FileText, Sparkles, Zap, Twitter, Github, Linkedin, Mail, Send, Globe, ChevronDown } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";


import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { CustomCursor } from "@/components/ui/custom-cursor";
import { useRef, useState } from "react";
import { cn } from "@/lib/utils";

export function Home() {
  const navigate = useNavigate();

  const stats = [
    { label: "Secured Volume", value: "$42.8M+", icon: Activity },
    { label: "Verified Users", value: "2.4k+", icon: Users },
    { label: "Avg. Resolution", value: "48h", icon: Zap },
    { label: "Privacy Rating", value: "AAA", icon: Shield },
  ];

  const faqs = [
    {
      title: "What makes this platform unique?",
      content:
        "Unlike traditional settlement tools, we leverage the Midnight Network to ensure that your private data never touches a public ledger. We prioritize human privacy without sacrificing legal certainty.",
    },
    {
      title: "How do Zero-Knowledge Proofs protect me?",
      content:
        "Imagine showing someone you have a key to a house without actually showing them the key or opening the door. ZK-Proofs allow us to verify compliance with settlement terms while keeping the terms themselves completely confidential.",
    },
    {
      title: "Is it difficult to integrate with my existing legal workflow?",
      content:
        "Not at all. Our dashboard is designed to be intuitive for legal professionals and individuals alike. It complements your existing legal processes by providing a secure, immutable record of agreement.",
    },
    {
      title: "What are the costs involved?",
      content:
        "Currently, as we are on the Midnight Testnet, all transactions are free. You only need tDust tokens, which you can receive from our community faucet at no cost.",
    },
  ];

  return (
    <div className="relative min-h-screen mesh-bg selection:bg-blue-500/30 overflow-x-hidden cursor-none">
      <CustomCursor />
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-blue-600/10 rounded-full blur-[120px] animate-subtle-glow" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-600/10 rounded-full blur-[120px] animate-pulse" />
      </div>

      <div className="max-w-[1400px] mx-auto px-6 lg:px-12 pt-8 pb-32">
        {/* Bento Hero Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[85vh] mb-32">
          {/* Main Hero Block (Top Left - Large) */}
          <div className="lg:col-span-8 bg-white/[0.02] border border-white/10 rounded-[2.5rem] p-12 pr-6 flex flex-col justify-center relative overflow-hidden backdrop-blur-2xl group">
             <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-50" />
             <ScrollReveal>
                <div className="inline-flex items-center gap-3 mb-8">
                  <div className="px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-wider backdrop-blur-md">
                     <span className="w-2 h-2 bg-blue-500 rounded-full inline-block mr-2 animate-pulse"></span>
                     Live Protocol
                  </div>
                  <div className="flex gap-2">
                     <Shield className="w-4 h-4 text-white/40" />
                     <Lock className="w-4 h-4 text-white/40" />
                     <FileText className="w-4 h-4 text-white/40" />
                  </div>
                </div>

                <h1 className="text-6xl sm:text-7xl lg:text-8xl font-black tracking-[-0.04em] leading-[0.95] text-white mb-8 font-outfit">
                  Privacy is <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">Human Right.</span>
                </h1>
                
                <p className="text-xl text-white/60 max-w-xl leading-relaxed font-light mb-12">
                  Redefining the architecture of private settlements. Secure, immutable, and mathematically guaranteed by Midnight Network.
                </p>

                <div className="flex flex-wrap gap-4 relative z-10">
                  <Button 
                    size="lg" 
                    onClick={() => navigate({ to: "/settlement" })}
                    className="h-14 px-8 rounded-full bg-white text-black hover:bg-blue-50 font-bold text-lg transition-transform hover:-translate-y-1 cursor-pointer"
                  >
                    Start Settlement <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                  <Button 
                    size="lg" 
                    variant="outline"
                    onClick={() => navigate({ to: "/wallet-ui" })}
                    className="h-14 px-8 rounded-full border-white/10 bg-white/5 hover:bg-white/10 text-white font-bold text-lg backdrop-blur-md cursor-pointer"
                  >
                    Verify Identity <Wallet className="ml-2 w-5 h-5" />
                  </Button>
                </div>
             </ScrollReveal>
          </div>

          {/* Right Column Stack */}
          <div className="lg:col-span-4 flex flex-col gap-6">
             {/* Visual/Status Block */}
             <div className="flex-1 bg-gradient-to-br from-[#0a0a0a] to-[#050505] border border-white/10 rounded-[2.5rem] p-8 flex flex-col justify-between relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 group-hover:bg-purple-500/20 transition-colors duration-700" />
                
                <div className="space-y-4 mb-8">
                   <div className="flex justify-between items-center text-sm font-medium text-white/50 border-b border-white/5 pb-2">
                      <span>Network Status</span>
                      <span className="text-green-400 flex items-center gap-2"><span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" /> Online</span>
                   </div>
                   <div className="flex justify-between items-center text-sm font-medium text-white/50 border-b border-white/5 pb-2">
                      <span>Latest Block</span>
                      <span className="font-mono text-white/80">#12,405,291</span>
                   </div>
                   <div className="flex justify-between items-center text-sm font-medium text-white/50 border-b border-white/5 pb-2">
                      <span>Prover Time</span>
                      <span className="font-mono text-white/80">~42ms</span>
                   </div>
                </div>

                <div className="relative h-40 w-full bg-white/5 rounded-2xl overflow-hidden border border-white/5">
                   {/* Simulated Activity Graph */}
                   <div className="absolute inset-0 flex items-end justify-between px-2 pb-2 gap-1 opacity-50">
                      {[40, 70, 45, 90, 60, 80, 50, 95, 30, 60, 85, 45].map((h, i) => (
                         <div key={i} className="w-full bg-blue-500/80 rounded-t-sm transition-all duration-1000 animate-pulse" style={{ height: `${h}%`, animationDelay: `${i * 100}ms` }} />
                      ))}
                   </div>
                </div>
             </div>

             {/* Stats Mosaic */}
             <div className="grid grid-cols-2 gap-4 h-48">
                {stats.slice(0, 2).map((stat, i) => (
                   <div key={i} className="bg-white/5 border border-white/10 rounded-[2rem] p-6 flex flex-col justify-center items-center hover:bg-white/10 transition-colors cursor-pointer group">
                      <stat.icon className="w-6 h-6 text-blue-400 mb-3 group-hover:scale-110 transition-transform" />
                      <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
                      <div className="text-[10px] text-white/40 uppercase tracking-wider text-center">{stat.label}</div>
                   </div>
                ))}
             </div>
          </div>
        </div>

        {/* Asymmetric Feature Layout - Holographic Upgrade */}
        <div className="mb-40">
           <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-5 flex flex-col justify-center">
                 <ScrollReveal>
                    <h2 className="text-5xl font-black text-white mb-6 leading-tight">High Integrity. <br /><span className="text-blue-500">Zero Trust.</span></h2>
                    <p className="text-white/50 text-lg mb-8 max-w-md">
                       Built for a world where privacy is no longer optional. We employ advanced cryptography to prove everything without revealing anything.
                    </p>
                    
                    <SpotlightCard className="h-80 p-8 flex flex-col justify-between">
                       <div className="absolute inset-0 bg-blue-500/5 group-hover:bg-blue-500/10 transition-colors duration-500" />
                       <div className="relative z-10">
                          <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center mb-6">
                             <Lock className="w-6 h-6 text-blue-400" />
                          </div>
                          <h3 className="text-3xl font-bold text-white mb-2">Identity Guard</h3>
                          <p className="text-white/50 leading-relaxed">
                             Prove your status without ever revealing your underlying identity. The ultimate layer of personal defense.
                          </p>
                       </div>
                       {/* Scanning Animation */}
                       <div className="absolute inset-0 overflow-hidden rounded-[2.5rem]">
                          <div className="absolute top-0 left-0 w-full h-[2px] bg-blue-400/50 shadow-[0_0_15px_rgba(96,165,250,0.8)] animate-scan" />
                       </div>
                    </SpotlightCard>
                 </ScrollReveal>
              </div>

              <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6 content-center">
                 <ScrollReveal delay={0.2} direction="up" className="sm:translate-y-12">
                     <SpotlightCard className="p-8 h-64 flex flex-col justify-center bg-[#0a0a0a]/90">
                        <Scale className="w-8 h-8 text-purple-400 mb-4" />
                        <h3 className="text-xl font-bold text-white mb-2">Proof of Accord</h3>
                        <p className="text-sm text-white/50">Mathematical confirmation of terms. Tamper-proof and globally recognized.</p>
                     </SpotlightCard>
                 </ScrollReveal>
                 
                 <ScrollReveal delay={0.4} direction="up">
                    <SpotlightCard className="p-8 h-64 flex flex-col justify-center bg-[#0a0a0a]/90">
                       <Zap className="w-8 h-8 text-yellow-400 mb-4" />
                       <h3 className="text-xl font-bold text-white mb-2">Instant Finality</h3>
                       <p className="text-sm text-white/50">No waiting for confirmations. Real-time verification on the Midnight layer.</p>
                    </SpotlightCard>
                 </ScrollReveal>

                 <ScrollReveal delay={0.3} direction="up" className="sm:col-span-2">
                    <SpotlightCard className="p-10 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
                       <div className="absolute inset-0 bg-grid-white/[0.02] [mask-image:linear-gradient(to_bottom,transparent,black)]" />
                       {/* Matrix/Data Stream Effect */}
                       <div className="absolute inset-0 opacity-20 pointer-events-none">
                          <div className="absolute top-[-50%] left-[20%] w-px h-[200%] bg-gradient-to-b from-transparent via-green-500 to-transparent opacity-50 animate-matrix" style={{ animationDuration: '3s' }} />
                          <div className="absolute top-[-50%] left-[50%] w-px h-[200%] bg-gradient-to-b from-transparent via-green-500 to-transparent opacity-30 animate-matrix" style={{ animationDuration: '5s', animationDelay: '1s' }} />
                          <div className="absolute top-[-50%] left-[80%] w-px h-[200%] bg-gradient-to-b from-transparent via-green-500 to-transparent opacity-40 animate-matrix" style={{ animationDuration: '4s', animationDelay: '0.5s' }} />
                       </div>

                       <div className="relative z-10 w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center shrink-0 border border-white/10 shadow-[0_0_30px_-5px_rgba(255,255,255,0.1)]">
                          <Shield className="w-8 h-8 text-white" />
                       </div>
                       <div className="relative z-10">
                          <h3 className="text-2xl font-bold text-white mb-2">Military-Grade Encryption</h3>
                          <p className="text-white/40">Utilizing zk-SNARKs technology to ensure your data remains your own, always.</p>
                       </div>
                    </SpotlightCard>
                 </ScrollReveal>
              </div>
           </div>
        </div>

        {/* Sophisticated FAQ - Holographic Knowledge Base */}
        <div className="max-w-4xl mx-auto mb-40 relative">
           <ScrollReveal>
             <div className="text-center mb-16">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-bold uppercase tracking-wider mb-6">
                   <Sparkles className="w-4 h-4" /> Knowledge Base
                </div>
                <h2 className="text-5xl font-black text-white mb-6">Protocol Insights</h2>
                <p className="text-white/40 max-w-lg mx-auto">Everything you need to know about the Midnight architecture and zero-knowledge proofs.</p>
             </div>

             <div className="space-y-4">
                <Accordion type="single" collapsible className="space-y-4">
                   {faqs.map((faq, i) => (
                      <AccordionItem key={i} value={`item-${i}`} className="border-none">
                         <div className="group rounded-[2rem] bg-white/[0.02] border border-white/5 overflow-hidden transition-all duration-300 data-[state=open]:bg-white/[0.04] data-[state=open]:border-blue-500/30 data-[state=open]:shadow-[0_0_30px_-10px_rgba(59,130,246,0.2)]">
                            <AccordionTrigger className="px-8 py-6 hover:no-underline hover:bg-white/[0.02]">
                               <span className="text-xl font-bold text-white text-left group-data-[state=open]:text-blue-400 transition-colors">
                                  {faq.title}
                               </span>
                            </AccordionTrigger>
                            <AccordionContent className="px-8 pb-8 pt-2">
                               <p className="text-white/60 leading-relaxed text-lg">
                                  {faq.content}
                               </p>
                            </AccordionContent>
                         </div>
                      </AccordionItem>
                   ))}
                </Accordion>
             </div>
           </ScrollReveal>
        </div>

        {/* Enhanced Footer */}
        <footer className="pt-32 pb-12 border-t border-white/5 relative z-10 overflow-hidden">
           <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent opacity-50" />
           <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[1000px] h-[400px] bg-blue-600/5 rounded-full blur-[120px] pointer-events-none" />
           
           <div className="grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-24 mb-24 relative z-10">
              {/* Brand Column */}
              <div className="md:col-span-5 lg:col-span-4">
                 <ScrollReveal>
                   <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/20">
                         <Shield className="w-6 h-6 text-white" />
                      </div>
                      <span className="text-2xl font-black text-white tracking-tight">Midnight</span>
                   </div>
                   <p className="text-white/40 mb-8 leading-relaxed max-w-sm">
                      The privacy-first platform for verifiable settlements. 
                      Built on the Midnight Network to ensure your data remains yours, forever.
                   </p>
                   <div className="flex gap-4">
                      <a href="#" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/60 hover:text-white hover:bg-blue-600 hover:border-blue-500 transition-all duration-300">
                         <Twitter className="w-4 h-4" />
                      </a>
                      <a href="#" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/60 hover:text-white hover:bg-gray-800 hover:border-white/20 transition-all duration-300">
                         <Github className="w-4 h-4" />
                      </a>
                      <a href="#" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/60 hover:text-white hover:bg-blue-700 hover:border-blue-600 transition-all duration-300">
                         <Linkedin className="w-4 h-4" />
                      </a>
                   </div>
                 </ScrollReveal>
              </div>
              
              {/* Links Column */}
              <div className="md:col-span-3 lg:col-span-2">
                 <ScrollReveal delay={0.1}>
                   <h4 className="text-white font-bold mb-8">Platform</h4>
                   <ul className="space-y-4">
                      {['Settlement', 'Wallet', 'Verify', 'Dashboard'].map((item) => (
                         <li key={item}>
                            <a href="#" className="text-white/40 hover:text-blue-400 transition-colors flex items-center gap-2 group">
                               <span className="w-1 h-1 bg-blue-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                               {item}
                            </a>
                         </li>
                      ))}
                   </ul>
                 </ScrollReveal>
              </div>

               {/* Legal Column */}
               <div className="md:col-span-3 lg:col-span-2">
                 <ScrollReveal delay={0.2}>
                   <h4 className="text-white font-bold mb-8">Legal</h4>
                   <ul className="space-y-4">
                      {['Privacy Policy', 'Terms of Service', 'Cookie Policy', 'Compliance'].map((item) => (
                         <li key={item}>
                            <a href="#" className="text-white/40 hover:text-blue-400 transition-colors">
                               {item}
                            </a>
                         </li>
                      ))}
                   </ul>
                 </ScrollReveal>
              </div>
              
              {/* Newsletter Column */}
              <div className="md:col-span-5 lg:col-span-4">
                 <ScrollReveal delay={0.3}>
                   <h4 className="text-white font-bold mb-8">Stay Updated</h4>
                   <p className="text-white/40 mb-6 text-sm">Join our newsletter for the latest updates on zero-knowledge technology.</p>
                   <div className="relative">
                      <input 
                         type="email" 
                         placeholder="Enter your email" 
                         className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 pr-12 text-white placeholder:text-white/20 focus:outline-none focus:border-blue-500/50 focus:bg-white/[0.07] transition-all"
                      />
                      <button className="absolute right-2 top-2 p-2 bg-blue-600 rounded-lg text-white hover:bg-blue-500 transition-colors">
                         <ArrowRight className="w-4 h-4" />
                      </button>
                   </div>
                 </ScrollReveal>
              </div>
           </div>
           
           {/* Bottom Bar */}
           <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 relative z-10">
              <p className="text-white/20 text-sm">© 2026 Midnight Protocol. All rights reserved.</p>
              <div className="flex items-center gap-6">
                 <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-xs font-bold text-green-500 uppercase tracking-wider">All Systems Operational</span>
                 </div>
                 <div className="flex gap-4 text-white/20">
                    <Globe className="w-4 h-4 hover:text-white transition-colors cursor-pointer" />
                 </div>
              </div>
           </div>
        </footer>
      </div>
    </div>
  );
}


function FeatureCard({ icon: Icon, title, description }: any) {
  return (
    <div className="group card-glint relative p-12 rounded-[3.5rem] bg-[#080808] border border-white/5 backdrop-blur-3xl hover:border-blue-500/30 transition-all duration-1000">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
      <div className="relative z-10">
        <div className="w-16 h-16 rounded-3xl bg-white/[0.03] border border-white/10 flex items-center justify-center mb-10 group-hover:rotate-6 transition-transform duration-700">
          <Icon className="w-7 h-7 text-blue-500" />
        </div>
        <h3 className="text-3xl font-black text-white mb-6 tracking-tight">{title}</h3>
        <p className="text-white/40 leading-relaxed text-lg font-medium">
          {description}
        </p>
      </div>
    </div>
  )
}

function SpotlightCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const divRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!divRef.current) return;
    const rect = divRef.current.getBoundingClientRect();
    setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  return (
    <div
      ref={divRef}
      onMouseMove={handleMouseMove}
      className={cn(
        "relative rounded-[2.5rem] border border-white/10 bg-[#0a0a0a]/80 overflow-hidden group",
        className
      )}
    >
      <div
        className="pointer-events-none absolute -inset-px opacity-0 transition duration-300 group-hover:opacity-100"
        style={{
          background: `radial-gradient(600px circle at ${position.x}px ${position.y}px, rgba(255,255,255,0.06), transparent 40%)`,
        }}
      />
      <div className="relative h-full">{children}</div>
    </div>
  );
}
