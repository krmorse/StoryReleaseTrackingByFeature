Ext.define('CustomApp', {
    extend: 'Rally.app.TimeboxScopedApp',
    componentCls: 'app',
    requires: [
        'IterationColumn'
    ],

    scopeType: 'release',
    supportsUnscheduled: false,

    onScopeChange: function() {
        var context = this.getContext(),
            release = context.getTimeboxScope().getRecord(),
            startDate = release.get('ReleaseStartDate'),
            endDate = release.get('ReleaseDate');

        Ext.create('Rally.data.wsapi.Store', {
            model: 'Iteration',
            context: context.getDataContext(),
            filters: [
                {
                    property: 'StartDate',
                    operator: '>=',
                    value: Rally.util.DateTime.toIsoString(startDate)
                },
                {
                    property: 'EndDate',
                    operator: '<=',
                    value: Rally.util.DateTime.toIsoString(endDate)
                }
            ],
            sorters: [
                {
                    propety: 'StartDate',
                    direction: 'ASC'
                }
            ],
            fetch: ['Name', 'StartDate', 'EndDate'],
            pageSize: 2000,
            limit: Infinity
        }).load().then({
            success: this._onIterationsLoaded,
            scope: this
        });
    },

    _onIterationsLoaded: function(records) {
        var iterations = _.groupBy(records, function(record) {
            return record.get('Name') + '-' + 
                Rally.util.DateTime.formatDate(record.get('StartDate')) + '-' +
                Rally.util.DateTime.formatDate(record.get('EndDate'));
            }),
            modelNames = ['hierarchicalrequirement'],
            context = this.getContext();

        var columns = _.sortBy(_.map(iterations, function(likeIterations) {
            return {
                xtype: 'iterationcolumn',
                iterations: likeIterations
            };
        }), function(column) { return column.iterations[0].get('StartDate'); });

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
                                ]
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
                readOnly: true,
                rowConfig: {
                    field: 'Project'
                },
                columns: columns,
                attribute: 'Iteration'
            },
            storeConfig: {
               fetch: ['Iteration', 'Name', 'StartDate', 'EndDate'] 
            }
        });
    }
});
