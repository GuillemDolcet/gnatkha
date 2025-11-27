const Logo = ({width = 46, height = 51}) => (
    <div className="flex items-center text-black dark:text-white">
        <svg version="1.0"
             xmlns="http://www.w3.org/2000/svg"
             width={width}
             height={height}
             viewBox="0 0 46 51"
             preserveAspectRatio="xMidYMid meet"
             fill="currentColor"
             >
            <g transform="translate(0.000000,57.000000) scale(0.100000,-0.100000)"
               stroke="none">
                <path d="M210 479 c-101 -58 -115 -70 -118 -95 -2 -25 4 -33 44 -57 46 -28 72-29 93 -3 9 11 4 18 -26 36 l-37 22 78 44 c81 47 90 57 84 96 -3 23 -7 21-118 -43z"/>
                <path d="M235 310 c-109 -64 -201 -122 -203 -128 -1 -5 5 -12 14 -16 11 -4 89 36 225 115 168 98 207 125 198 135 -6 8 -17 14 -23 13 -6 0 -101 -54 -211 -119z"/>
                <path d="M272 400 c-34 -21 -35 -40 -2 -40 26 0 91 40 84 51 -9 15 -47 10 -82 -11z"/>
                <path d="M286 273 l-30 -16 37 -21 c20 -11 37 -24 37 -28 0 -4 -29 -23 -65 -44 -36 -20 -72 -43 -80 -51 -17 -17 -20 -63 -5 -63 6 0 48 21 93 47 165 94 178 114 100 163 -54 35 -49 34 -87 13z"/>
                <path d="M181 208 c-31 -20 -32 -22 -16 -35 16 -11 24 -9 59 10 22 12 39 27 38 32 -3 18 -46 14 -81 -7z"/>
            </g>
        </svg>
        <div className="leading-3.5 ms-2 font-medium text-xs">
            <div>GUILLEM</div>
            <div className="flex justify-center">DOLCET</div>
        </div>
    </div>
);

export default Logo;