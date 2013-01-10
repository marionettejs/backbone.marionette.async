// Async Composite View
// --------------------

Async.CompositeView = {
  // Renders the model once, and the collection once. Calling
  // this again will tell the model's view to re-render itself
  // but the collection will not re-render.
    render: function() {
        var that = this,
            compositeRendered = $.Deferred();

        this.isClosed = false;

        this.resetItemViewContainer();

        var modelIsRendered = this.renderModel();

        $.when(modelIsRendered).then(function(html) {
            that.$el.html(html);
            that.bindUIElements();
            that.triggerMethod("composite:model:rendered");

            var collectionIsRendered = that.renderCollection();
            $.when(collectionIsRendered).then(function() {
                compositeRendered.resolve();
            });
        });

        compositeRendered.done(function() {
            that.triggerMethod("composite:rendered");
        });

        return compositeRendered.promise();
    },

    // Modified: Had to add an override for renderModel because it
    // sends the wrong parameters to Renderer.render
    renderModel: function() {
        var speck = this.getTemplate();
        return Marionette.Renderer.render(speck, this);
    },

    // Render the collection for the composite view
    renderCollection: function() {
        var args = Array.prototype.slice.apply(arguments);
        var collectionDeferred = Marionette.CollectionView.prototype.render.apply(this, args);
        collectionDeferred.done(function() {
            this.triggerMethod("composite:collection:rendered");
        });
        return collectionDeferred.promise();
    }
};
