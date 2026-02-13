// Delicate line-art botanical illustrations for loading and empty states

export function BotanicalBranch({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 280"
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {/* Main stem */}
      <path d="M100 270 C100 240, 98 200, 100 160 C102 120, 98 80, 100 40" />
      {/* Left branches with small buds */}
      <path d="M100 220 C85 210, 65 200, 50 195" />
      <circle cx="48" cy="194" r="2.5" />
      <circle cx="55" cy="190" r="2" />
      <path d="M100 190 C80 175, 55 170, 40 168" />
      <circle cx="38" cy="167" r="2.5" />
      <circle cx="45" cy="163" r="2" />
      <circle cx="50" cy="172" r="1.5" />
      <path d="M100 150 C85 140, 70 132, 55 130" />
      <circle cx="53" cy="129" r="2" />
      <circle cx="58" cy="125" r="2.5" />
      <path d="M100 110 C88 100, 72 95, 62 92" />
      <circle cx="60" cy="91" r="2" />
      <circle cx="65" cy="87" r="1.5" />
      <path d="M100 75 C90 68, 78 62, 70 60" />
      <circle cx="68" cy="59" r="2" />
      {/* Right branches with small buds */}
      <path d="M100 205 C115 195, 135 188, 150 185" />
      <circle cx="152" cy="184" r="2.5" />
      <circle cx="145" cy="180" r="2" />
      <path d="M100 170 C118 158, 140 152, 155 150" />
      <circle cx="157" cy="149" r="2.5" />
      <circle cx="150" cy="145" r="2" />
      <circle cx="148" cy="153" r="1.5" />
      <path d="M100 130 C115 120, 135 115, 145 113" />
      <circle cx="147" cy="112" r="2" />
      <circle cx="140" cy="108" r="2.5" />
      <path d="M100 95 C112 88, 128 82, 138 80" />
      <circle cx="140" cy="79" r="2" />
      <path d="M100 60 C108 55, 120 48, 128 46" />
      <circle cx="130" cy="45" r="2" />
      <circle cx="125" cy="42" r="1.5" />
      {/* Top buds */}
      <circle cx="100" cy="37" r="2.5" />
      <circle cx="96" cy="33" r="2" />
      <circle cx="104" cy="33" r="2" />
    </svg>
  );
}

export function BotanicalLeaf({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 120 160"
      fill="none"
      stroke="currentColor"
      strokeWidth="0.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {/* Stem */}
      <path d="M60 155 C60 140, 58 120, 60 100 C62 80, 60 50, 60 30" />
      {/* Left leaf */}
      <path d="M60 90 C50 85, 30 78, 22 65 C18 55, 25 45, 38 50 C48 55, 55 70, 60 80" />
      <path d="M60 85 C48 78, 35 68, 30 60" />
      {/* Right leaf */}
      <path d="M60 70 C70 62, 88 55, 95 42 C100 32, 92 25, 80 32 C72 38, 64 52, 60 62" />
      <path d="M60 65 C72 55, 82 45, 87 38" />
      {/* Small leaf */}
      <path d="M60 50 C52 44, 42 38, 38 30 C36 24, 40 22, 46 28 C50 33, 55 42, 60 48" />
    </svg>
  );
}

export function BotanicalOlive({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 160 60"
      fill="none"
      stroke="currentColor"
      strokeWidth="0.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {/* Curved branch */}
      <path d="M10 35 C40 30, 80 25, 120 28 C135 30, 145 32, 150 30" />
      {/* Leaves along branch */}
      <path d="M30 32 C25 25, 28 18, 35 22 C38 25, 35 30, 30 32Z" />
      <path d="M50 28 C47 20, 52 14, 57 19 C59 22, 55 27, 50 28Z" />
      <path d="M70 26 C68 18, 74 13, 78 18 C80 22, 75 26, 70 26Z" />
      <path d="M90 27 C86 20, 90 14, 95 18 C98 22, 94 27, 90 27Z" />
      <path d="M110 28 C108 22, 112 16, 116 20 C118 24, 114 28, 110 28Z" />
      {/* Leaves below */}
      <path d="M40 33 C38 40, 43 45, 47 40 C49 37, 44 33, 40 33Z" />
      <path d="M65 28 C62 35, 66 40, 70 36 C73 33, 69 28, 65 28Z" />
      <path d="M95 29 C93 36, 97 40, 100 36 C102 33, 98 29, 95 29Z" />
      <path d="M125 31 C123 37, 127 41, 130 37 C132 34, 128 31, 125 31Z" />
    </svg>
  );
}
