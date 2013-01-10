// Async Region
// ------------

// Show a view that is rendered asynchronously, waiting for the view
// to be rendered before swaping it in.
Async.Region = {
    show: function(view, options) {
        var that = this,
            renderComplete,
            asyncShow = $.Deferred();

        options = options || {};

        var afterRender = function() {
            that.open(view);

            Marionette.triggerMethod.call(view, "show");
            Marionette.triggerMethod.call(that, "show", view);

            asyncShow.resolve();
        };

        this.ensureEl();
        this.close();

        renderComplete = view.render(options);

        // Wait for the view to finish rendering
        $.when(renderComplete).then(afterRender);

        // NOTE: I'm not quite sure where to put this - I tried putting it in the afterRender method but it seemed to mess
        // things up.  I'm not actually sure what the danger is in letting this reference be set early, but I'm worried
        // that if a view is notified it's been shown before its markup has actually been added to the DOM, it's possible
        // that event handlers and such might not get bound.  For now, though, I'm leaving it here.
        this.currentView = view;

        return asyncShow.promise();
    }
};
