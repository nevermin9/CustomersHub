import { makeDistinct } from './functions';

onmessage = (e) => {
    const result = makeDistinct(e.data)
    postMessage(result)
}

