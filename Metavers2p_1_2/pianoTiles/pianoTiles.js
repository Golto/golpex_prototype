const canvas = document.getElementById('pianoCanvas')
canvas.width = 400
canvas.height = 600
const ctx = canvas.getContext('2d')

// Définir les dimensions de la grille
const columns = 4
const rows = 7

// Définir la taille d'une tile
const tileWidth = canvas.width / columns
const tileHeight = canvas.height / rows

// Définir la couleur des tiles et des lignes
const tileColor = 'red'
const lineColor = 'black'

// Dessiner les colonnes
for (let i = 0; i < columns; i++) {
  ctx.fillStyle = tileColor
  ctx.fillRect(i * tileWidth, 0, tileWidth - 5, canvas.height)
}

// Dessiner les lignes
ctx.fillStyle = lineColor
ctx.fillRect(0, canvas.height - tileHeight * 2, canvas.width, 2)
ctx.fillRect(0, canvas.height - tileHeight, canvas.width, 2)


class Tile {
  constructor(column, t) {
    this.column = column;
    this.t = t; // avancement dans la colonne, t = 0 en début de colonne et 1 en fin de colonne
  }

  next(speed) {
    this.t += speed;
  }
}

const Tiles = new Set();

function generateRandomTile() {
  const column = Math.floor(Math.random() * 4); // Générer une colonne aléatoire
  const tile = new Tile(column, 0);
  Tiles.add(tile);
}

function render() {
  // Effacer le canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Dessiner les colonnes
  const tileWidth = canvas.width / 4;
  const tileHeight = canvas.height / 20;
  const tileColor = 'white';
  for (let i = 0; i < 4; i++) {
    ctx.fillStyle = tileColor;
    ctx.fillRect(i * tileWidth, 0, tileWidth, canvas.height);
  }

  // Dessiner les lignes
  const lineColor = 'black';
  ctx.fillStyle = lineColor;
  ctx.fillRect(0, canvas.height - tileHeight * 2, canvas.width, 2);
  ctx.fillRect(0, canvas.height - tileHeight, canvas.width, 2);

  // Dessiner les tiles
  const tileWidthOffset = tileWidth / 2 - 10;
  const tileHeightOffset = tileHeight / 2 - 10;
  const tileBorderColor = 'black';
  const tileBorderWidth = 2;
  const tileFillColor = 'yellow';
  for (let tile of Tiles) {
    const x = tile.column * tileWidth + tileWidthOffset;
    const y = tile.t * canvas.height - tileHeightOffset;
    ctx.fillStyle = tileFillColor;
    ctx.fillRect(x-40, y, 20+40, 20);
    ctx.strokeStyle = tileBorderColor;
    ctx.lineWidth = tileBorderWidth;
    ctx.strokeRect(x-40, y, 20+40, 20);
    tile.next(0.01);

    if (tile.t > 1) {Tiles.delete(tile)}
  }

  // Générer une nouvelle tile toutes les 0.5 secondes
  setInterval(generateRandomTile, 20);
}

// Appeler la fonction render à intervalles réguliers pour mettre à jour l'affichage
setInterval(render, 1000 / 60); // 60 FPS
