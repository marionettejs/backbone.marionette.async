describe("async renderer", function(){

  describe("when given a template id to render", function(){
    var templateSelector = "#renderer-template";
    var result;

    beforeEach(function(){
      loadFixtures("rendererTemplate.html");
      spyOn(Backbone.Marionette.TemplateCache, "get").andCallThrough();
      var promise = Backbone.Marionette.Renderer.render(templateSelector);
      promise.done(function(html){
        result = $(html);
      });
    });

    it("should retrieve the template from the cache", function(){
      expect(Backbone.Marionette.TemplateCache.get).toHaveBeenCalledWith(templateSelector);
    });

    it("should render the template", function(){
      expect(result).toHaveText(/renderer/);
    });
  });

  describe("when given a template and data to render", function(){
    var templateSelector = "#renderer-with-data-template";
    var result;

    beforeEach(function(){
      loadFixtures("rendererWithDataTemplate.html");
      spyOn(Backbone.Marionette.TemplateCache, "get").andCallThrough();

      var data = {foo: "bar"};
      var promise = Backbone.Marionette.Renderer.render(templateSelector, data);

      promise.done(function(html){
        result = $(html);
      });
    });

    it("should retrieve the template from the cache", function(){
      expect(Backbone.Marionette.TemplateCache.get).toHaveBeenCalledWith(templateSelector);
    });

    it("should render the template", function(){
      expect(result).toHaveText(/renderer bar/);
    });
  });

  describe("when no template is provided", function(){
    var render;

    beforeEach(function(){
      render = _.bind(Backbone.Marionette.Renderer.render, Backbone.Marionette.Renderer);
    });

    it("should raise an error", function(){
      expect(render).toThrow("Could not find template: 'undefined'");
    });
  });

  describe("when overriding the `render` method", function(){
    var oldRender, result;

    beforeEach(function(){
      oldRender = Backbone.Marionette.Renderer.render;

      Backbone.Marionette.Renderer.render = function(template, data){
        return "<foo>custom</foo>";
      };

      result = Backbone.Marionette.Renderer.render("", {});
      result = $(result);
    });

    afterEach(function(){
      Backbone.Marionette.Renderer.render = oldRender;
    });

    it("should render the view with the overridden method", function(){
      expect(result).toHaveText("custom");
    });
  });

  describe("when a template function is provided", function(){
    var templateSpy = {
      fn: function() { return "<foo>template func</foo>"; }
    };
    var data = {foo: "bar"};

    beforeEach(function(){
      spyOn(Backbone.Marionette.TemplateCache, "get").andCallThrough();
      spyOn(templateSpy, "fn").andCallThrough();

      var promise = Backbone.Marionette.Renderer.render(templateSpy.fn, data);

      promise.done(function(html){
        result = $(html);
      });

    });

    it("should call the template function", function(){
      expect(templateSpy.fn).toHaveBeenCalledWith(data);
      expect(result).toHaveText("template func");
    });

    it("should not use the template cache", function(){
      expect(Backbone.Marionette.TemplateCache.get).not.toHaveBeenCalled();
    });

  });

});
