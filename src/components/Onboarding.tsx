import { BotanicalLeaf } from "./Botanicals";

interface Props {
  onChooseFolder: () => void;
}

export function Onboarding({ onChooseFolder }: Props) {
  return (
    <div className="flex h-screen flex-col items-center justify-center bg-bg px-8 animate-fade-in">
      <BotanicalLeaf className="w-20 h-24 text-taupe-light mb-8" />
      <p className="font-display text-xl text-accent mb-2">Muse</p>
      <p className="text-sm text-text-muted text-center max-w-xs mb-8">
        Elige la carpeta de tu proyecto para empezar. Así Claude tendrá contexto de tus archivos.
      </p>
      <button
        type="button"
        onClick={onChooseFolder}
        className="rounded-xl bg-accent px-6 py-3 text-sm font-medium text-white hover:bg-accent-hover transition-colors"
      >
        Elegir carpeta
      </button>
    </div>
  );
}
