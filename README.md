<img src="https://leaders2021.innoagency.ru/static/img/general/logo.svg"
  style="height: 80px;">

# Sport Object Analysis

Sport Object Analysis web client for Digital Transformation Leaders 2021 contest

Application introduces an interactive map of Moscow sport objects with
different filters and recomendations for district infrastructure development.

## Build & run

### Dependencies

First of all install dependencies:
```sh
npm install
```

### Development

For development purposes run
```sh
npm start
```

Browser will automatically open and navigate to `http://localhost:4200`. The
app will automatically reload if you change any of the source files.

### Production

For production docker image can be build with:
```sh
docker build -t soa-web-client .
```

Run it inside a container with
```sh
docker run -d -p <port>:80 --name soa-web-client-container soa-web-client
```

It will run application on `0.0.0.0:<port>` (where `<port>` is an OS port).

## Development tips

### Code scaffolding

This project uses [Angular CLI](https://github.com/angular/angular-cli).

All Angular instances are generated without tests (`.spec.ts` files). To
generate with tests add `--skip-tests=false`.

All Angular components are generated with `OnPush` change detection strategy.

### Building

To build the project run
```sh
npm run build
```

The build artifacts will be stored in the `dist/` directory.

### Linting

To lint TypeScript and HTML templates files run
```sh
npm run lint
```

In case of linting SCSS files run
```sh
npm run lint:styles
```

### Running unit tests

To execute the unit test via [Karma](https://karma-runner.github.io) run
```sh
npm run test
```

## Useful links

- [Project design](https://www.figma.com/file/4LcthiNDdRnlH5hfC5Esd5/TechPotion?node-id=2%3A4)
- [Task board](https://github.com/techpotion/leaders2021-web-client/projects/1)
- [Other project repos](https://github.com/techpotion?q=leaders2021)
- [Project on contest website](https://leaders2021.innoagency.ru/05/)
