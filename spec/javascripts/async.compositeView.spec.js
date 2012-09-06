describe("async composite view", function(){

  describe("when rendering a composite view", function(){
    var compositeView;
    var order;
    var deferredResolved;

    beforeEach(function(){
      order = [];
      loadFixtures("compositeTemplate.html");

      var m1 = new Model({foo: "bar"});
      var m2 = new Model({foo: "baz"});
      var collection = new Collection();
      collection.add(m2);

      compositeView = new CompositeView({
        model: m1,
        collection: collection
      });

      compositeView.on("composite:model:rendered", function(){
        order.push(compositeView.renderedModelView);
      });

      compositeView.on("composite:collection:rendered", function(){
        order.push(compositeView.collection);
      });

      compositeView.on("composite:rendered", function(){
        order.push(compositeView);
      });

      spyOn(compositeView, "trigger").andCallThrough();
      spyOn(compositeView, "onRender").andCallThrough();
      spyOn(compositeView, "bindUIElements").andCallThrough();

      var deferred = compositeView.render();
      
      deferred.done(function(){
        deferredResolved = true;
      });
    });

    it("should trigger a rendered event for the model view", function(){
      expect(compositeView.trigger).toHaveBeenCalledWith("composite:model:rendered");
    });

    it("should trigger a rendered event for the collection", function(){
      expect(compositeView.trigger).toHaveBeenCalledWith("composite:collection:rendered");
    });

    it("should trigger a rendered event for the composite view", function(){
      expect(compositeView.trigger).toHaveBeenCalledWith("composite:rendered");
    });

    it("should guarantee rendering of the model before rendering the collection", function(){
      expect(order[0]).toBe(compositeView.renderedModelView);
      expect(order[1]).toBe(compositeView.collection);
      expect(order[2]).toBe(compositeView);
    });

    it("should call 'onRender'", function(){
      expect(compositeView.onRender).toHaveBeenCalled();
    });

    it("should call 'bindUIElements'", function(){
      expect(compositeView.bindUIElements).toHaveBeenCalled();
    });

    it("should resolve the rendering deferred", function(){
      expect(deferredResolved).toBeTruthy();
    });
  });

  var Model = Backbone.Model.extend({});

  var Collection = Backbone.Collection.extend({
    model: Model
  });
  
  var ItemView = Backbone.Marionette.ItemView.extend({
    tagName: "span",
    render: function(){
      this.$el.html(this.model.get("foo"));
    }
  });

  var CompositeView = Backbone.Marionette.CompositeView.extend({
    itemView: ItemView,
    template: "#composite-template",

    onRender: function(){}
  });
});

