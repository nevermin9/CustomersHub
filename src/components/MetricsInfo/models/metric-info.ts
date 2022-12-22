export default class MetricInfo {
    constructor({
        name,
        tooltip,
        value,
        colorClass,
    }) {
        this.name = name
        this.tooltip = tooltip
        this.value = value
        this.colorClass = colorClass
    }
}
