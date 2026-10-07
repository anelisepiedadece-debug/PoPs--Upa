import {
  HeartPulse,
  Pill,
  ShieldCheck,
  Siren,
  ShieldPlus,
  Sparkles,
  ClipboardPlus,
  Stethoscope,
  Files,
  FolderOpen,
} from "lucide-react";
const icons = {
  HeartPulse,
  Pill,
  ShieldCheck,
  Siren,
  ShieldPlus,
  Sparkles,
  ClipboardPlus,
  Stethoscope,
  Files,
  FolderOpen,
};
export function CategoryIcon({
  name,
  size = 25,
}: {
  name: string;
  size?: number;
}) {
  const Icon = icons[name as keyof typeof icons] || FolderOpen;
  return <Icon size={size} aria-hidden="true" />;
}
