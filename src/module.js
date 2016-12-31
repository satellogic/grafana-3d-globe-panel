/* global _, window */
import config from 'app/core/config';
import { PanelCtrl } from 'app/plugins/sdk';
import angular from 'angular';

import './Cesium/Widgets/widgets.css!';
import './css/3d-globe-panel.css!';

require('./Cesium/Cesium.js');

const BASE_URL = `${config.appSubUrl}/public/plugins/satellogic-3d-globe-panel`;
const Cesium = window.Cesium;
const panelSettings = {
  url: '',
  bingKey: '',
};
window.CESIUM_BASE_URL = `${BASE_URL}/Cesium/`;

// Rectangle spanning the whole world, needed to fit the entire map in viewer
const rectangle = Cesium.Rectangle.fromDegrees(-180.0, -90.0, 180.0, 90.0);

// Set the default zoom to fit the entire rectangle withinin the view
Cesium.Camera.DEFAULT_VIEW_FACTOR = 0.0;

// Main Globe Control
export class GlobeCtrl extends PanelCtrl {
  constructor($scope, $injector, $rootScope) {
    super($scope, $injector);
    this.rootScope = $rootScope;
    this.scope = $scope;

    this.panel = _.defaults(this.panel, panelSettings);
    this.timeSrv = $injector.get('timeSrv');
    this.templateSrv = $injector.get('templateSrv');

    this.events.on('refresh', this.refresh);
    this.events.on('init-edit-mode', this.onInitEditMode);
    this.events.on('render', this.updateViewerHeight);
    this.rootScope.onAppEvent('setCrosshair', this.updateCurrentTime, $scope);

    // Override Cesium timeline labels to use UTC or Browser timezone
    this.overrideTimelineLabels(this.scope.ctrl.dashboard);

    this.refresh();
  }
  overrideTimelineLabels = (dashboard) => {
    // Override Cesium Timeline.makelabel to transform dates from UTC.
    // This code is a strict port from https://github.com/AnalyticalGraphicsInc/cesium/blob/e786760dee9afb77493ddf624ccc31493c24084b/Source/Widgets/Timeline/Timeline.js#L317
    // with a few tweaks to shift the displayed time label to the correct tz.
    Cesium.Timeline.prototype.makeLabel = function makeLabel(_time) {
      const timelineMonthNames = [
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
      ];
      let millisecondString = ' UTC';
      let time = _time;
      const tzOffset = (new Date()).getTimezoneOffset();
      const twoDigits = num => (
        (num < 10) ? (`0${num.toString()}`) : num.toString()
      );

      if (!dashboard.isTimezoneUtc() && tzOffset !== 0) {
        time = Cesium.JulianDate.addMinutes(
          time,
          -1 * tzOffset,
          new Cesium.JulianDate()
        );

        millisecondString = ` UTC${tzOffset > 0 ? '-' : '+'}` +
                            `${twoDigits(Math.floor(tzOffset / 60))}:` +
                            `${twoDigits(tzOffset % 60)}`;
      }
      const gregorian = Cesium.JulianDate.toGregorianDate(time);
      const millisecond = gregorian.millisecond;

      // eslint-disable-next-line no-underscore-dangle
      if ((millisecond > 0) && (this._timeBarSecondsSpan < 3600)) {
        millisecondString = Math.floor(millisecond).toString();
        while (millisecondString.length < 3) {
          millisecondString = `0${millisecondString}`;
        }
        millisecondString = `.  ${millisecondString}`;
      }
      // eslint-disable-next-line max-len
      return `${timelineMonthNames[gregorian.month - 1]} ${gregorian.day} ${gregorian.year} ${twoDigits(gregorian.hour)}:${twoDigits(gregorian.minute)}:${twoDigits(gregorian.second)}${millisecondString}`;
    };
  }
  onInitEditMode = () => {
    this.addEditorTab(
      'Options',
      'public/plugins/satellogic-3d-globe-panel/editor.html',
      2,
    );
  }
  registerViewer = (viewer) => {
    this.viewer = viewer;
    this.updateViewerTimespan();
  }
  updateViewerTimespan = () => {
    let { from, to } = this.timeSrv.timeRange();
    from = Cesium.JulianDate.fromDate(
      from.toDate(),
      new Cesium.JulianDate()
    );
    to = Cesium.JulianDate.fromDate(
      to.toDate(),
      new Cesium.JulianDate()
    );
    // Update Cesium clock timespan
    this.viewer.clock.startTime = from;
    this.viewer.clock.stopTime = to;

    // Zoom timeline to include the whole timespan
    this.viewer.timeline.zoomTo(from, to);
  }
  updateViewerHeight = () => {
    // Cesium needs a fixed height to correctly size its canvas
    this.viewer.container.style.height = `${Math.ceil(this.height)}px`;

    // Add a small delay to ensure the rectangle is correclty displayed
    window.setTimeout(() => {
      this.viewer.camera.setView({
        destination: rectangle,
      });
    }, 100);
  }
  updateCurrentTime = (event, info) => {
    if (this.scope.ctrl.dashboard.sharedCrosshair) {
      this.viewer.clock.currentTime = Cesium.JulianDate.fromDate(
        new Date(info.pos.x),
        new Cesium.JulianDate()
      );
    }
  }
  refresh = () => {
    if (this.panel.bingKey) {
      Cesium.BingMapsApi.defaultKey = this.panel.bingKey;
    }
    if (this.viewer && this.panel.url) {
      // Get global from/to
      const { from, to } = this.timeSrv.timeRange();

      // Replace querystring with dashboard's templates and from/to
      const url = this.templateSrv.replace(
        `${this.panel.url}?${this.panel.query}`,
        this.panel.scopedVars,
        'pipe'
      ).replace(/\$timeFrom/g, +from)
       .replace(/\$timeTo/g, +to);

      this.viewer.dataSources.removeAll(true);
      this.viewer.dataSources.add(
        Cesium.CzmlDataSource.load(url)
      ).then(
        null,
        (err) => {
          this.rootScope.appEvent(
            'alert-error',
            ['Plugin Error', `Error while retrieving CZML data: ${err}`],
          );
        },
      );
    } else if (this.viewer) {
      // Hook Cesium timespan to Grafana's
      this.updateViewerTimespan();
    }
  }
}

GlobeCtrl.templateUrl = 'module.html';

// Register the globe directive
angular.module('grafana.directives')
.directive('gfSatellogic3dGlobe', () => ({
  template: '<div class="cesiumContainer"></div>',
  replace: true,
  restrict: 'E',
  link: (scope, element) => {
    const STARS_FOLDER = `${BASE_URL}/Cesium/Assets/Textures`;
    const viewer = new Cesium.Viewer(element[0], {
      skyBox: new Cesium.SkyBox({
        sources: {
          positiveX: `${STARS_FOLDER}/SkyBox/tycho2t3_80_px.jpg`,
          negativeX: `${STARS_FOLDER}/SkyBox/tycho2t3_80_mx.jpg`,
          positiveY: `${STARS_FOLDER}/SkyBox/tycho2t3_80_py.jpg`,
          negativeY: `${STARS_FOLDER}/SkyBox/tycho2t3_80_my.jpg`,
          positiveZ: `${STARS_FOLDER}/SkyBox/tycho2t3_80_pz.jpg`,
          negativeZ: `${STARS_FOLDER}/SkyBox/tycho2t3_80_mz.jpg`,
        },
      }),
      sceneMode: Cesium.SceneMode.SCENE2D,
      animation: false,
      geocoder: false,
      shadows: true,
    });

    // Make lighting permanent and not fade out with zoom distance
    viewer.scene.globe.enableLighting = true;
    viewer.scene.globe.lightingFadeOutDistance = 65000000.0;

    // Wait for the first imagery layer to be ready before zooming out
    viewer.imageryLayers.get(0).imageryProvider.readyPromise.then(() => {
      scope.ctrl.updateViewerHeight();
    });

    scope.ctrl.registerViewer(viewer);
  },
}));

export { GlobeCtrl as PanelCtrl };
