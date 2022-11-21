export const doSearch = (eventData) => {
    //
    const { data, conditions } = eventData;

    let result = [];

    if (conditions.length === 0) {
        return data;
    }

    for (const group of conditions) {
        const groupResult = [];

        dataLoop:
        for (const item of data) {
            if (result.indexOf(item) >= 0) {
                continue;
            }

            for (let i = 0; i < group.length; i++) {
                const condition = group[i]
                const condCol = condition.column;
                const condVal = condition.value;
                const isInverted = condition.isInverted;

                if ((!isInverted && !item[condCol].startsWith(condVal))
                    || (isInverted && item[condCol].startsWith(condVal))) {
                    // Don't loop through next conditions,
                    // if item don't fit at least one
                    // continue with next item
                    continue dataLoop;
                }
            }
            groupResult.push(item);
        }
        result = result.concat(groupResult)
    }

    return result;
}
