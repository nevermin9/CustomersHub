import { doDistinct } from './functions';

onmessage = (e) => {
    const result = doDistinct(e.data)
    postMessage(result)
}

