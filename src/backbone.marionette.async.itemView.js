// Async ItemView
// --------------

// An asynchronous rendering method for the `ItemView`. This method
// assumes template loading, data serialization, `beforeRender`, and
// `onRender` functions are all asynchronous, using `jQuery.Deferred()`
// and `jQuery.when(...).then(...)` to manage async calls.
Async.ItemView = {
    render: function(options) {
        var that = this,
            deferredRender = $.Deferred();

        options = options || {};

        this.isClosed = false;

        var beforeRenderDone = function() {
            that.triggerMethod("before:render", that);
            that.triggerMethod("item:before:render", that);

            var template = that.getTemplate();
            var asyncRender = Marionette.Renderer.render(template, that, options);
            $.when(asyncRender).then(templateRendered);
        };

        // FIX: removed the dataSerialized function, because speck handles serializing our data for us
        // in most cases
        var templateRendered = function(html) {
            //If either of these are true then $el's HTML has already been updated
            if (!options.update) {
                that.$el.html(html);
            }
            that.bindUIElements();
            // FIX: don't need this anymore with triggerMethod()
            onRenderDone();
        };

        var onRenderDone = function() {
            that.triggerMethod("render", that);
            that.triggerMethod("item:rendered", that);

            deferredRender.resolve();
        };

        // FIX: this.beforeRender should be handled by that.triggerMethod
        // "before:render" now, so no need to defer the call like the previous
        // code here did
        beforeRenderDone();

        return deferredRender.promise();
    }
};
