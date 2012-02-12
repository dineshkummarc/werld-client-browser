Werld.Views.Screen = Backbone.View.extend({
  initialize: function() {
    this.container = new Container();
    this.container.tick = _.bind(this.tick, this);
    this.model.get('character').bind('change:status', this.onCharacterChangeStatus, this);
    this.createMapTileViews();
  },
  createMapTileViews: function() {
    var mapTiles = this.model.get('map').get('tiles');

    this.mapTileViews = [];
    for (var i = 0; i < mapTiles.length; i++) {
      this.mapTileViews[i] = [];
      for (var j = 0; j < mapTiles[i].length; j++) {
        this.mapTileViews[i][j] = new Werld.Views.Tile({
          model: mapTiles[i][j]
        });
      }
    }
  },
  tick: function() {
    var screenCoordinates = this.model.get('coordinates');
    var screenDimensions = this.model.get('dimensions');

    var screenBaseTile = _(screenCoordinates).map(function(pixel) {
      return(Werld.util.pixelToTile(pixel));
    });

    /* The offset has to be >= 0 and <= 40 or else the tiles will flicker when
     * the offset tends to 40. */
    var offset = _(screenCoordinates).map(function(pixel) {
      return(pixel -
               Math.floor(pixel / Werld.Config.PIXELS_PER_TILE) *
               Werld.Config.PIXELS_PER_TILE);
    });

    for (var i = 0; i <= screenDimensions[0]; i++) {
      for (var j = 0; j <= screenDimensions[1]; j++) {
        var screenTile = [i + screenBaseTile[0], j + screenBaseTile[1]];

        if (screenTile[0] > 0 && screenTile[0] < Werld.Config.WORLD_MAP_DIMENSIONS[0] &&
              screenTile[1] > 0 && screenTile[1] < Werld.Config.WORLD_MAP_DIMENSIONS[1]) {
          this.mapTileViews[screenTile[0]][screenTile[1]].draw(
            [Werld.util.tileToPixel(i), Werld.util.tileToPixel(j)], offset
          );
        } else {
          Werld.canvas.context.fillStyle = 'black';
          Werld.canvas.context.fillRect(
            Werld.util.tileToPixel(i) - offset[0],
            Werld.util.tileToPixel(j) - offset[1],
            Werld.Config.PIXELS_PER_TILE,
            Werld.Config.PIXELS_PER_TILE
          );
        }
      }
    }
  },
  onCharacterChangeStatus: function() {
    var statusChangeTextHandler = function(text, context) {
      var text = new Text(text, '40px "PowellAntique" serif', '#dc9a44');
      text.textAlign = 'center';
      text.x = 320;
      text.y = 200;
      text.shadow = new Shadow('#000000', 2, 2, 0);
      context.container.addChild(text);
      _.delay(function(context) {
        context.container.removeChild(text);
      }, 3000, context)
    }

    if (this.model.get('character').alive()) {
      statusChangeTextHandler('You are alive', this);
    } else if (this.model.get('character').dead()) {
      statusChangeTextHandler('You are dead', this);
    }
  }
});
