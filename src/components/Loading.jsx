import React from 'react';

const PageLoading = () => {
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-[#050506]">
      <div className="relative flex flex-col items-center">
        
        {/* Logo Minimalista */}
        <div className="mb-8 overflow-hidden relative">
          <h1 className="text-xl font-black tracking-[0.3em] text-white opacity-90 uppercase">
            Print<span className="text-sky-500">Log</span>
          </h1>
          {/* Linha de "scan" que passa pelo texto */}
          <div className="h-[1px] w-full bg-sky-500/50 shadow-[0_0_8px_#0ea5e9] animate-scan-slow mt-1"></div>
        </div>

        {/* Loader de Camadas (Simulando impressão 3D) */}
        <div className="flex flex-col gap-1.5 w-12">
          {[0, 200, 400].map((delay) => (
            <div key={delay} className="h-[2px] w-full bg-sky-500/10 overflow-hidden rounded-full">
              <div 
                className="h-full bg-sky-500 animate-loading-bar" 
                style={{ animationDelay: `${delay}ms` }}
              ></div>
            </div>
          ))}
        </div>

      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes scan-slow {
          0% { transform: translateX(-100%); opacity: 0; }
          50% { opacity: 1; }
          100% { transform: translateX(100%); opacity: 0; }
        }
        @keyframes loading-bar {
          0% { transform: translateX(-100%); }
          50% { transform: translateX(0); }
          100% { transform: translateX(100%); }
        }
        .animate-scan-slow {
          animation: scan-slow 2s linear infinite;
        }
        .animate-loading-bar {
          animation: loading-bar 2s ease-in-out infinite;
        }
      `}} />
    </div>
  );
};

export default PageLoading;