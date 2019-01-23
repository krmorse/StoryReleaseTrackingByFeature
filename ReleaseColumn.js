Ext.define('ReleaseColumn', {
    extend: 'Rally.ui.cardboard.Column',
    alias: 'widget.releasecolumn',

    plugins: ['rallycardboardcollapsiblecolumns'],

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
                property: 'Release.Name',
                value: this._getTimeboxRecord().get('Name')
            },
            {
                property: 'Release.ReleaseStartDate',
                value: Rally.util.DateTime.toIsoString(this._getTimeboxRecord().get('ReleaseStartDate'))
            },
            {
                property: 'Release.ReleaseDate',
                value: Rally.util.DateTime.toIsoString(this._getTimeboxRecord().get('ReleaseDate'))
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
        var likeRelease = this.releases[0].raw,
            recordRelease = record.get('Release');
        
        return likeRelease.ReleaseStartDate === recordRelease.ReleaseStartDate &&
            likeRelease.ReleaseDate === recordRelease.ReleaseDate &&
            likeRelease.Name === recordRelease.Name;
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
            formattedStartDate: this._getFormattedDate('ReleaseStartDate'),
            formattedEndDate: this._getFormattedDate('ReleaseDate')
        };
    },

    _getFormattedDate: function(fieldName) {
        return Rally.util.DateTime.formatDate(this._getTimeboxRecord().get(fieldName), false);
    },

    _getTimeboxRecord: function() {
        return this.releases[0];
    }
});