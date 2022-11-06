import { makeSearch } from './functions'

onmessage = (e) => {
    const result = makeSearch(e.data);
    postMessage(result);
}
