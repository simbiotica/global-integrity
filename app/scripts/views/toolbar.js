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
      'change #questionSelect': 'getTargets',
      'change #targetSelect': 'setCurrentTarget',
      'change #toggleCriteria': 'toggleCriteria'
    },

    template: Handlebars.compile(tpl),

    model: new Datamodel(),

    initialize: function() {
      this.getData();
    },

    render: function() {
      this.$el.html(this.template(this.model.toJSON()));
    },

    getData: function() {
      var self = this;

      this.model.getAll(function(error) {
        if (error) {
          throw error.responseText;
        }
        self.render();
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
          var questionSelect = $('#questionSelect');
          var targetSelect = $('#targetSelect');
          questionSelect.val(questionId);
          targetSelect.val('all');
          $('#currentQuestion').text(questionSelect.find('option[value="' + questionId + '"]').text());
          $('#currentTarget').text('All targets');
        });
      } else {
        this.getData();
      }
    },

    setCurrentTarget: function() {
      var targetSelect = $('#targetSelect');
      $('#currentTarget').text(targetSelect.find('option[value="' + targetSelect.val() + '"]').text());
    },

    apply: function() {
      var self = this;
      var questionId = $('#questionSelect').val();
      var targetId = $('#targetSelect').val();

      if (questionId !== 'all' && targetId === 'all') {
        this.model.getTargetsByQuestion(questionId, function(error) {
          if (error) {
            throw error.responseText;
          }
          self.render();
          var questionSelect = $('#questionSelect');
          var targetSelect = $('#targetSelect');

          questionSelect.val(questionId);

          if (_.where(self.model.toJSON().targets, {
            id: Number(targetId)
          }).length > 0) {
            targetSelect.val(targetId);
          } else {
            targetSelect.val('all');
          }

          $('#currentQuestion').text(questionSelect.find('option[value="' + questionId + '"]').text());
          $('#currentTarget').text('All targets');

          Backbone.Events.trigger('toolbar:applied', {
            question: questionId,
            target: 'all'
          });
        });
      } else if (questionId !== 'all' && targetId !== 'all') {
        this.model.getTargetsByQuestion(questionId, function(error) {
          if (error) {
            throw error.responseText;
          }
          self.render();

          var questionSelect = $('#questionSelect');
          var targetSelect = $('#targetSelect');

          questionSelect.val(questionId);
          targetSelect.val(targetId);

          $('#currentQuestion').text(questionSelect.find('option[value="' + questionId + '"]').text());
          $('#currentTarget').text(targetSelect.find('option[value="' + targetId + '"]').text());

          Backbone.Events.trigger('toolbar:applied', {
            question: questionId,
            target: targetId
          });
        });
      } else if (questionId === 'all' && targetId !== 'all') {
        this.model.getTargetsByQuestion(questionId, function(error) {
          if (error) {
            throw error.responseText;
          }
          self.render();

          var questionSelect = $('#questionSelect');
          var targetSelect = $('#targetSelect');

          questionSelect.val('all');
          targetSelect.val(targetId);

          $('#currentQuestion').text('All questions');
          $('#currentTarget').text(targetSelect.find('option[value="' + targetId + '"]').text());

          Backbone.Events.trigger('toolbar:applied', {
            question: 'all',
            target: targetId
          });
        });
      } else {
        this.getData();

        $('#currentQuestion').text('All targets');
        $('#currentTarget').text('All targets');

        Backbone.Events.trigger('toolbar:applied', {
          question: 'all',
          target: 'all'
        });
      }
    },

    toggleCriteria: function() {
      $('.question-intro').toggleClass('is-hidden');
    }

  });

  return ToolbarView;

});
