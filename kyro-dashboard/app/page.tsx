'use client';

import { useEffect, useState } from 'react';
import { supabase, UserPoints } from '../lib/supabase';
import { motion } from 'framer-motion';
import { Trophy, Scale, Users, Medal, Crown, Sparkles } from 'lucide-react';

export default function Dashboard() {
  const [leaderboard, setLeaderboard] = useState<UserPoints[]>([]);
  const [stats, setStats] = useState({ totalWeight: 0, totalUsers: 0, totalPickups: 0 });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      // 1. Get Leaderboard (Top 50)
      const { data: leaderData } = await supabase
        .from('user_points')
        .select('*')
        .order('total_points', { ascending: false })
        .limit(50);

      // 2. Calculate Global Impact Stats
      const { data: pickupData } = await supabase
        .from('pickup_requests')
        .select('quantity_kg')
        .eq('verification_status', 'verified');
      
      const totalWeight = pickupData?.reduce((acc, curr) => acc + Number(curr.quantity_kg), 0) || 0;
      const totalPickups = pickupData?.length || 0;

      setLeaderboard(leaderData || []);
      setStats({ 
        totalWeight: Math.round(totalWeight), 
        totalUsers: leaderData?.length || 0,
        totalPickups 
      });
      setIsLoading(false);
    }

    fetchData();
    
    // Real-time subscription for leaderboard updates
    const channel = supabase
      .channel('leaderboard-updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'user_points' }, () => {
        fetchData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <main className="min-h-screen bg-[#0B1120] text-white selection:bg-emerald-500/30 font-sans relative overflow-hidden flex flex-col">
      
      {/* Ambient Background Effects */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-emerald-500/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed bottom-0 right-0 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-5xl w-full mx-auto px-4 py-12 relative z-10 flex-1 flex flex-col">
        
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium mb-4">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            Live Global Impact
          </div>
          
          <h1 className="text-6xl md:text-7xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-400 mb-4">
            Kyro <span className="text-emerald-400">Rankings</span>
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Celebrating the top contributors reducing global e-waste. 
            Every point represents a cleaner planet.
          </p>
        </motion.div>

        {/* Stats Grid */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16"
        >
          <StatCard 
            icon={<Scale size={24} className="text-emerald-400" />} 
            label="Total Recycled" 
            value={`${stats.totalWeight} kg`} 
            delay={0.1}
          />
          <StatCard 
            icon={<Users size={24} className="text-blue-400" />} 
            label="Active Recyclers" 
            value={stats.totalUsers.toString()} 
            delay={0.2}
          />
          <StatCard 
            icon={<Sparkles size={24} className="text-amber-400" />} 
            label="Pickups Completed" 
            value={stats.totalPickups.toString()} 
            delay={0.3}
          />
        </motion.div>

        {/* Main Leaderboard */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="bg-slate-900/50 backdrop-blur-2xl border border-white/5 rounded-[2rem] overflow-hidden shadow-2xl shadow-black/50 flex-1"
        >
          <div className="p-8 border-b border-white/5 flex items-center gap-3">
            <Trophy className="text-yellow-500" size={28} />
            <h2 className="text-2xl font-bold text-white">Top Contributors</h2>
          </div>

          <div className="p-4 md:p-6">
            {isLoading ? (
              <div className="space-y-4">
                {[1,2,3,4,5].map(i => (
                  <div key={i} className="h-20 bg-slate-800/50 rounded-2xl animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {leaderboard.map((user, i) => (
                  <LeaderboardRow key={user.id} user={user} rank={i + 1} />
                ))}
              </div>
            )}
          </div>
        </motion.div>

        {/* Footer */}
        <footer className="mt-12 text-center text-slate-500 text-sm">
          <p>Data updates in real-time from the Kyro Network.</p>
        </footer>

      </div>
    </main>
  );
}

// --- Sub Components ---

function StatCard({ icon, label, value, delay }: { icon: any, label: string, value: string, delay: number }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 + delay }}
      className="bg-slate-900/40 backdrop-blur-md border border-white/5 p-6 rounded-3xl flex flex-col items-center justify-center text-center hover:bg-slate-800/40 transition-colors"
    >
      <div className="p-3 bg-white/5 rounded-2xl mb-3 shadow-inner">
        {icon}
      </div>
      <div className="text-3xl font-bold text-white mb-1">{value}</div>
      <div className="text-sm text-slate-400 font-medium uppercase tracking-wider">{label}</div>
    </motion.div>
  )
}

function LeaderboardRow({ user, rank }: { user: UserPoints; rank: number }) {
  const isTop1 = rank === 1;
  const isTop2 = rank === 2;
  const isTop3 = rank === 3;
  
  // Dynamic styling based on rank
  let rowStyle = "bg-slate-800/30 border-transparent hover:bg-slate-800/50";
  let textStyle = "text-slate-300";
  let icon = null;

  if (isTop1) {
    rowStyle = "bg-gradient-to-r from-yellow-500/10 to-transparent border-yellow-500/20 shadow-[0_0_30px_-10px_rgba(234,179,8,0.3)]";
    textStyle = "text-yellow-100 font-bold";
    icon = <Crown size={20} className="text-yellow-400 fill-yellow-400" />;
  } else if (isTop2) {
    rowStyle = "bg-gradient-to-r from-slate-400/10 to-transparent border-slate-400/20";
    textStyle = "text-slate-100 font-semibold";
    icon = <Medal size={20} className="text-slate-300" />;
  } else if (isTop3) {
    rowStyle = "bg-gradient-to-r from-orange-500/10 to-transparent border-orange-500/20";
    textStyle = "text-orange-100 font-semibold";
    icon = <Medal size={20} className="text-orange-400" />;
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: rank * 0.05 }} // Staggered animation
      className={`relative flex items-center justify-between p-4 md:p-5 rounded-2xl border transition-all duration-300 group ${rowStyle}`}
    >
      <div className="flex items-center gap-4 md:gap-6">
        {/* Rank Indicator */}
        <div className={`w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full text-lg font-bold
          ${isTop1 ? 'bg-yellow-500 text-black shadow-lg shadow-yellow-500/50' : 
            isTop2 ? 'bg-slate-300 text-slate-900' : 
            isTop3 ? 'bg-orange-500 text-white' : 
            'bg-slate-800 text-slate-500'}`}
        >
          {rank}
        </div>

        {/* User Info */}
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className={`text-base md:text-lg ${textStyle}`}>
              {user.user_name || "Anonymous Recycler"}
            </span>
            {icon}
          </div>
          {isTop1 && <span className="text-xs text-yellow-500/80 font-medium uppercase tracking-wide">Current Leader</span>}
        </div>
      </div>

      {/* Points */}
      <div className="text-right">
        <div className={`text-xl md:text-2xl font-mono font-bold tracking-tight ${isTop1 ? 'text-yellow-400' : 'text-emerald-400'}`}>
          {user.total_points.toLocaleString()}
        </div>
        <div className="text-[10px] md:text-xs text-slate-500 uppercase font-bold tracking-widest">Points</div>
      </div>
      
      {/* Hover Glow Effect */}
      <div className="absolute inset-0 rounded-2xl bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
    </motion.div>
  );
}