# CustomerHub
[website](https://customerhub-6e0c4.web.app/)

This application serves as an example of the UI for SQL.
Currently supports only SELECT operation.
The name *CustomerHub* was given because the user during session can manipulate with table of customers (public/customers.csv).
The general component here is `QueryPanels`. It is an independent smart component, that doesn't care about data it is used to handle. Its interface for `provide` is described in `@/components/QueryPanels/models/query-panels-provide.js`;

### Dependencies
- Vue.js 3
- Papaparse (parser for *csv*)
- PrimeVue & PrimeFlex
- web-vitals

### Optimization & performance features
- Pagination. Used with DataTable component from PrimeVue library. The infinite scroll is preferred, but I am too lazy to make custom table. Pagination is 'virtual', i.e. without backend, just slices of `displayableData` array.
- WebWorkers is used to move loops through data to another thread. Usage of `createSafeWorker` is preferred, bc some browsers don't have `window.Worker`.
- Usage of `computed` and `ref` objects because they are more safe in terms of the memory leak prevention.

### Average performance metrics
`web-vitals` & Chrome DevTools is used to measure page load time. PerformanceObservable is used to measure performance of the Web Workers.
The user can see performance metrics during session (panel on the top of the website and performance of a SQL query next to the *Add condition* button.)
| Metric | w/o throttling | w/ Slow 3G | w/ CPU 6x slowdown |
| ------ | ------ | ------ | ------ |
| *Largest Contentful Paint* | 150ms | 3s | 500ms |
| *First time to byte* | 30ms | 100ms | 30ms |
| *First Input Delay* | 2ms | 2ms | 2ms |
| *Data iteration* (91 records) | 7ms | - | 30ms |
