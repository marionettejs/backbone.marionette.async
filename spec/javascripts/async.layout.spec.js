describe("async layout", function(){
  var LayoutManager = Backbone.Marionette.Layout.extend({
    template: "#layout-manager-template",
    regions: {
      regionOne: "#regionOne",
      regionTwo: "#regionTwo"
    }
  });

  describe("on rendering", function(){
    var layoutManager;
    var deferredResolved;

    beforeEach(function(){
      loadFixtures("layoutManagerTemplate.html");
      layoutManager = new LayoutManager();
      var deferred = layoutManager.render();

      deferred.done(function(){deferredResolved = true;});
    });

    it("should find the region scoped within the rendered template", function(){
      layoutManager.regionOne.ensureEl();
      var el = layoutManager.$("#regionOne");
      expect(layoutManager.regionOne.$el[0]).toEqual(el[0]);
    });

    it("should resolve the render's deferred", function(){
      expect(deferredResolved).toBeTruthy();
    });
  });

});
