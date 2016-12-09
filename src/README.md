# 3D Globe Panel

A *[Cesium.js](http://cesiumjs.org/)* based 3D Globe panel, with some customization
options. Just define your CZML datasource in the options section and the panel
will render it.

You can use any template variable you defined in your dashboard as part of the
Querystring or Base URL, with two extra variables replaced by the plugin:

  * `$timeFrom`: Unix timestamp with the start of the currently selected time range
  * `$timeTo`: Unix timestamp with the end of the currently selected time range
