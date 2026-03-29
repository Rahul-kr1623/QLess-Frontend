import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  accentClass?: string;
}

const StatsCard = ({ title, value, icon: Icon, accentClass = 'text-primary' }: StatsCardProps) => {
  return (
    <div className="glass-card p-6 flex items-start justify-between transition-all duration-300 hover:scale-[1.02]">
      <div>
        <p className="text-sm text-muted-foreground font-medium">{title}</p>
        <p className="text-3xl font-bold text-foreground mt-1">{value}</p>
      </div>
      <div className={`h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center ${accentClass}`}>
        <Icon size={20} />
      </div>
    </div>
  );
};

export default StatsCard;
