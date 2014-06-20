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
      'change #questionSelect' : 'setTargetsByQuestion',
      'change #targetSelect': 'setQuestionsByTarget',
      'change #toggleCriteria': 'toggleCriteria'
    },

    template: Handlebars.compile(tpl),

    model: new Datamodel(),

    initialize: function() {
      this.targetId;
      this.questionId;
      this.getData();
    },

    render: function(model) {
      this.$el.html(this.template(model.toJSON()));

      var criteria = window.localStorage.getItem('criteria');

      if (criteria === 'true') {
        $('#toggleCriteria').attr('checked', 'checked');
      } else {
        $('#toggleCriteria').removeAttr('checked');
      }
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

    setCurrentTarget: function() {
      var targetSelect = $('#targetSelect');
      $('#currentTarget').text(targetSelect.find('option[value="' + targetSelect.val() + '"]').text());
      this.targetId = targetSelect.val();
    },

    setQuestion: function() {
      var targetSelect = $('#targetSelect');
      var questionSelect = $('#questionSelect');
      $('#currentTarget').text(targetSelect.find('option[value="' + targetSelect.val() + '"]').text());
      this.questionId = questionSelect.val();
    },

    setTargetsByQuestion: function() {
      var self = this;
      var questionId = $('#questionSelect').val();
      var targetId = $('#targetSelect').val();

      $('#targetSelect').html('');

      if (questionId !== 'all') {
        this.model.getTargetsByQuestion(questionId, function(error, model) {
          if (error) {
            throw error.responseText;
          }
          self.render(model);
          var questionSelect = $('#questionSelect');
          var targetSelect = $('#targetSelect');
          questionSelect.val(questionId);
          targetSelect.val(targetId);
          $('#currentQuestion').text(questionSelect.find('option[value="' + questionId + '"]').text());
          $('#currentTarget').text('All targets');
        });
      } else {
        this.getData();
      }
    },

    setQuestionsByTarget: function() {
      var self = this;
      var targetId = $('#targetSelect').val();
      var questionSelect;
      var targetSelect;

      $('#questionSelect').html('');

      if (targetId !== 'all') {
        this.model.getQuestionsByTarget(targetId, function(error, model) {
          if (error) {
            throw error.responseText;
          }
          self.render(model);
          questionSelect = $('#questionSelect');
          targetSelect = $('#targetSelect');
          questionSelect.val('all');
          targetSelect.val(targetId);
          $('#currentTarget').text(targetSelect.find('option[value="' + targetId + '"]').text());
          $('#currentQuestion').text('All targets');
        });
      } else {
        this.getData();
      }
    },

    apply: function() {
      var questionId = $('#questionSelect').val();
      var targetId = $('#targetSelect').val();

      Backbone.Events.trigger('toolbar:applied', {
        question: questionId,
        target: targetId
      });
    },

    toggleCriteria: function(ev) {
      window.localStorage.setItem('criteria', $(ev.currentTarget).prop('checked'));
      $('.question-intro').toggleClass('is-hidden');
    }

  });

  return ToolbarView;

});
