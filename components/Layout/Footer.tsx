
import React from 'react';

export const Footer = ({ simple }: { simple?: boolean }) => (
  <footer className="fixed bottom-0 left-0 right-0 bg-black/80 backdrop-blur-sm border-t border-white/5 py-3 text-center z-40">
    <p className="text-zinc-600 text-[10px]">© 2025 LOG AI Inc. All rights reserved.</p>
  </footer>
);
