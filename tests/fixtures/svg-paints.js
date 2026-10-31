// Geometric fixtures only; no client artwork or fonts.
export const svgPaints = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 200 100">
<defs><style><![CDATA[
  rect { fill: #00ff00; }
  .cls-1 { fill: #ff0000; stroke: currentColor; stroke-width: 2; }
  #inline { fill: #0000ff; }
  .stop { stop-color: #0000ff; stop-opacity: 1; }
]]></style>
<linearGradient id="base" gradientUnits="userSpaceOnUse" x1="0" x2="100" y1="0" y2="0"><stop offset="0" stop-color="#ff0000"/><stop offset="1" class="stop"/></linearGradient>
<linearGradient id="linear" xlink:href="#base" gradientTransform="translate(0 0)" spreadMethod="reflect"/>
<radialGradient id="radial" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#0000ff"/></radialGradient>
<path id="path" d="M0 0h10v10h-10z"/>
<g id="part"><rect width="10" height="10"/></g>
<symbol id="symbol" viewBox="0 0 10 10"><rect width="10" height="10"/></symbol>
</defs>
<rect id="class" class="cls-1" fill="#000000" color="#123456" x="2" y="2" width="20" height="20"/>
<rect id="inline" class="cls-1" style="fill:#ffff00" x="30" y="2" width="20" height="20"/>
<g fill="#abcdef" opacity="0.5"><path id="inherited" d="M60 2h20v20h-20z"/></g>
<rect id="linear-box" x="0" y="30" width="100" height="20" fill="url(#linear)" style="fill:url(#linear)"/>
<rect id="radial-box" x="110" y="30" width="40" height="40" style="fill:url(#radial)"/>
<use href="#path" x="0" y="80"/><use href="#part" x="20" y="80"/><use href="#symbol" x="40" y="80" width="20" height="20"/>
</svg>`
