# 3D Globe Panel for Grafana
[![license](https://img.shields.io/github/license/mashape/apistatus.svg)]()

A [Cesium.js](http://cesiumjs.org/) based 3D Globe panel, with some customization
options.

## Features

This panel just takes a CZML server URL and feeds it into the *Cesium* viewer,
providing some customization options for the URL:

 * Use any template variable defined in the dashboard, either in the Base URL or
   Querystring.
 * Two built-in template variables giving easy access to the boundaries of the
   currently selected time range, expressed as unit timestamps:
   * `$timeFrom`
   * `$timeTo`

## Installation

### Grafana CLI

Install this plugin with the `grafana-cli`:

    $ grafana-cli plugins install satellogic-3d-globe-panel

### Manual Install

Just checkout this repo inside your grafana plugins directory, usually located
at `/var/lib/grafana/plugins`, and restart `grafana-server` so it registers the
new plugin.

## Build

If you want to build this plugin from source, all you need is Node.js v6.5 or
newer. Then run:

    $ npm install
    $ npm run build

That will build everything and place it in the `dist` directory.

## Contributing

1. Fork it!
2. Create your feature branch: `git checkout -b my-new-feature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin my-new-feature`
5. Submit a pull request :zap:

## History

##### 0.1.0 (12/16)

Initial release

## Credits

Globe icon made by [http://www.freepik.com](Freepik) from
[www.flaticon.com](http://www.flaticon.com) is licensed by
[CC 3.0](http://creativecommons.org/licenses/by/3.0/) BY</a>

## License

The MIT License (MIT)

Copyright (c) 2016 Satellogic SA.

See [LICENSE](LICENSE) for details
