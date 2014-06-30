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
      Backbone.Events.on('criteria:change', this.toggleIntro, this);
    },

    render: function(collection) {
      var data = collection.toJSON();
      this.$el.html(this.template({
        categories: (data.length === 0) ? null : data
      }));
      this.toggleIntro();
      Backbone.Events.trigger('spinner:stop');
    },

    getData: function(params) {
      var self = this;

      this.$el.html('');

      this.collection.getData(params, function(error, collection) {
        if (error) {
          throw error.responseText;
        }
        self.render(collection);
      });
    },

    toggleIntro: function(criteria) {
      if (criteria === undefined) {
        criteria = window.localStorage.getItem('criteria') === 'true';
      }

      if (criteria) {
        $('.question-intro').removeClass('is-hidden');
      } else {
        $('.question-intro').addClass('is-hidden');
      }
    }

  });

  return ResultView;

});
