'use strict';

define([
  'backbone',
  'handlebars',
  'collections/answers',
  'text!../../templates/result.handlebars'
], function(Backbone, Handlebars, DataCollection, tpl) {

  var ResultView = Backbone.View.extend({

    el: '#resultView',

    template: Handlebars.compile(tpl),

    collection: new DataCollection(),

    initialize: function() {
      Backbone.Events.on('toolbar:applied', this.getData, this);
    },

    render: function() {
      var data = this.collection.toJSON();
      this.$el.html(this.template({
        categories: (data.length === 0) ? null : data
      }));
    },

    getData: function(params) {
      var self = this;

      this.$el.html('');

      this.collection.getData(params, function(error) {
        if (error) {
          throw error.responseText;
        }
        self.render();
      });
    }

  });

  return ResultView;

});
