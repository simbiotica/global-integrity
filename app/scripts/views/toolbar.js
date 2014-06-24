'use strict';

define([
  'underscore',
  'backbone',
  'handlebars',
  'select2',
  'models/question',
  'text!../../templates/toolbar.handlebars'
], function(_, Backbone, Handlebars, $, QuestionModel, tpl) {

  var ToolbarView = Backbone.View.extend({

    el: '#toolbarView',

    events: {
      'click #apply': 'apply',
      'change #targetSelect': 'setQuestionsByTarget',
      //'change #questionSelect' : 'setTargetsByQuestion',
      'change #toggleCriteria': 'toggleCriteria'
    },

    template: Handlebars.compile(tpl),

    model: new QuestionModel(),

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

      this.$el.find('select').select2({
        width: 'element'
      });
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
      this.setQuestionsByTarget();
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
          targetSelect.select2('val', targetId);
          // $('#currentQuestion').text(questionSelect.find('option[value="' + questionId + '"]').text());
          // $('#currentTarget').text('All targets');
        });
      } else {
        this.getData();
      }
    },

    setQuestionsByTarget: function() {
      var self = this;
      var targetsId = $('#targetSelect').val();
      var questionSelect;
      var targetSelect;

      $('#questionSelect').html('');

      if (targetsId && targetsId.length > 0) {
        this.model.getQuestionsByTargets(targetsId, function(error, model) {
          if (error) {
            throw error.responseText;
          }
          self.render(model);
          questionSelect = $('#questionSelect');
          targetSelect = $('#targetSelect');
          questionSelect.val('all');
          targetSelect.select2('val', targetsId);
          // $('#currentTarget').text(targetSelect.find('option[value="' + targetId + '"]').text());
          // $('#currentQuestion').text('All targets');
        });
      } else {
        this.getData();
      }
    },

    apply: function() {
      var questionId = $('#questionSelect').val()|| 'all';
      var targetId = $('#targetSelect').val() || 'all';

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
