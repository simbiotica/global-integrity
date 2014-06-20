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
      'change #questionSelect' : 'setQuestion',
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

    render: function() {
      this.$el.html(this.template(this.model.toJSON()));

      var criteria = window.localStorage.getItem('criteria');

      if (criteria === 'true') {
        $('#toggleCriteria').attr('checked', 'checked');
      } else {
        $('#toggleCriteria').removeAttr('checked');
      }
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
      this.getData();
    },

    // Set Target
    setCurrentTarget: function() {
      var targetSelect = $('#targetSelect');
      $('#currentTarget').text(targetSelect.find('option[value="' + targetSelect.val() + '"]').text());
      this.targetId = targetSelect.val();
    },

    // Set Question
    setQuestion: function() {
      var questionSelect = $('#questionSelect');
      $('#currentTarget').text(targetSelect.find('option[value="' + targetSelect.val() + '"]').text());
      this.questionId = questionSelect.val();
    },

    setQuestionsByTarget: function() {
        var self = this;

        this.setCurrentTarget();

        this.model.getQuestionsByTarget(this.targetId, function(error) {
          if (error) {
            throw error.responseText;
          }
          self.render();
          var questionSelect = $('#questionSelect').val();
          var targetSelect = $('#targetSelect');

          //self.setQuestionsByTarget(self.targetId);
          //$('#currentQuestion').text(questionSelect.find('option[value="' + questionId + '"]').text());

          Backbone.Events.trigger('toolbar:applied', {
            target: self.targetId,
          });
        });
    },

    apply: function() {
      var self = this;
      //var questionId = $('#questionSelect').val();

      console.log(this.targetId);
      // Questions by target
      if (this.targetId && this.targetId !== 'all'
          && this.questionId && this.questionId !== 'all') {
        console.log('entra');

        Backbone.Events.trigger('toolbar:applied', {
          question: this.questionId,
          target: this.targetId
        });

      // Carga por defecto todos los datos
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

    toggleCriteria: function(ev) {
      window.localStorage.setItem('criteria', $(ev.currentTarget).prop('checked'));
      $('.question-intro').toggleClass('is-hidden');
    }

  });

  return ToolbarView;

});
