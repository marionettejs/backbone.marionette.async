### v0.3.0
* Updated codebase to Backbone.Marionette v1.0.0 Beta 3
    * ItemView, CollectionView, Composite view all updated to set `this.isClosed = false;`
    * 'that.trigger()' calls updated to 'that.triggerMethod()'
    * `that.bindUIElements()` is now called after replacing the contents of `view.$el`
    * `Region` event `view:show` changed to just `show`

### v0.2.0

* Extracted Marionette.Async in to it's own repository
