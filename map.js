// Vercel serverless function: GET /api/map -> capital and secret locations (1000x1000 hex map)
module.exports = (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  res.status(200).json({
    pc: [80, 920], ec: [920, 80],
    secrets: [
      { type: 'anvil', c: 300, r: 640, h: [325, 610] },
      { type: 'vault', c: 640, r: 330, h: [610, 350] }
    ]
  });
};
