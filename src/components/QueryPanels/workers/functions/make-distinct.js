export const makeDistinct = (eventData) => {
    const { data, cols } = eventData;
    let result = [];
    const values = [];

    for (let i = 0; i < cols.length; i++) {
        const col = cols[i];
        const currentResult = [];

        for (const item of data) {
            const val = item[col];
            if (values.indexOf(val) < 0) {
                currentResult.push(item);
                values.push(val)
            }
        }

        if (currentResult.length >= result.length) {
            result = currentResult;
        }
    }

    return result;
}
