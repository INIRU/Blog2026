import {
  SiJavascript,
  SiTypescript,
  SiPython,
  SiRust,
  SiGo,
  SiCplusplus,
  SiC,
  SiPhp,
  SiRuby,
  SiSwift,
  SiKotlin,
  SiDart,
  SiHtml5,
  SiCss3,
  SiSass,
  SiJson,
  SiMarkdown,
  SiDocker,
  SiGnubash,
  SiYaml,
  SiGraphql,
  SiReact,
  SiVuedotjs,
  SiSvelte,
} from 'react-icons/si';
import { VscCode } from 'react-icons/vsc';

const iconMap: Record<string, { icon: React.ComponentType<{ size?: number; color?: string }>; color: string }> = {
  javascript: { icon: SiJavascript, color: '#F7DF1E' },
  js: { icon: SiJavascript, color: '#F7DF1E' },
  typescript: { icon: SiTypescript, color: '#3178C6' },
  ts: { icon: SiTypescript, color: '#3178C6' },
  tsx: { icon: SiReact, color: '#61DAFB' },
  jsx: { icon: SiReact, color: '#61DAFB' },
  python: { icon: SiPython, color: '#3776AB' },
  py: { icon: SiPython, color: '#3776AB' },
  rust: { icon: SiRust, color: '#DEA584' },
  rs: { icon: SiRust, color: '#DEA584' },
  go: { icon: SiGo, color: '#00ADD8' },
  cpp: { icon: SiCplusplus, color: '#00599C' },
  'c++': { icon: SiCplusplus, color: '#00599C' },
  c: { icon: SiC, color: '#A8B9CC' },
  php: { icon: SiPhp, color: '#777BB4' },
  ruby: { icon: SiRuby, color: '#CC342D' },
  rb: { icon: SiRuby, color: '#CC342D' },
  swift: { icon: SiSwift, color: '#F05138' },
  kotlin: { icon: SiKotlin, color: '#7F52FF' },
  kt: { icon: SiKotlin, color: '#7F52FF' },
  dart: { icon: SiDart, color: '#0175C2' },
  html: { icon: SiHtml5, color: '#E34F26' },
  css: { icon: SiCss3, color: '#1572B6' },
  scss: { icon: SiSass, color: '#CC6699' },
  sass: { icon: SiSass, color: '#CC6699' },
  json: { icon: SiJson, color: '#000000' },
  md: { icon: SiMarkdown, color: '#000000' },
  markdown: { icon: SiMarkdown, color: '#000000' },
  dockerfile: { icon: SiDocker, color: '#2496ED' },
  docker: { icon: SiDocker, color: '#2496ED' },
  bash: { icon: SiGnubash, color: '#4EAA25' },
  sh: { icon: SiGnubash, color: '#4EAA25' },
  shell: { icon: SiGnubash, color: '#4EAA25' },
  zsh: { icon: SiGnubash, color: '#4EAA25' },
  yaml: { icon: SiYaml, color: '#CB171E' },
  yml: { icon: SiYaml, color: '#CB171E' },
  graphql: { icon: SiGraphql, color: '#E10098' },
  gql: { icon: SiGraphql, color: '#E10098' },
  vue: { icon: SiVuedotjs, color: '#4FC08D' },
  svelte: { icon: SiSvelte, color: '#FF3E00' },
};

interface LanguageIconProps {
  language: string;
  size?: number;
  showColor?: boolean;
}

export function LanguageIcon({ language, size = 14, showColor = true }: LanguageIconProps) {
  const lang = language.toLowerCase();
  const config = iconMap[lang];

  if (!config) {
    return <VscCode size={size} />;
  }

  const Icon = config.icon;
  return <Icon size={size} color={showColor ? config.color : undefined} />;
}

export function getLanguageColor(language: string): string {
  const lang = language.toLowerCase();
  return iconMap[lang]?.color || '#6B7280';
}
