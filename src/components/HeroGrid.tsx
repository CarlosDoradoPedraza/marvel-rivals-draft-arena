import React, { useState } from 'react';
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import ConfirmHeroSelection from './ConfirmHeroSelection';

interface Hero {
  id: string;
  name: string;
  image: string;
  role: string;
}

interface HeroGridProps {
  heroes: Hero[];
  bannedHeroes: string[];
  team1Protected: string[];
  team2Protected: string[];
  onSelect: (heroName: string) => void;
  disabled: boolean;
  currentTeam: string;
  currentAction: 'ban' | 'protect';
  draftMode?: 'MRC' | 'MRI';
}

const HeroGrid: React.FC<HeroGridProps> = ({ 
  heroes, 
  bannedHeroes, 
  team1Protected, 
  team2Protected, 
  onSelect,
  disabled,
  currentTeam,
  currentAction,
  draftMode = 'MRC'
}) => {
  const [pendingHero, setPendingHero] = useState<string | null>(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);

  const getHeroStatus = (hero: Hero) => {
    if (draftMode === 'MRI') {
      // In MRI mode, check team-specific bans
      const isBannedForTeam1 = bannedHeroes.includes(`${hero.name}:team1`);
      const isBannedForTeam2 = bannedHeroes.includes(`${hero.name}:team2`);
      
      // Check protections first - protections prevent enemy bans
      const isProtectedByTeam1 = team1Protected.includes(hero.name);
      const isProtectedByTeam2 = team2Protected.includes(hero.name);
      
      if (currentAction === 'protect') {
        // For protect actions, check if the hero is banned by the opposing team
        const isBannedByOpponent = currentTeam === 'team1' ? isBannedForTeam2 : isBannedForTeam1;
        if (isBannedByOpponent) {
          return { status: 'banned', team: '' };
        }

        // Allow the current team to protect the hero, even if the other team has already protected it
        if (currentTeam === 'team1' && isProtectedByTeam2) {
          return { status: 'available', team: '' };
        }
        if (currentTeam === 'team2' && isProtectedByTeam1) {
          return { status: 'available', team: '' };
        }

        // Show as protected only if the current team has protected it
        if (currentTeam === 'team1' && isProtectedByTeam1) {
          return { status: 'protected', team: 'team1' };
        }
        if (currentTeam === 'team2' && isProtectedByTeam2) {
          return { status: 'protected', team: 'team2' };
        }
      }

      // For ban actions in MRI mode
      if (currentAction === 'ban') {
        // If the hero is protected by the opposing team, it cannot be banned
        const isProtectedByOpponent = currentTeam === 'team1' ? isProtectedByTeam2 : isProtectedByTeam1;
        if (isProtectedByOpponent) {
          return { status: 'protected', team: currentTeam === 'team1' ? 'team2' : 'team1' };
        }

        const currentTeamBannedThis = currentTeam === 'team1' 
          ? bannedHeroes.includes(`${hero.name}:team1`) 
          : bannedHeroes.includes(`${hero.name}:team2`);

        // If the current team has already banned this hero, show it as banned
        if (currentTeamBannedThis) {
          return { status: 'banned-by-current-team', team: currentTeam };
        }

        // Heroes are available for banning regardless of the other team's bans
        return { status: 'available', team: '' };
      }
      
      // Show banned status if either team banned it (for display purposes)
      if (isBannedForTeam1 || isBannedForTeam2) {
        return { status: 'banned', team: '' };
      }
    } else {
      // MRC mode - global bans
      if (bannedHeroes.includes(hero.name)) {
        return { status: 'banned', team: '' };
      }
      
      if (team1Protected.includes(hero.name)) {
        return { status: 'protected', team: 'team1' };
      }
      if (team2Protected.includes(hero.name)) {
        return { status: 'protected', team: 'team2' };
      }
    }
    
    return { status: 'available', team: '' };
  };

  const handleHeroClick = (hero: Hero) => {
    const heroStatus = getHeroStatus(hero);
    if (disabled || heroStatus.status !== 'available') return;
    
    setPendingHero(hero.name);
    setConfirmDialogOpen(true);
  };

  const handleConfirm = () => {
    if (pendingHero) {
      onSelect(pendingHero);
      setConfirmDialogOpen(false);
      setPendingHero(null);
    }
  };

  const handleCancel = () => {
    setConfirmDialogOpen(false);
    setPendingHero(null);
  };

  return (
    <>
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-2 md:gap-3">
        {heroes.map((hero) => {
          const { status, team } = getHeroStatus(hero);
          
          return (
            <TooltipProvider key={hero.id}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div 
                    className={`
                      relative flex flex-col items-center rounded-lg overflow-hidden cursor-pointer transition-all duration-300
                      ${status === 'banned' || status === 'banned-by-current-team' ? 'opacity-50 grayscale' : ''}
                      ${status === 'banned-by-current-team' ? 'ring-2 ring-yellow-500' : ''}
                      ${status === 'protected' && team === 'team1' ? 'ring-2 ring-blue-500' : ''}
                      ${status === 'protected' && team === 'team2' ? 'ring-2 ring-red-500' : ''}
                      ${status === 'available' && !disabled ? 'hover:scale-105 hover:shadow-lg hover:shadow-purple-700/30' : ''}
                      ${disabled ? 'cursor-not-allowed' : status === 'available' ? 'cursor-pointer' : 'cursor-default'}
                      transform-gpu
                    `}
                    onClick={() => handleHeroClick(hero)}
                  >
                    <div className="w-full aspect-square bg-gray-800 overflow-hidden">
                      <img 
                        src={`/heroes/${hero.image}`} 
                        alt={hero.name}
                        className="w-full h-full object-cover object-top transition-transform hover:scale-110 duration-300"
                        onError={(e) => {
                          e.currentTarget.src = 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b';
                        }}
                      />
                    </div>
                    <div className="w-full p-1.5 bg-gray-900 text-center">
                      <p className="text-xs font-medium truncate text-white">{hero.name}</p>
                      <Badge 
                        variant="outline" 
                        className="mt-1 text-xs px-1 py-0.5 truncate bg-[#FCDF36] text-[#333645] border-[#FCDF36]/50 font-medium text-xs"
                      >
                        {hero.role}
                      </Badge>
                    </div>
                    {(status === 'banned' || status === 'banned-by-current-team') && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/80">
                        <p className={`font-bold text-lg tracking-wider ${status === 'banned-by-current-team' ? 'text-yellow-500' : 'text-red-500'}`}>
                          {status === 'banned-by-current-team' ? 'BANNED BY YOU' : 'BANNED'}
                        </p>
                      </div>
                    )}
                    {status === 'protected' && (
                      <>
                        <div className="absolute top-2 right-2">
                          <Badge className={`${team === 'team1' ? 'bg-blue-600' : 'bg-red-600'} text-white shadow-lg text-xs font-bold`}>
                            {team === 'team1' ? 'TEAM 1' : 'TEAM 2'}
                          </Badge>
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end justify-center p-2">
                          <Badge className={`${team === 'team1' ? 'bg-blue-500/90' : 'bg-red-500/90'} text-white text-xs font-bold px-3 py-1`}>
                            PROTECTED
                          </Badge>
                        </div>
                      </>
                    )}
                    {!disabled && status === 'available' && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/0 hover:bg-black/40 opacity-0 hover:opacity-100 transition-all duration-300">
                        <p className={`font-bold ${currentAction === 'ban' ? 'text-yellow-500' : 'text-green-500'} text-sm tracking-wider px-2 py-1 bg-black/80 rounded-full`}>
                          {currentAction === 'ban' ? 'BAN?' : 'PROTECT?'}
                        </p>
                      </div>
                    )}
                  </div>
                </TooltipTrigger>
                <TooltipContent className="bg-gray-800 text-white border-gray-700">
                  <p className="font-bold">{hero.name}</p>
                  <p className="text-xs text-gray-400">{hero.role}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          );
        })}
      </div>
      
      <ConfirmHeroSelection
        isOpen={confirmDialogOpen}
        heroName={pendingHero || ''}
        actionType={currentAction}
        team={currentTeam}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    </>
  );
};

export default HeroGrid;