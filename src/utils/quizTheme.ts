export interface OptionTheme {
  name: string;
  colorName: string;
  bgClass: string;
  hoverClass: string;
  activeClass: string;
  borderClass: string;
  textClass: string;
  shape: 'triangle' | 'diamond' | 'circle' | 'square';
  shapeChar: string;
}

export const KAHOOT_THEMES: OptionTheme[] = [
  {
    name: 'Kırmızı',
    colorName: 'rose',
    bgClass: 'bg-rose-600',
    hoverClass: 'hover:bg-rose-500',
    activeClass: 'active:bg-rose-700',
    borderClass: 'border-rose-400',
    textClass: 'text-rose-100',
    shape: 'triangle',
    shapeChar: '▲',
  },
  {
    name: 'Mavi',
    colorName: 'blue',
    bgClass: 'bg-blue-600',
    hoverClass: 'hover:bg-blue-500',
    activeClass: 'active:bg-blue-700',
    borderClass: 'border-blue-400',
    textClass: 'text-blue-100',
    shape: 'diamond',
    shapeChar: '◆',
  },
  {
    name: 'Sarı',
    colorName: 'amber',
    bgClass: 'bg-amber-500',
    hoverClass: 'hover:bg-amber-400',
    activeClass: 'active:bg-amber-600',
    borderClass: 'border-amber-300',
    textClass: 'text-amber-950',
    shape: 'circle',
    shapeChar: '●',
  },
  {
    name: 'Yeşil',
    colorName: 'emerald',
    bgClass: 'bg-emerald-600',
    hoverClass: 'hover:bg-emerald-500',
    activeClass: 'active:bg-emerald-700',
    borderClass: 'border-emerald-400',
    textClass: 'text-emerald-100',
    shape: 'square',
    shapeChar: '■',
  },
];

export const FUN_AVATARS = [
  '🦊', '🐱', '🐼', '🦁', '🐸', '🐨', '🦄', '🐯', 
  '🐙', '🚀', '⭐', '🔥', '⚡', '🦉', '🦖', '🐬'
];
