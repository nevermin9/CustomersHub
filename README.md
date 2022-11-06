# CustomerHub

This application serves as an example of the UI for SQL.
Currently supports only SELECT operation.
The name *CustomerHub* was given because the user during session can manipulate with table of customers (public/customers.csv).

### Dependencies
- Vue.js 3
- Papaparse (parser for *csv*)
- PrimeVue & PrimeFlex

### Optimization & performance features
- Pagination. Used with DataTable component from PrimeVue library. The infinite scroll is preferred, but I am too lazy to make custom table. Pagination is 'virtual', i.e. without backend.
- WebWorkers. Usage of `createSafeWorker` is preferred, bc some browsers don't have `window.Worker`.