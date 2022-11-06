
export default class ConditionRow {
    constructor({
        column,
        value,
        isInverted,
        combinator
    }) {
        this.column = column;
        this.value = value;
        this.isInverted = isInverted;
        this.combinator = combinator;
    }

    toJSON() {
        return JSON.parse(this);
    }
}
