Ext.define('Rally.ui.cardboard.plugin.CollapsibleColumnsFix', {
    override: 'Rally.ui.cardboard.plugin.CollapsibleColumns',

    _toggleDnDPlugin: function(enabled) {
        var plugin = this.column.dropControllerPlugin;
        if (plugin) {
          if (enabled) {
            plugin.enable();
          } else {
            plugin.disable();
          }
        }
    },

    _collapseExpandSuccess: function(collapsing) {
        this.cardboard.fireEvent('headersizechanged', this);
        this.cardboard.fireEvent('columnvisibilitychanged', this);

        if (collapsing) {
            this.expandButton.show();
            this._toggleDnDPlugin(false);

            Ext.defer(function() {
                _.invoke(this.column.getContentCellContainers(), 'on', 'click', this._onColumnClick, this);
                this.column.getColumnHeaderCell().on('click', this._onColumnClick, this);
            }, 1, this);

        } else {
            this.collapseButton.show();
            _.invoke(this.column.getContentCells(), 'show');
            this._toggleDnDPlugin(true);
            this._setClassesForCollapseState(false);
            _.invoke(this.column.getContentCellContainers(), 'un', 'click', this._onColumnClick, this);
            this.column.getColumnHeaderCell().un('click', this._onColumnClick, this);
        }
    }
});