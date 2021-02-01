const colors = [
  'Red',
  'Blue',
  'Green',
  'Pink',
  'Orange',
  'Yellow',
  'Black',
  'White',
  'Purple',
  'Brown',
  'Cyan',
  'Lime',
];

const map = {
  cafeteria: {
    aliases: ['cafeteria'],
    exits: { e: 'medical', w: 'weapons', s: 'admin' },
    vents: ['admin', 'oxygen'],
  },
  medical: {
    aliases: ['medical', 'medbay'],
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
    exits: { e: 'cafeteria', s: 'oxygen' },
    vents: ['navigation', 'shields'],
  },
  upper: {
    aliases: ['upper reactor', 'upper'],
    exits: { w: 'medical', s: 'reactor' },
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
    vents: ['medical', 'electrical'],
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
    vents: ['security', 'medical'],
  },
};

module.exports = {
  colors,
  map,
};
