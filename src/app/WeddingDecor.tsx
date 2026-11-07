"use client";

import { useId, type CSSProperties } from "react";

export function Rangoli({ className = "" }: Readonly<{ className?: string }>) {
  return (
    <svg
      className={`rangoli-art ${className}`}
      viewBox="0 0 400 400"
      fill="none"
      aria-hidden="true"
    >
      <circle
        cx="200"
        cy="200"
        r="186"
        stroke="currentColor"
        strokeWidth="0.7"
      />
      <circle
        cx="200"
        cy="200"
        r="175"
        stroke="currentColor"
        strokeWidth="0.7"
        strokeDasharray="1 7"
        strokeLinecap="round"
      />
      <circle
        cx="200"
        cy="200"
        r="162"
        stroke="currentColor"
        strokeWidth="0.8"
      />
      {Array.from({ length: 16 }, (_, index) => {
        const angle = index * 22.5;
        return (
          <g
            key={angle}
            transform={`rotate(${angle} 200 200)`}
            stroke="currentColor"
            strokeWidth="0.85"
          >
            <path d="M200 45C167 82 166 119 200 155C234 119 233 82 200 45Z" />
            <path d="M200 58C186 89 184 116 200 143C216 116 214 89 200 58Z" />
            <path
              d="M200 20L205 30L200 40L195 30Z"
              fill="currentColor"
              stroke="none"
            />
            <circle cx="200" cy="166" r="3" />
          </g>
        );
      })}
      <circle cx="200" cy="200" r="91" stroke="currentColor" />
      <circle
        cx="200"
        cy="200"
        r="83"
        stroke="currentColor"
        strokeDasharray="1 5"
      />
      {Array.from({ length: 8 }, (_, index) => (
        <ellipse
          key={index * 45}
          cx="200"
          cy="163"
          rx="17"
          ry="37"
          stroke="currentColor"
          transform={`rotate(${index * 45} 200 200)`}
        />
      ))}
      <circle cx="200" cy="200" r="17" stroke="currentColor" />
      <circle cx="200" cy="200" r="7" fill="currentColor" />
    </svg>
  );
}

function HangingLamp({ className }: Readonly<{ className: string }>) {
  const gradient = useId();
  return (
    <svg
      className={`hanging-lamp ${className}`}
      viewBox="0 0 120 400"
      fill="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient
          id={gradient}
          x1="20"
          y1="250"
          x2="101"
          y2="290"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#6b491b" />
          <stop offset=".27" stopColor="#d9b866" />
          <stop offset=".48" stopColor="#f3d996" />
          <stop offset=".68" stopColor="#ac7b2c" />
          <stop offset="1" stopColor="#674719" />
        </linearGradient>
      </defs>
      <g stroke="#ad8944" strokeWidth="1.3">
        <path d="M60 0V201" />
        {Array.from({ length: 24 }, (_, index) => (
          <ellipse
            key={index * 8}
            cx="60"
            cy={8 + index * 8}
            rx="2.3"
            ry="4.3"
          />
        ))}
        <path d="M60 199C60 220 37 237 25 279M60 199C60 220 83 237 95 279" />
        <path d="M60 199V280" />
      </g>
      <g fill={`url(#${gradient})`} stroke="#9b732f" strokeWidth=".6">
        <path d="M55 199L60 188L65 199L63 211H57Z" />
        <path d="M18 281Q60 272 102 281L95 290Q60 303 25 290Z" />
        <ellipse cx="60" cy="280" rx="43" ry="6" />
        <path d="M28 289Q32 317 60 320Q88 317 92 289Q60 301 28 289Z" />
        <path d="M53 318H67L65 331H55Z" />
        <path d="M49 330Q60 325 71 330L77 337H43Z" />
        <ellipse cx="60" cy="338" rx="20" ry="3" />
        <path d="M51 275Q60 267 69 275L66 280H54Z" />
      </g>
      <path
        className="lamp-flame"
        d="M60 274C48 265 56 255 60 248C61 260 71 265 60 274Z"
        fill="#d59b37"
      />
      <path
        className="lamp-flame-inner"
        d="M60 272C55 268 58 263 60 260C64 267 64 269 60 272Z"
        fill="#fff1b7"
      />
      <path
        d="M34 300Q60 314 86 300M42 308Q60 319 78 308"
        stroke="#edce83"
        strokeWidth=".8"
      />
      <g fill="#d8bd78">
        {[35, 45, 55, 65, 75, 85].map((position) => (
          <circle key={position} cx={position} cy="284" r="1" />
        ))}
      </g>
    </svg>
  );
}

function Temple({ className }: Readonly<{ className: string }>) {
  return (
    <svg
      className={`temple-art ${className}`}
      viewBox="0 0 220 360"
      fill="none"
      aria-hidden="true"
    >
      <g
        fill="currentColor"
        fillOpacity=".15"
        stroke="currentColor"
        strokeWidth="1"
      >
        <path d="M25 333H195V351H25ZM38 309H182V332H38ZM52 273H168V310H52Z" />
        {Array.from({ length: 7 }, (_, index) => {
          const top = 69 + index * 29;
          const width = 43 + index * 14;
          return (
            <g key={top}>
              <path
                d={`M${110 - width / 2} ${top}L${104 - width / 2} ${top + 23}H${116 + width / 2}L${110 + width / 2} ${top}Z`}
              />
              <path
                d={`M${101 - width / 2} ${top + 24}H${119 + width / 2}V${top + 28}H${101 - width / 2}Z`}
              />
              {[-1, 0, 1].map((position) => (
                <path
                  key={position}
                  d={`M${106 + (position * width) / 3} ${top + 20}V${top + 12}Q${110 + (position * width) / 3} ${top + 5} ${114 + (position * width) / 3} ${top + 12}V${top + 20}Z`}
                />
              ))}
            </g>
          );
        })}
        <path d="M82 68Q110 30 138 68ZM91 49V37M110 41V24M129 49V37" />
        <circle cx="91" cy="34" r="3" />
        <circle cx="110" cy="21" r="3" />
        <circle cx="129" cy="34" r="3" />
        <path d="M91 332V298Q110 276 129 298V332M68 332V302M152 332V302" />
      </g>
    </svg>
  );
}

export function LotusDivider() {
  return (
    <div className="lotus-divider" aria-hidden="true">
      <span />
      <svg viewBox="0 0 100 58" fill="none">
        <path
          d="M50 46C34 31 39 15 50 5C61 15 66 31 50 46Z"
          fill="#b5727c"
          fillOpacity=".16"
          stroke="currentColor"
        />
        <path
          d="M49 46C28 46 20 30 23 16C39 20 49 29 49 46ZM51 46C72 46 80 30 77 16C61 20 51 29 51 46Z"
          fill="#b5727c"
          fillOpacity=".12"
          stroke="currentColor"
        />
        <path
          d="M49 46C29 55 12 43 7 30C26 27 41 32 49 46ZM51 46C71 55 88 43 93 30C74 27 59 32 51 46Z"
          stroke="currentColor"
        />
        <path d="M22 51Q50 59 78 51" stroke="#8a985e" strokeWidth="1.4" />
        <circle cx="50" cy="53" r="2" fill="#b48e49" />
      </svg>
      <span />
    </div>
  );
}

const loveMotifs = {
  vines: "M18 57C17 35 35 27 47 10M78 57C79 35 61 27 49 10M31 38C15 41 13 28 16 22C28 22 34 29 31 38ZM39 26C32 12 41 6 47 7C50 17 47 24 39 26ZM65 38C81 41 83 28 80 22C68 22 62 29 65 38ZM57 26C64 12 55 6 49 7C46 17 49 24 57 26ZM25 54Q48 62 71 54",
  birds: "M15 43C7 29 18 18 29 25C35 29 37 37 42 39L34 44C22 49 17 47 15 43ZM81 43C89 29 78 18 67 25C61 29 59 37 54 39L62 44C74 49 79 47 81 43ZM25 31L26 32M71 31L70 32M35 32L43 34L36 37M61 32L53 34L60 37M23 45L21 53M30 46L31 53M73 45L75 53M66 46L65 53M10 56Q48 48 86 56M44 21Q48 15 52 21",
  lotus: "M48 51C29 34 36 16 48 7C60 16 67 34 48 51ZM47 51C25 51 18 34 21 21C37 25 46 35 47 51ZM49 51C71 51 78 34 75 21C59 25 50 35 49 51ZM47 51C26 61 12 48 8 36C25 33 39 39 47 51ZM49 51C70 61 84 48 88 36C71 33 57 39 49 51ZM25 58Q48 64 71 58",
  lamps: "M12 37Q27 31 42 37Q38 49 27 49Q16 49 12 37ZM54 37Q69 31 84 37Q80 49 69 49Q58 49 54 37ZM27 35C15 28 24 20 27 13C28 23 37 28 27 35ZM69 35C57 28 66 20 69 13C70 23 79 28 69 35ZM27 49V56M69 49V56M18 57H36M60 57H78M39 54Q48 60 57 54",
  jasmine: "M47 48C29 41 23 30 29 24C35 18 43 23 48 34C43 16 47 8 54 11C62 14 60 25 53 35C66 21 76 24 77 31C78 39 65 43 54 42C71 44 73 54 66 58C58 61 51 52 48 45C45 61 34 64 30 57C27 50 37 44 47 43M48 48Q40 56 24 60M32 55C20 52 16 43 20 38C30 40 34 47 32 55Z",
  moon: "M61 10C39 10 25 24 25 39C25 53 38 62 53 58C67 54 74 42 71 30C67 45 52 49 42 40C32 31 42 14 61 10ZM70 10V18M66 14H74M80 24V30M77 27H83M14 23V29M11 26H17",
  feather: "M28 60C35 39 51 26 70 10M40 43C17 40 20 17 41 10C61 3 82 8 80 24C77 43 55 53 40 43ZM47 31C35 30 34 20 46 17C58 12 68 18 63 26C59 33 51 36 47 31ZM49 25C46 20 52 17 56 21C59 25 53 29 49 25ZM33 51L19 49M36 47L24 40M44 38L39 26",
  knot: "M48 32C28 9 10 17 14 33C18 51 37 49 48 32C59 15 78 13 82 31C86 47 68 55 48 32ZM48 32C28 55 38 66 48 57C58 66 68 55 48 32ZM48 32C28 9 38 0 48 9C58 0 68 9 48 32M20 53L13 60M76 53L83 60",
} as const;

export function LoveSymbol({ kind }: Readonly<{ kind: keyof typeof loveMotifs }>) {
  return <svg className={`love-symbol love-symbol-${kind}`} viewBox="0 0 96 68" fill="none" aria-hidden="true"><path d={loveMotifs[kind]} stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

export function PhotoStoryBackdrop() {
  return <div className="photo-story-backdrop" aria-hidden="true">
    <FloralCorners />
    <BellTassel className="photo-story-bell story-bell-left" />
    <BellTassel className="photo-story-bell story-bell-right" />
    <Rangoli className="photo-story-header-rangoli" />
  </div>;
}

export function PhotoSceneGraphics({ kind }: Readonly<{ kind: keyof typeof loveMotifs }>) {
  return <div className={`photo-scene-graphics photo-scene-graphics-${kind}`} aria-hidden="true">
    <BananaTrees />
    <Rangoli className="photo-scene-rangoli" />
    <svg className="photo-scene-botanical" viewBox="0 0 150 280" fill="none">
      <path d="M22 273C38 225 91 199 92 144C93 103 58 79 73 20" stroke="#9b9f70" strokeWidth="1.2" />
      <g fill="#78936c" fillOpacity=".38" stroke="#849766" strokeWidth=".65">
        <path d="M36 240C13 236 8 218 14 207C32 210 42 224 36 240Z" />
        <path d="M51 216C61 195 80 192 91 200C83 219 67 224 51 216Z" />
        <path d="M72 189C48 183 43 167 49 156C69 160 79 174 72 189Z" />
        <path d="M87 158C101 136 120 137 129 148C118 165 101 168 87 158Z" />
        <path d="M88 128C66 121 62 105 68 96C86 100 96 114 88 128Z" />
        <path d="M77 91C87 71 104 70 115 79C105 96 90 101 77 91Z" />
        <path d="M70 56C54 44 55 27 64 21C79 31 82 44 70 56Z" />
      </g>
      {[{x:33,y:251},{x:89,y:174},{x:78,y:108},{x:72,y:40}].map((flower) => <g className="photo-scene-blossom" key={flower.y} transform={`translate(${flower.x} ${flower.y})`} fill="#b27c8a" fillOpacity=".65"><ellipse cy="-5" rx="3" ry="6" /><ellipse cy="-5" rx="3" ry="6" transform="rotate(72)" /><ellipse cy="-5" rx="3" ry="6" transform="rotate(144)" /><ellipse cy="-5" rx="3" ry="6" transform="rotate(216)" /><ellipse cy="-5" rx="3" ry="6" transform="rotate(288)" /><circle r="2" fill="#c0a266" /></g>)}
    </svg>
    <div className="photo-scene-endmark"><span /><LoveSymbol kind={kind} /><span /></div>
  </div>;
}

export function BananaTrees() {
  return <div className="section-bananas" aria-hidden="true"><div className="section-banana-tracking"><span className="section-banana-tree section-banana-left" /><span className="section-banana-tree section-banana-right" /></div></div>;
}

export function FloralCorners() {
  return (
    <div className="floral-corners" aria-hidden="true">
      <span className="floral-corner floral-corner-left" />
      <span className="floral-corner floral-corner-right" />
    </div>
  );
}

function BellTassel({ className }: Readonly<{ className: string }>) {
  const metal = useId();
  return (
    <svg
      className={`bell-tassel ${className}`}
      viewBox="0 0 90 300"
      fill="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient
          id={metal}
          x1="20"
          y1="180"
          x2="72"
          y2="210"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#795621" />
          <stop offset=".35" stopColor="#edcf83" />
          <stop offset=".57" stopColor="#d0a957" />
          <stop offset="1" stopColor="#805b24" />
        </linearGradient>
      </defs>
      <path d="M45 0V174" stroke="#b29350" strokeWidth="1" />
      {Array.from({ length: 15 }, (_, index) => (
        <g key={index * 10}>
          <ellipse
            cx="45"
            cy={8 + index * 10}
            rx="3.2"
            ry="4.7"
            fill="#faf8e9"
            stroke="#c5b685"
            strokeWidth=".6"
          />
          <circle cx="45" cy={13 + index * 10} r="1.3" fill="#b58a43" />
        </g>
      ))}
      <path
        d="M45 157C22 139 10 151 25 163C33 169 39 166 45 157ZM45 157C68 139 80 151 65 163C57 169 51 166 45 157Z"
        stroke="#a36274"
        fill="#bb8b9640"
      />
      <path d="M45 157L34 178M45 157L56 178" stroke="#a36274" strokeWidth="2" />
      <g fill={`url(#${metal})`} stroke="#9b7637" strokeWidth=".7">
        <path d="M39 184V178Q45 170 51 178V184Z" />
        <path d="M24 218C35 209 28 186 45 183C62 186 55 209 66 218Z" />
        <ellipse cx="45" cy="219" rx="25" ry="5" />
        <path d="M38 224V231Q45 239 52 231V224" />
      </g>
      <path d="M30 209Q45 214 60 209M35 192Q45 197 55 192" stroke="#f2d89a" />
      <path d="M45 236V254" stroke="#b29350" />
      <path
        d="M45 252C34 259 36 269 45 274C54 269 56 259 45 252Z"
        fill="#9a6172"
      />
      <path d="M45 274V287M41 273L38 285M49 273L52 285" stroke="#b29350" />
    </svg>
  );
}

function PeacockMotif({ className }: Readonly<{ className: string }>) {
  const jewel = useId();
  return (
    <svg
      className={`peacock-motif ${className}`}
      viewBox="0 0 240 240"
      fill="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient
          id={jewel}
          x1="45"
          y1="40"
          x2="200"
          y2="210"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#8caa7d" />
          <stop offset=".5" stopColor="#426f5e" />
          <stop offset="1" stopColor="#254f4a" />
        </linearGradient>
      </defs>
      <g stroke="#b49757" strokeWidth=".9">
        {[-62, -40, -20, 0, 20, 40, 62].map((angle) => (
          <g key={angle} transform={`rotate(${angle} 116 171)`}>
            <path
              d="M116 170C82 132 81 76 116 27C151 76 150 132 116 170Z"
              fill={`url(#${jewel})`}
              fillOpacity=".66"
            />
            <path d="M116 162V47" />
            <path
              d="M116 46C94 66 98 85 116 95C134 85 138 66 116 46Z"
              fill="#c6b573"
            />
            <ellipse cx="116" cy="75" rx="9" ry="13" fill="#3d746b" />
            <ellipse cx="116" cy="76" rx="4" ry="7" fill="#b57b8b" />
          </g>
        ))}
      </g>
      <path
        d="M82 182C91 148 133 152 143 170C151 181 174 170 169 142C164 120 154 94 163 75C173 55 192 60 196 70C200 81 192 87 182 88C178 107 197 140 191 165C185 193 159 207 123 206C97 206 82 198 82 182Z"
        fill="#37695e"
        stroke="#b49757"
        strokeWidth="1.4"
      />
      <path
        d="M104 180C116 158 145 171 151 190C134 202 118 201 104 180Z"
        fill="#78956d"
        stroke="#c8ae69"
      />
      <path
        d="M113 179Q129 179 143 190M111 185Q126 188 137 193"
        stroke="#d5bf84"
      />
      <path d="M196 73L210 77L195 81" fill="#c19b50" />
      <circle cx="186" cy="72" r="2" fill="#f1e7c7" />
      <path d="M175 61L168 47M180 59L180 43M185 60L191 47" stroke="#b49757" />
      <circle cx="168" cy="45" r="3" fill="#b47a88" />
      <circle cx="180" cy="41" r="3" fill="#b47a88" />
      <circle cx="192" cy="45" r="3" fill="#b47a88" />
      <path
        d="M124 206L119 221M138 206L141 221M113 222H129M134 222H150"
        stroke="#ac8c48"
        strokeWidth="1.5"
      />
    </svg>
  );
}

export function LotusPond() {
  return (
    <svg
      className="lotus-pond"
      viewBox="0 0 800 125"
      fill="none"
      aria-hidden="true"
    >
      <g stroke="#8caa95" strokeWidth=".8" opacity=".55">
        <ellipse cx="400" cy="91" rx="215" ry="17" />
        <ellipse className="pond-ripple" cx="400" cy="93" rx="265" ry="24" />
        <path d="M75 98H180M620 98H725M115 111H247M553 111H685" />
      </g>
      {[
        { x: 255, y: 58, scale: 0.7 },
        { x: 400, y: 28, scale: 1 },
        { x: 545, y: 62, scale: 0.65 },
      ].map((lotus) => (
        <g
          className="pond-lotus"
          key={lotus.x}
          transform={`translate(${lotus.x} ${lotus.y}) scale(${lotus.scale})`}
        >
          <path
            d="M0 54C-25 34-18 10 0 0C18 10 25 34 0 54Z"
            fill="#bc7d8d"
            stroke="#996172"
          />
          <path
            d="M0 54C-33 53-48 30-42 14C-15 18-3 31 0 54ZM0 54C33 53 48 30 42 14C15 18 3 31 0 54Z"
            fill="#d5a5ae"
            stroke="#aa7482"
          />
          <path
            d="M0 54C-34 70-58 52-67 34C-35 28-14 40 0 54ZM0 54C34 70 58 52 67 34C35 28 14 40 0 54Z"
            fill="#e2bec3"
            stroke="#b48c94"
          />
          <path d="M-47 64Q0 77 47 64" stroke="#698c69" strokeWidth="2" />
        </g>
      ))}
      <path
        d="M178 83C204 66 233 74 245 91C220 103 196 102 178 83ZM564 92C589 70 619 75 633 89C610 102 582 104 564 92Z"
        fill="#819f76"
        fillOpacity=".65"
        stroke="#6e8d67"
      />
    </svg>
  );
}

export function OrnamentalBand() {
  const pattern = useId();
  return (
    <div className="ornamental-band" aria-hidden="true">
      <svg width="100%" height="42">
        <defs>
          <pattern
            id={pattern}
            width="120"
            height="42"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M0 21Q30 0 60 21T120 21M0 21Q30 42 60 21T120 21"
              stroke="#b59654"
              strokeWidth=".7"
              fill="none"
            />
            <path
              d="M30 21C20 11 22 5 30 3C38 5 40 11 30 21ZM90 21C80 31 82 37 90 39C98 37 100 31 90 21Z"
              fill="#a96f7e"
              fillOpacity=".5"
            />
            <path
              d="M48 20Q57 7 66 11Q64 21 48 20ZM108 22Q117 35 126 31Q124 21 108 22Z"
              fill="#78936c"
              fillOpacity=".65"
            />
            <circle cx="0" cy="21" r="2" fill="#b59654" />
            <circle cx="60" cy="21" r="2" fill="#b59654" />
          </pattern>
        </defs>
        <rect width="100%" height="42" fill={`url(#${pattern})`} />
      </svg>
    </div>
  );
}

export function HeroOrnaments() {
  return (
    <div className="hero-ornaments" aria-hidden="true">
      <FloralCorners />
      <BellTassel className="bell-left" />
      <BellTassel className="bell-right" />
      <PeacockMotif className="hero-peacock peacock-left" />
      <PeacockMotif className="hero-peacock peacock-right" />
      <div className="mandap-arch" />
      <div className="mandap-arch inner-arch" />
      <Rangoli className="hero-rangoli" />
      <HangingLamp className="lamp-left" />
      <HangingLamp className="lamp-right" />
      <div className="banana-branch branch-left" />
      <div className="banana-branch branch-right" />
      <Temple className="hero-temple temple-left" />
      <Temple className="hero-temple temple-right" />
      <div className="kalash-art kalash-left" />
      <div className="kalash-art kalash-right" />
      <div className="jasmine-thread jasmine-left">
        {Array.from({ length: 11 }, (_, index) => (
          <i key={index * 18} style={{ top: `${index * 18}px` }} />
        ))}
      </div>
      <div className="jasmine-thread jasmine-right">
        {Array.from({ length: 11 }, (_, index) => (
          <i key={index * 18} style={{ top: `${index * 18}px` }} />
        ))}
      </div>
    </div>
  );
}

export function CeremonyOrnaments() {
  return (
    <div className="ceremony-ornaments" aria-hidden="true">
      <FloralCorners />
      <PeacockMotif className="ceremony-peacock peacock-left" />
      <PeacockMotif className="ceremony-peacock peacock-right" />
      <Rangoli className="ceremony-rangoli" />
      <HangingLamp className="ceremony-lamp-left" />
      <HangingLamp className="ceremony-lamp-right" />
      <Temple className="ceremony-temple-left" />
      <Temple className="ceremony-temple-right" />
      <div className="ceremony-corner corner-top-left" />
      <div className="ceremony-corner corner-top-right" />
      <div className="ceremony-corner corner-bottom-left" />
      <div className="ceremony-corner corner-bottom-right" />
    </div>
  );
}

const petals = [
  {
    left: "3%",
    duration: "23s",
    delay: "-7s",
    drift: "35px",
    color: "#a9606c",
  },
  {
    left: "9%",
    duration: "28s",
    delay: "-19s",
    drift: "-25px",
    color: "#b5914f",
  },
  {
    left: "15%",
    duration: "31s",
    delay: "-3s",
    drift: "-65px",
    color: "#c98e91",
  },
  {
    left: "85%",
    duration: "26s",
    delay: "-14s",
    drift: "55px",
    color: "#a9606c",
  },
  {
    left: "93%",
    duration: "30s",
    delay: "-23s",
    drift: "-25px",
    color: "#b5914f",
  },
  {
    left: "98%",
    duration: "22s",
    delay: "-10s",
    drift: "-35px",
    color: "#c98e91",
  },
];

export function Atmosphere() {
  return (
    <>
      <div className="invitation-edge" aria-hidden="true">
        <span />
        <span />
        <span />
        <span />
      </div>
      <div className="petal-overlay" aria-hidden="true">
        {petals.map((petal) => (
          <span
            className="drifting-petal"
            key={petal.left}
            style={
              {
                left: petal.left,
                "--fall-duration": petal.duration,
                "--fall-delay": petal.delay,
                "--petal-drift": petal.drift,
                "--petal-color": petal.color,
              } as CSSProperties
            }
          />
        ))}
      </div>
    </>
  );
}
