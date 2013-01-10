// Async Renderer
// --------------
// Render a template with data by passing in the template
// selector and the data to render. Do it all asynchronously.
Async.Renderer = {

    // Speck.view and speck.html both return deferred objects
    // Render a template with data. If options.replace is set to
    // true, will use speck's speck.view method to replace view.$el.
    // if update is set to true, will update $el's contents with
    // template results. Deferred object returned will always
    // be passed rendered markup
    render: function(speck, view, opts) {
        var options = {
                update: false
            };

        _.extend(options, opts);

        if(options.replace === true) {
            // Speck.view returns the same as .html but automatically
            // updates the UI - replacing the original element if the second
            // param is set to true
            return speck.view(view, true);
        } else {
            return speck.html(view.$el, view, options.update);
        }
    }
};
