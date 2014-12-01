(function(){
  var SelectFilter = Backgrid.Extension.SelectFilter = Backbone.View.extend({
    tagName: "div",
    className: "menu backgrid-filter",
    template: _.template([
      "<% for (var i=0; i < options.length; i++) { %>",
      "  <option class=\"item\" value=<%=JSON.stringify(options[i].value)%>><%=options[i].label%></option>",
      "<% } %>"
    ].join("\n")),
    events: {
      "click": "onChange"
    },
    initialize: function(options) {
      SelectFilter.__super__.initialize.apply(this, arguments);
      console.log(options.selectOptions);
      if (!options.selectOptions || !_.isArray(options.selectOptions)) throw "Invalid or missing selectOptions.";
      if (!options.field || !options.field.length) throw "Invalid or missing field.";
      this.selectOptions = options.selectOptions;
      this.field = options.field;
      this.clearValue = options.clearValue !== undefined ? options.clearValue : null;
      this.initialValue = options.initialValue !== undefined ? options.initialValue : this.clearValue;
      var collection = this.collection = this.collection.fullCollection || this.collection;
      var shadowCollection = this.shadowCollection = collection.clone();
      this.listenTo(collection, "add", function (model, collection, options) {
        shadowCollection.add(model, options);
      });
      this.listenTo(collection, "remove", function (model, collection, options) {
        shadowCollection.remove(model, options);
      });
      this.listenTo(collection, "reset", function (col, options) {
        options = _.extend({reindex: true}, options || {});
        if (options.reindex && options.from == null && options.to == null) {
          shadowCollection.reset(col.models);
        }
      });
    },
    render: function() {
      this.$el.append(this.template({
        options: this.selectOptions,
        initialValue: this.initialValue
      }));
      return this;
    },
    onChange: function(e) {
      var col = this.collection,
        field = this.field,
        value = JSON.parse(e.target.value),
        matcher = function(model) {
          return model.get(field) == value;
        };

      if (value !== this.clearValue)
        col.reset(this.shadowCollection.filter(matcher), {reindex: false});
      else
        col.reset(this.shadowCollection.models, {reindex: false});
    }
  });
}).call(this);
