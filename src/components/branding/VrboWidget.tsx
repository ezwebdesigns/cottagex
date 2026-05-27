'use client';

import { useEffect } from 'react';

export function VrboSearchWidget() {
  useEffect(() => {
    const existingScript = document.getElementById('vrbo-widget-script');
    if (existingScript) {
      existingScript.remove();
    }

    const script = document.createElement('script');
    script.id = 'vrbo-widget-script';
    script.src = "https://creator.expediagroup.com/products/widgets/assets/eg-widgets.js";
    script.className = "eg-widgets-script";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      const scriptToRemove = document.getElementById('vrbo-widget-script');
      if (scriptToRemove) {
        scriptToRemove.remove();
      }
    };
  }, []);

  return (
    <div className="w-full max-w-4xl bg-white/95 backdrop-blur-md p-4 md:p-6 rounded-[2rem] shadow-2xl border border-blue-50/50 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div 
        className="eg-widget" 
        data-widget="search" 
        data-program="ca-vrbo" 
        data-lobs="stays" 
        data-network="pz" 
        data-camref="1100lpG3d" 
        data-pubref=""
      ></div>
    </div>
  );
}
