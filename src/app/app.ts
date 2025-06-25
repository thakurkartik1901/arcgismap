import { Component, ElementRef, ViewChild } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { loadModules } from 'esri-loader';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  @ViewChild('mapView') mapViewElement!: ElementRef;

  mapView: any;
  on: any;

  addGeofenceToolbar: any;
  selectionLayer: any;

  FeatureLayer: any;
  Draw: any;
  Edit: any;
  Point: any;
  Graphic: any;
  SimpleMarkerSymbol: any;
  SimpleFillSymbol: any;
  SimpleLineSymbol: any;
  UniqueValueRenderer: any;
  Color: any;

  ngOnInit() {
    setTimeout(() => {
      this.loadMap();
    }, 500);
  }

  loadMap() {
    loadModules([
      'esri/map',
    "esri/config",
    "esri/graphic",
    "esri/graphicsUtils",
    "esri/geometry/geometryEngine",
    "esri/toolbars/draw",
    "esri/symbols/SimpleFillSymbol",
    "esri/symbols/SimpleLineSymbol",
    "esri/Color",
    "esri/layers/FeatureLayer",
    "esri/layers/GraphicsLayer",
    "esri/layers/KMLLayer",
    "dojo/on",
    "dojo/_base/array",
    "esri/toolbars/edit",
    "esri/SpatialReference",
    "esri/geometry/webMercatorUtils",
    "esri/renderers/UniqueValueRenderer",
    "esri/geometry/Point",
    "esri/geometry/Polygon",
    "esri/symbols/SimpleMarkerSymbol",
    "dojo/dom-style"
    ])
      .then(
        ([
          Map, esriConfig, Graphic, graphicsUtils, geometryEngine, Draw, SimpleFillSymbol, SimpleLineSymbol, Color, FeatureLayer, GraphicsLayer, KMLLayer, on, array, Edit, SpatialReference, webMercatorUtils, UniqueValueRenderer, Point, Polygon, SimpleMarkerSymbol
        ]) => {
          this.FeatureLayer = FeatureLayer;
          this.on = on;
          this.Point = Point;
          this.Draw = Draw;
          this.Edit = Edit;
          this.Graphic = Graphic;
          this.SimpleMarkerSymbol = SimpleMarkerSymbol;
          this.SimpleFillSymbol = SimpleFillSymbol;
          this.SimpleLineSymbol = SimpleLineSymbol;
          this.UniqueValueRenderer = UniqueValueRenderer;
          this.Color = Color;

          //configure map animation to be faster
          esriConfig.defaults.map.panRate = 1000; // default panRate: 25
          esriConfig.defaults.map.zoomDuration = 1000; // default zoomDuration: 500
          esriConfig.defaults.map.zoomRate = 15; // default zoomRate: 25

          ///Map Declaration
          this.mapView = new Map(this.mapViewElement.nativeElement, {
            autoResize: true,
            basemap: 'streets',
            center: [77.0266, 28.4595],
            zoom: 12,
            showAttribution: true,
            SpatialReference: new SpatialReference({ wkid: 4326 }),
          });

          ///Add Layer to the map
          const mapLayers = [
            new SimpleFillSymbol(
              SimpleFillSymbol.STYLE_SOLID,
              SimpleLineSymbol(
                SimpleLineSymbol.STYLE_NULL,
                new Color('black'),
                3
              ),
              new Color([255, 255, 255, 0.25])
            ),
            this.selectionLayer,
          ];
          this.mapView.addLayers(mapLayers);

          ///Init Toolbar to add/edit Geofence on Map laod
          on(this.mapView, 'load', () => {
            initializeAddGeofenceToolbar();
          });

          ///Init Toolbar to draw Geofence
          const initializeAddGeofenceToolbar = () => {
            this.addGeofenceToolbar = Draw(this.mapView, {
              showTooltips: true,
              SpatialReference: new SpatialReference({ wkid: 4326 }),
            });
            this.addGeofenceToolbar.setFillSymbol(
              SimpleFillSymbol(
                SimpleFillSymbol.STYLE_SOLID,
                SimpleLineSymbol(
                  SimpleLineSymbol.STYLE_DASH,
                  new Color([0, 0, 0]),
                  2
                ),
                new Color([0, 0, 0, 0.2])
              )
            );
            this.addGeofenceToolbar.on('draw-complete', (evt) => {
              if (evt.geometry.rings[0].length <= 3) {
                alert('Geofence must have at least three vertices.');
                return;
              }
              this.addGeofenceToolbar.deactivate();
              this.mapView.enableMapNavigation();
              const graphic = new Graphic(
                webMercatorUtils.webMercatorToGeographic(evt.geometry),
                SimpleFillSymbol(
                  SimpleFillSymbol.STYLE_SOLID,
                  SimpleLineSymbol(
                    SimpleLineSymbol.STYLE_SOLID,
                    new Color([51, 168, 82]),
                    2
                  ),
                  new Color([175, 255, 155, 0.5])
                )
              );
              graphic.attributes = {
                OBJECTID: this.getRandomNegativeNumber(),
                TYPE: 'geofence',
              };
              this.mapView.graphics.add(graphic);
            });
          };
        }
      )
      .catch(() => {});
  }

  getRandomNegativeNumber() {
    return Math.floor(Math.random() * (-1 - -1000 + 1)) + -1000;
  }

  onDrawNew() {
    if (this.addGeofenceToolbar) {
      this.mapView.disableMapNavigation();
      this.addGeofenceToolbar.activate(this.Draw.POLYGON);
    }
  }
}
