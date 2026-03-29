import ThemeToggle from './ThemeToggle';
import { Bell } from 'lucide-react';

const AppHeader = ({ title }: { title: string }) => {
  return (
    <header className="h-16 glass border-b border-border flex items-center justify-between px-6 sticky top-0 z-30">
      <h1 className="text-lg font-semibold text-foreground lg:ml-0 ml-12">{title}</h1>
      <div className="flex items-center gap-2">
        <button className="h-9 w-9 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-all duration-200">
          <Bell size={18} />
        </button>
        <ThemeToggle />
      </div>
    </header>
  );
};

export default AppHeader;
