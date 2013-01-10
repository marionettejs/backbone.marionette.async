// Backbone.Marionette.Async, v0.3.0
// Copyright (c)2013 Derick Bailey, Muted Solutions, LLC.
// Distributed under MIT license
// http://github.com/marionettejs/backbone.marionette.async
//
// Backbone.Marionette.Async updated to 1.0.0 Beta 3 code base by Jeremy McLeod
// http://github.com/isochronous
// Marionette.Async
// ----------------

// Provides asynchronous rendering implementations
// for the various view types in Marionette
Backbone.Marionette.Async = (function(Backbone, Marionette, _, $){

  // Configure Marionette to use the async rendering for all view types
  var Async = {
    init: function(){
      Marionette.Renderer = Async.Renderer;
      _.extend(Marionette.ItemView.prototype, Async.ItemView);
      _.extend(Marionette.CollectionView.prototype, Async.CollectionView);
      _.extend(Marionette.CompositeView.prototype, Async.CompositeView);
      _.extend(Marionette.Region.prototype, Async.Region);
    }
  };

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

// Async CollectionView
// --------------------

// provides async rendering for collection views
Async.CollectionView = {
    render: function() {
        var that = this,
            deferredRender = $.Deferred(),
            promises;

        this.isClosed = false;

        this.triggerBeforeRender();
        this.closeEmptyView();
        this.closeChildren();

        if(this.collection && this.collection.length > 0) {
            promises = this.showCollection();
        } else {
            var promise = this.showEmptyView();
            promises = [promise];
        }

        deferredRender.done(function() {
            that.triggerRendered();
        });

        $.when.apply(this, promises).then(function() {
            deferredRender.resolveWith(that);
        });

        return deferredRender.promise();
    },

  // Internal method to loop through each item in the
  // collection view and show it
  showCollection: function(){
        var that = this;
        var promises = [];
        var ItemView;

        this.collection.each(function(item, index) {
            ItemView = that.getItemView();
            var promise = that.addItemView(item, ItemView, index);
            promises.push(promise);
        });

        return promises;
  },

  // Internal method to show an empty view in place of
  // a collection of item views, when the collection is
  // empty
  showEmptyView: function(promises){
    var promise;
    var EmptyView = Marionette.getOption(this, "emptyView");

    if(EmptyView && !this._showingEmptyView) {
        this._showingEmptyView = true;
        var model = new Backbone.Model();
        promise = this.addItemView(model, EmptyView, 0);
    }
    return promise;
  },

  renderItemView: function(view, index) {
    var that = this;
    var viewRendered = view.render();
    $.when(viewRendered).then(function() {
        that.appendHtml(that, view, index);
    });
    return viewRendered;
  }
};

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

// Async Helpers
// -------------

// A simple wrapper method for deferring a callback until 
// after another method has been called, passing the
// results of the first method to the second. Uses jQuery's
// deferred / promise objects, and $.when/then to make it
// work.
var callDeferredMethod = function(fn, callback, context){
  var promise;
  if (fn) { promise = fn.call(context); }
  $.when(promise).then(_.bind(callback, context));
};

// Initialize the async-modules
Async.init();


  return Async;
})(Backbone, Backbone.Marionette, _, window.jQuery || window.Zepto || window.ender);