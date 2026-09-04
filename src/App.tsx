import React, { useState } from 'react';
import { useEcosystem } from './store';
import BackgroundMesh from './components/BackgroundMesh';
import CommandBar from './components/CommandBar';
import AgentRosterDrawer from './components/AgentRosterDrawer';
import Gateway from './views/Gateway';
import AegisGenerator from './views/AegisGenerator';
import RevenueEngine from './views/RevenueEngine';
import PaymentsCheckoutView from './views/PaymentsCheckoutView';
import { AnimatePresence, motion } from 'motion/react';

export default function App() {
  const { activeView } = useEcosystem();
  const [rosterOpen, setRosterOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-950 font-sans text-slate-200 selection:bg-indigo-500/30 overflow-x-hidden">
      <BackgroundMesh />
      
      <CommandBar onOpenRoster={() => setRosterOpen(true)} />
      <AgentRosterDrawer isOpen={rosterOpen} onClose={() => setRosterOpen(false)} />

      <main className="relative pt-16">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeView}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ type: 'spring', mass: 0.8, stiffness: 120, damping: 14 }}
            className="w-full h-full"
          >
            {activeView === 'gateway' && <Gateway />}
            {activeView === 'aegis' && <AegisGenerator />}
            {activeView === 'revenue' && <RevenueEngine />}
            {activeView === 'payments' && <PaymentsCheckoutView />}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
