// Async ItemView
// --------------

// An asynchronous rendering method for the `ItemView`. This method
// assumes template loading, data serialization, `beforeRender`, and
// `onRender` functions are all asynchronous, using `jQuery.Deferred()`
// and `jQuery.when(...).then(...)` to manage async calls.
Async.ItemView = {
  render: function(){
    var that = this,
        deferredRender = $.Deferred();

    this.isClosed = false;

    var beforeRenderDone = function() {
      that.triggerMethod("before:render", that);
      that.triggerMethod("item:before:render", that);

      var deferredData = that.serializeData();
      $.when(deferredData).then(dataSerialized);
    };

    var dataSerialized = function(data){
      var template = that.getTemplate(),
          asyncRender;

      data = that.mixinTemplateHelpers(data);

      asyncRender = Marionette.Renderer.render(template, data);
      $.when(asyncRender).then(templateRendered);
    };

    var templateRendered = function(html){
      that.$el.html(html);
      this.bindUIElements();
      callDeferredMethod(that.onRender, onRenderDone, that);
    };

    var onRenderDone = function(){
      that.triggerMethod("render", that);
      that.triggerMethod("item:rendered", that);

      deferredRender.resolve();
    };

    callDeferredMethod(this.beforeRender, beforeRenderDone, this);

    return deferredRender.promise();
  }
};
