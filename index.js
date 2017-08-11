const svg2png = require('svg2png');

const getSizesFromOptOrDefault = opt => {
  if (opt) {
    const unparsedSizes = Array.isArray(opt) ? opt : [opt];
    return unparsedSizes.map(unparsedSize => {
      const results = /(\d+)x(\d+)/.exec(unparsedSize);
      if (results) {
        const w = parseInt(results[1], 10);
        const h = parseInt(results[2], 10);
        return {
          w,
          h,
        };
      } else {
        throw new Error(`Malformed resolution argument: ${unparsedSize}`);
      }
    });
  } else {
    return [
      {
        w: 2880,
        h: 1800,
      },
      {
        w: 750,
        h: 1334,
      },
    ];
  }
};

const deepFlatten = arr =>
  arr.reduce(
    (cumulative, inner) =>
      cumulative.concat(Array.isArray(inner) ? deepFlatten(inner) : inner),
    []
  );

const render = (colors, options) => {
  try {
    var sizes = getSizesFromOptOrDefault(
      options['themer-wallpaper-triangles-size']
    );
  } catch (e) {
    return [Promise.reject(e.message)];
  }

  const colorSets = [
    {name: 'dark', colors: colors.dark},
    {name: 'light', colors: colors.light},
  ].filter(colorSet => !!colorSet.colors);

  return deepFlatten(
    sizes.map(size =>
      colorSets.map(colorSet => {
        const {
          shade0,
          shade1,
          shade2,
          shade3,
          shade4,
          shade5,
          shade6,
          shade7,
          accent0,
          accent1,
          accent2,
          accent3,
          accent4,
          accent5,
          accent6,
          accent7,
        } = colorSet.colors;
        const svgString = `
          <svg width="${size.w}" height="${size.h}" viewBox="0 0 ${size.w} ${size.h}" xmlns="http://www.w3.org/2000/svg">
            <style>
              .triangle { opacity: 0.2; }
              .triangle--zero { fill: ${shade0}; }
              .triangle--seven { fill: ${shade7}; }
            </style>
            <defs>
              <pattern id="triangles" width="24" height="48" patternUnits="userSpaceOnUse">
                <path class="triangle triangle--zero" d="M0,0 L24,0 L12,24 Z" />
                <path class="triangle triangle--zero" d="M0,24 L12,24 L0,48 Z" />
                <path class="triangle triangle--zero" d="M12,24 L24,24 L 24,48 Z" />
                <path class="triangle triangle--seven" d="M0,0 L12,24 L0,24 Z" />
                <path class="triangle triangle--seven" d="M24,0 L24,24 L12,24 Z" />
                <path class="triangle triangle--seven" d="M12,24 L24,48 L0,48 Z" />
              </pattern>
              <linearGradient id="warm-linear" x1="0" y1="50%" x2="100%" y2="100%">
                <stop stop-color="${accent7}" offset="0%" />
                <stop stop-color="${accent2}" offset="100%" />
              </linearGradient>
              <linearGradient id="cool-linear" x1="100%" y1="0" x2="0" y2="100%">
                <stop stop-color="${accent4}" offset="0%" />
                <stop stop-color="${accent4}" stop-opacity="0" offset="45%" />
              </linearGradient>
              <linearGradient id="accent-linear" x1="0" y1="100%" x2="100%" y2="0">
                <stop stop-color="${accent0}" offset="0%" />
                <stop stop-color="${accent0}" stop-opacity="0" offset="25%" />
              </linearGradient>
            </defs>
            <rect x="0" y="0" width="100%" height="100%" fill="url(#warm-linear)" />
            <rect x="0" y="0" width="100%" height="100%" fill="url(#cool-linear)" />
            <rect x="0" y="0" width="100%" height="100%" fill="url(#accent-linear)" />
            <rect x="0" y="0" width="100%" height="100%" fill="url(#triangles)" />
          </svg>
        `;
        const basename = `themer-wallpaper-triangles-${colorSet.name}-${size.w}x${size.h}`;
        const svgBuffer = Buffer.from(svgString, 'utf8');
        return [
          Promise.resolve({name: `${basename}.svg`, contents: svgBuffer}),
          svg2png(svgBuffer).then(pngBuffer => ({
            name: `${basename}.png`,
            contents: pngBuffer,
          })),
        ];
      })
    )
  );
};

module.exports = {
  render,
};
