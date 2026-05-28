/** White logo PNG for e-mail (from maroela-logo.svg — same CSS as LbBrandLogo). */
const path = require('node:path');
const sharp = require('sharp');

const root = path.resolve(__dirname, '../..');
const input = path.join(root, 'client_web2/public/maroela-logo.svg');
const output = path.join(root, 'client_web2/public/maroela-logo-email-white.png');

sharp(input)
  .resize(240)
  .modulate({ brightness: 0 })
  .negate()
  .png()
  .toFile(output)
  .then((info) => {
    console.log('Wrote', output, info.size, 'bytes');
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
