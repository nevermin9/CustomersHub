export const QUERY_PANEL_KEY = Symbol('query-panel')

export class QueryPanelProvide {
    constructor({
        displayableColumns,
        displayableData,
        setDisplayableColumns,
        setDisplayableData,
        allData,
        allColumns,
    }) {
        this.displayableColumns = displayableColumns
        this.displayableData = displayableData
        this.setDisplayableColumns = setDisplayableColumns
        this.setDisplayableData = setDisplayableData
        this.allData = allData
        this.allColumns = allColumns
    }
}