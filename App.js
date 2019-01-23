Ext.define('CustomApp', {
    extend: 'Rally.app.App',
    componentCls: 'app',
    requires: [
        'ReleaseColumn'
    ],

    getSettingsFields: function() {
        return [ { type: 'query' } ];
    },

    launch: function() {
        var context = this.getContext();

        Ext.create('Rally.data.wsapi.Store', {
            model: 'Release',
            context: context.getDataContext(),
            filters: [
                {
                    property: 'ReleaseDate',
                    operator: '>=',
                    value: 'today'
                }
            ],
            sorters: [
                {
                    propety: 'ReleaseStartDate',
                    direction: 'ASC'
                }
            ],
            fetch: ['Name', 'ReleaseStartDate', 'ReleaseDate'],
            pageSize: 2000,
            limit: Infinity
        }).load().then({
            success: this._onReleasesLoaded,
            scope: this
        });
    },

    _onReleasesLoaded: function(records) {
        var releases = _.groupBy(records, function(record) {
            return record.get('Name') + '-' + 
                Rally.util.DateTime.formatDate(record.get('ReleaseStartDate')) + '-' +
                Rally.util.DateTime.formatDate(record.get('ReleaseDate'));
            }),
            modelNames = ['hierarchicalrequirement'],
            context = this.getContext();

        var columns = _.sortBy(_.map(releases, function(likeReleases) {
            return {
                xtype: 'releasecolumn',
                releases: likeReleases
            };
        }), function(column) { return column.releases[0].get('ReleaseStartDate'); });

        if (this.down('rallygridboard')) {
            this.down('rallygridboard').destroy();
        }

        var whiteListFields = ['Milestones', 'Tags'];
        this.add({
            xtype: 'rallygridboard',
            context: context,
            modelNames: modelNames,
            toggleState: 'board',
            stateful: false,
            plugins: [
                {
                    ptype: 'rallygridboardinlinefiltercontrol',
                    inlineFilterButtonConfig: {
                        stateful: true,
                        stateId: context.getScopedStateId('filters'),
                        modelNames: modelNames,
                        inlineFilterPanelConfig: {
                            quickFilterPanelConfig: {
                                defaultFields: [
                                    'ArtifactSearch'
                                ],
                                addQuickFilterConfig: {
                                    whiteListFields: whiteListFields
                                }
                            },
                            advancedFilterPanelConfig: {
                                advancedFilterRowsConfig: {
                                    propertyFieldConfig: {
                                        whiteListFields: whiteListFields
                                    }
                                }
                            }
                        }
                    }
                },
                {
                    ptype: 'rallygridboardfieldpicker',
                    headerPosition: 'left',
                    modelNames: modelNames,
                    stateful: true,
                    stateId: context.getScopedStateId('columns-example')
                },
                {
                    ptype: 'rallygridboardactionsmenu',
                        menuItems: [
                            {
                                text: 'Print...',
                                handler: function () {
                                    this.down('rallygridboard').getGridOrBoard().openPrintPage({title: 'Program Board'});
                                },
                                scope: this
                            }
                            //
                        ],
                        buttonConfig: {
                            iconCls: 'icon-export'
                        }
                }
            ],
            cardBoardConfig: {
                plugins: [
                    { ptype: 'rallyfixedheadercardboard'},
                    { ptype: 'rallycardboardprinting' }
                ],
                readOnly: true,
                rowConfig: {
                    field: 'Feature'
                },
                columns: columns,
                attribute: 'Release'
            },
            storeConfig: {
               fetch: ['Release', 'Name', 'ReleaseStartDate', 'ReleaseDate'],
               filters: this._getFilters()
            }
        });
    },

    _getFilters: function() {
        var queries = [];
        if (this.getSetting('query')) {
            queries.push(Rally.data.QueryFilter.fromQueryString(this.getSetting('query')));
        }
        return queries;
    }
});
