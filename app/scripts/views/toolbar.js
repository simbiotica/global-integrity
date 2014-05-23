'use strict';

define([
  'underscore',
  'backbone',
  'handlebars',
  'models/question',
  'text!../../templates/toolbar.handlebars'
], function(_, Backbone, Handlebars, Datamodel, tpl) {

  var ToolbarView = Backbone.View.extend({

    el: '#toolbarView',

    events: {
      'click #apply': 'apply',
      'change #questionSelect': 'getTargets'
    },

    template: Handlebars.compile(tpl),

    model: new Datamodel(),

    initialize: function() {
      this.getData();
    },

    render: function(model) {
      this.$el.html(this.template(model.toJSON()));
    },

    getData: function() {
      var self = this;

      this.model.getAll(function(error, model) {
        if (error) {
          throw error.responseText;
        }
        self.render(model);
      });
    },

    getTargets: function() {
      var self = this;
      var questionId = $('#questionSelect').val();

      if (questionId !== 'all') {
        this.model.getTargetsByQuestion(questionId, function(error, model) {
          if (error) {
            throw error.responseText;
          }
          self.render(model);
          $('#questionSelect').val(questionId);
          $('#targetSelect').val('all');
        });
      } else {
        this.getData();
      }
    },

    apply: function() {
      var self = this;
      var questionId = $('#questionSelect').val();
      var targetId = $('#targetSelect').val();

      if (questionId !== 'all' && targetId !== 'all') {
        this.model.getTargetsByQuestion(questionId, function(error, model) {
          if (error) {
            throw error.responseText;
          }
          self.render(model);
          $('#questionSelect').val(questionId);
          if (_.where(model.toJSON().targets, {
            id: Number(targetId)
          }).length > 0) {
            $('#targetSelect').val(targetId);
          } else {
            $('#targetSelect').val('all');
          }
          Backbone.Events.trigger('toolbar:applied', {
            question: questionId,
            target: 'all'
          });
        });
      } else if (questionId !== 'all' && targetId === 'all') {
        this.model.getTargetsByQuestion(questionId, function(error, model) {
          if (error) {
            throw error.responseText;
          }
          self.render(model);
          $('#questionSelect').val(questionId);
          $('#targetSelect').val(targetId);
          Backbone.Events.trigger('toolbar:applied', {
            question: questionId,
            target: targetId
          });
        });
      } else {
        this.getData();
      }
    }

  });

  return ToolbarView;

});
