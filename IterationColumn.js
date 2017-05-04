Ext.define('IterationColumn', {
    extend: 'Rally.ui.cardboard.Column',
    alias: 'widget.iterationcolumn',

    config: {
        iterations: []
    },

    constructor: function(config) {
        this.mergeConfig(config);
        this.config = Ext.merge({
            columnHeaderConfig: {
                record: this._getTimeboxRecord(),
                fieldToDisplay: 'Name',
                editable: false
            }
        }, this.config);
        this.config.value = Rally.util.Ref.getRelativeUri(this._getTimeboxRecord());
        this.callParent([this.config]);
    },

    getStoreFilter: function() {
        return [
            {
                property: 'Iteration.Name',
                value: this._getTimeboxRecord().get('Name')
            },
            {
                property: 'Iteration.StartDate',
                value: Rally.util.DateTime.toIsoString(this._getTimeboxRecord().get('StartDate'))
            },
            {
                property: 'Iteration.EndDate',
                value: Rally.util.DateTime.toIsoString(this._getTimeboxRecord().get('EndDate'))
            }
        ];
    },

    afterRender: function() {
        this.callParent(arguments);

        var cls = 'planning-column';
        _.invoke(this.getContentCellContainers(), 'addCls', cls);
        this.getColumnHeaderCell().addCls(cls);
    },

    isMatchingRecord: function(record) {
        var likeIteration = this.iterations[0].raw,
            recordIteration = record.get('Iteration');
        
        return likeIteration.StartDate === recordIteration.StartDate &&
            likeIteration.EndDate === recordIteration.EndDate &&
            likeIteration.Name === recordIteration.Name;
    },

    drawHeader: function() {
        this.callParent(arguments);
        this._addTimeboxDates();
    },

    _addTimeboxDates: function() {
        this.getColumnHeader().add({
            xtype: 'component',
            html: this.getTimeboxDatesTpl().apply(this.getTimeboxDatesTplData())
        });
    },

    getTimeboxDatesTpl: function() {
        this.timeboxDatesTpl = this.timeboxDatesTpl || Ext.create('Ext.XTemplate',
            '<div class="timeboxDates">{formattedStartDate} - {formattedEndDate}</div>');

        return this.timeboxDatesTpl;
    },

    getTimeboxDatesTplData: function() {
        return {
            formattedStartDate: this._getFormattedDate('StartDate'),
            formattedEndDate: this._getFormattedDate('EndDate')
        };
    },

    _getFormattedDate: function(fieldName) {
        return Rally.util.DateTime.formatDate(this._getTimeboxRecord().get(fieldName), false);
    },

    _getTimeboxRecord: function() {
        return this.iterations[0];
    }
});