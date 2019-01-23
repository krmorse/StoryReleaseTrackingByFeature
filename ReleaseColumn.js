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
        var record = this._getTimeboxRecord();
        if (record === null) {
            return this.callParent(arguments);
        } else {
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
        }
    },

    afterRender: function() {
        this.callParent(arguments);

        var cls = 'planning-column';
        _.invoke(this.getContentCellContainers(), 'addCls', cls);
        this.getColumnHeaderCell().addCls(cls);
    },

    isMatchingRecord: function(record) {
        if (this._getTimeboxRecord()) {
            var likeRelease = this.releases[0].raw,
                recordRelease = record.get('Release');
            
            return likeRelease.ReleaseStartDate === recordRelease.ReleaseStartDate &&
                likeRelease.ReleaseDate === recordRelease.ReleaseDate &&
                likeRelease.Name === recordRelease.Name;
        } else {
            return record.raw.Release === null &&
                this._getTimeboxRecord() === null;
        }
    },

    drawHeader: function() {
        this.callParent(arguments);

        if (this._getTimeboxRecord()) {
            this._addTimeboxDates();
        } else {
            this.getColumnHeader().add({
                xtype: 'component',
                html: 'Unscheduled'
            });
        }
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
    },

    _getTimeboxScope: function() {
        return Ext.create('Rally.app.TimeboxScope', {
            record: this._getTimeboxRecord(),
            type: 'release'
        });
    }
});