// Last-resort fallback, shown ONLY when WebGL is unavailable. Everyone else gets the real 3D scene. ~2 KB, resolution independent, no network request.
const SHELL = '#C9501F', DARK = '#8A2E12', LIGHT = '#E7794A';

const Claw = () => (
  <g>
    <path d="M560 158 L640 112 L718 128" fill="none" stroke={DARK} strokeWidth="36" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M560 158 L640 112 L718 128" fill="none" stroke={SHELL} strokeWidth="28" strokeLinecap="round" strokeLinejoin="round" />
    <ellipse cx="772" cy="140" rx="54" ry="30" transform="rotate(10 772 140)" fill="url(#shellG)" stroke={DARK} strokeWidth="4" />
    <path d="M806 122 C836 96 872 98 894 114 C868 114 844 124 822 142Z" fill="url(#shellG)" stroke={DARK} strokeWidth="3" strokeLinejoin="round" />
    <path d="M812 146 C838 142 866 150 888 174 C858 164 836 164 806 160Z" fill="url(#shellG)" stroke={DARK} strokeWidth="3" strokeLinejoin="round" />
  </g>
);

export default function CrayfishPoster({ className = '', style }) {
  return (
    <svg viewBox="0 0 920 420" role="img" aria-label="Illustration of a crayfish" className={className} style={{ overflow: 'visible', ...style }}>
      <defs><linearGradient id="shellG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#F08A58" /><stop offset=".45" stopColor="#C9501F" /><stop offset="1" stopColor="#7C2810" /></linearGradient></defs>
      <g transform="rotate(-6 460 210)">
        <g className="poster-sway" fill="none" stroke={LIGHT} strokeWidth="3" strokeLinecap="round">
          <path d="M668 196 C730 150 790 118 880 146" />
          <path d="M668 224 C730 270 790 302 880 274" />
        </g>
        <g stroke={DARK} strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" fill="none">
          {[0, 1, 2, 3].map((i) => (
            <g key={i}>
              <path d={`M${400 + i * 45} 160 L${425 + i * 45} 100 L${395 + i * 45} 62`} />
              <path d={`M${400 + i * 45} 260 L${425 + i * 45} 320 L${395 + i * 45} 358`} />
            </g>
          ))}
        </g>
        {/* tail fan */}
        <g fill="url(#shellG)" stroke={DARK} strokeWidth="3">
          <ellipse cx="150" cy="170" rx="52" ry="20" transform="rotate(-28 150 170)" />
          <ellipse cx="150" cy="250" rx="52" ry="20" transform="rotate(28 150 250)" />
          <ellipse cx="136" cy="210" rx="48" ry="30" />
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <ellipse key={i} cx={190 + i * 30} cy="210" rx="26" ry={30 + i * 3.2} />
          ))}
        </g>
        <g transform="translate(0 420) scale(1 -1)"><Claw /></g>
        <Claw />
        {/* carapace */}
        <path d="M330 210 C330 150 400 142 500 148 C570 152 620 178 650 210 C620 242 570 268 500 272 C400 278 330 270 330 210Z" fill="url(#shellG)" stroke={DARK} strokeWidth="4" />
        <path d="M470 150 C455 190 455 230 470 270" fill="none" stroke={DARK} strokeWidth="3" opacity=".6" />
        <path d="M360 190 C420 170 520 168 600 190" fill="none" stroke={LIGHT} strokeWidth="6" strokeLinecap="round" opacity=".5" />
        <path d="M640 200 L710 210 L640 220Z" fill="url(#shellG)" stroke={DARK} strokeWidth="3" strokeLinejoin="round" />
        {[178, 242].map((y) => (
          <g key={y}><circle cx="642" cy={y} r="9" fill="#1b1210" /><circle cx="639" cy={y - 3} r="2.5" fill="#fff" opacity=".7" /></g>
        ))}
      </g>
    </svg>
  );
}
