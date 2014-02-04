// Async Renderer
// --------------

// Render a template with data by passing in the template
// selector and the data to render. Do it all asynchronously.
Async.Renderer = {

  // Render a template with data. The `template` parameter is
  // passed to the `TemplateCache` object to retrieve the
  // template function. Override this method to provide your own
  // custom rendering and template handling for all of Marionette.
  render: function(template, data){
    var asyncRender = $.Deferred();

    var doRender = function(templateFunc) {
      asyncRender.resolve(templateFunc(data));
    };

    if(_.isFunction(template)) {
      // If we are passed a template function, just call it directly
      doRender(template);
    } else {
      // Otherwise, fetch the template using the template cache and then render
      var templateRetrieval = Marionette.TemplateCache.get(template);
      $.when(templateRetrieval).then(function(templateFunc){
        doRender(templateFunc);
      });
    }

    return asyncRender.promise();
  }
};

