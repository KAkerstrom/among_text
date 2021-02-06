const colors = [
  'red',
  'blue',
  'green',
  'pink',
  'orange',
  'yellow',
  'black',
  'white',
  'purple',
  'brown',
  'cyan',
  'lime',
];

const map = {
  cafeteria: {
    aliases: ['cafeteria'],
    exits: { w: 'medbay', e: 'weapons', s: 'admin' },
    vents: ['admin', 'oxygen'],
  },
  medbay: {
    aliases: ['medbay', 'medical'],
    exits: { w: 'upper', e: 'cafeteria' },
    vents: ['security', 'electrical'],
  },
  admin: {
    aliases: ['admin', 'administration'],
    exits: { n: 'cafeteria', s: 'storage' },
    vents: ['cafeteria', 'oxygen'],
  },
  weapons: {
    aliases: ['weapons'],
    exits: { w: 'cafeteria', s: 'oxygen' },
    vents: ['navigation', 'shields'],
  },
  upper: {
    aliases: ['upper reactor', 'upper'],
    exits: { e: 'medbay', s: 'reactor' },
    vents: ['reactor'],
  },
  lower: {
    aliases: ['lower reactor', 'lower'],
    exits: { n: 'reactor', e: 'electrical' },
    vents: ['reactor'],
  },
  reactor: {
    aliases: ['reactor'],
    exits: { n: 'upper', e: 'security', s: 'lower' },
    vents: ['upper', 'lower'],
  },
  security: {
    aliases: ['security', 'cams', 'cameras'],
    exits: { w: 'reactor' },
    vents: ['medbay', 'electrical'],
  },
  oxygen: {
    aliases: ['oxygen', 'o2', 'oxy'],
    exits: { n: 'weapons', e: 'navigation', s: 'shields' },
    vents: ['cafeteria', 'admin'],
  },
  navigation: {
    aliases: ['navigation', 'nav'],
    exits: { w: 'oxygen' },
    vents: ['weapons', 'shields'],
  },
  shields: {
    aliases: ['shields', 'shield'],
    exits: { n: 'oxygen', w: 'communications' },
    vents: ['weapons', 'navigation'],
  },
  communications: {
    aliases: ['communications', 'com', 'comm', 'coms', 'comms'],
    exits: { w: 'storage', e: 'shields' },
  },
  storage: {
    aliases: ['storage'],
    exits: { n: 'admin', w: 'electrical', e: 'communications' },
  },
  electrical: {
    aliases: ['electrical'],
    exits: { w: 'lower', e: 'storage' },
    vents: ['security', 'medbay'],
  },
};

module.exports = {
  colors,
  map,
};
