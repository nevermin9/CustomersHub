export const makeSearch = (eventData) => {
    const { data, conditions } = eventData;

    let result = [];

    if (conditions.length === 0) {
        return data;
    }

    for (const group of conditions) {
        const groupResult = [];

        for (const item of data) {
            const candidate = group.reduce(($item, condition) => {
                if ($item === null || result.indexOf($item) >= 0) return null

                const condCol = condition.column;
                const condVal = condition.value;
                const isInverted = condition.isInverted;

                if ((isInverted && !$item[condCol].startsWith(condVal))
                    || (!condition.isInverted && $item[condCol].startsWith(condVal))) {
                    return $item;
                }

                return null;
            }, item)

            candidate && groupResult.push(candidate);
        }
        result = result.concat(groupResult)
    }

    return result;
}
