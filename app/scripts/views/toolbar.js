'use strict';

define([
  '_string',
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
      'change #questionSelect' : 'setCurrentQuestions',
      'change #toggleCriteria': 'toggleCriteria'
    },

    template: Handlebars.compile(tpl),

    model: new QuestionModel(),

    initialize: function() {
      this.targetId;
      this.questionId;
      this.criteria = window.localStorage.getItem('criteria') === 'true';

      this.getData();
    },

    render: function(model) {
      this.$el.html(this.template(model.toJSON()));

      if (this.criteria) {
        $('#toggleCriteria').attr('checked', 'checked');
      } else {
        $('#toggleCriteria').removeAttr('checked');
      }

      $('#targetSelect').select2({
        width: 'element'
      });

      $('#questionSelect').select2({
        width: 'element',
        formatSelection: function(item) {
          return item.text.slice(0, 3);
        }
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

    // setTargetsByQuestion: function() {
    //   var self = this;
    //   var questionId = $('#questionSelect').val();
    //   var targetId = $('#targetSelect').val();

    //   $('#targetSelect').html('');

    //   if (questionId !== 'all') {
    //     this.model.getTargetsByQuestion(questionId, function(error, model) {
    //       if (error) {
    //         throw error.responseText;
    //       }
    //       self.render(model);
    //       var questionSelect = $('#questionSelect');
    //       var targetSelect = $('#targetSelect');
    //       questionSelect.val(questionId);
    //       targetSelect.select2('val', targetId);
    //       // $('#currentQuestion').text(questionSelect.find('option[value="' + questionId + '"]').text());
    //       // $('#currentTarget').text('All targets');
    //     });
    //   } else {
    //     this.getData();
    //   }
    // },

    setCurrentQuestions: function() {
      var questionSelect = $('#questionSelect');
      var questionsId = questionSelect.val();

      var currentQuestions = _.map(questionsId, function(questionId) {
        return questionSelect.find('option[value="' + questionId + '"]').text().slice(0, 3);
      });

      $('#currentQuestion').text(_.str.toSentence(currentQuestions));
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

          var currentTargets = _.map(targetsId, function(targetId) {
            return targetSelect.find('option[value="' + targetId + '"]').text();
          });

          $('#currentTarget').text(_.str.toSentence(currentTargets));
          $('#currentQuestion').text('All targets');
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
      this.criteria = window.localStorage.getItem('criteria') === 'true';
      Backbone.Events.trigger('criteria:change', this.criteria);
    }

  });

  return ToolbarView;

});
