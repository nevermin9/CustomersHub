import { doSearch } from './functions'

onmessage = (e) => {
    const result = doSearch(e.data);
    postMessage(result);
}
