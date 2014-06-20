'use strict';

define([
  'underscore',
  'backbone',
  'sprintf',
  'text!../../queries/questions.pgsql'
], function(_, Backbone, sprintf, sql) {

  sprintf = sprintf.sprintf;

  var QuestionModel = Backbone.Model.extend({

    url: 'http://globalintegrity.cartodb.com/api/v2/sql',

    parse: function(data) {
      var result;

      function getTargets(question) {
        return _.map(question.target_ids, function(t) {
          var item = t.split('---');
          return {
            id: Number(item[0]),
            text: item[1],
            question: Number(question.questionid)
          };
        });
      }

      result = {

        questions: _.sortBy(_.map(data.rows, function(d) {
          return {
            id: Number(d.questionid),
            text: d.questiontext,
            targets: getTargets(d)
          };
        }), function(question) {
          return question.text;
        }),

        targets: _.sortBy(_.uniq(_.flatten(_.map(data.rows, function(d) {
          return getTargets(d);
        }), true), false, function(d) {
          return d.id;
        }), function(target) {
          return target.text;
        })

      };

      return result;
    },

    getAll: function(callback) {
      var options;

      function onSuccess(model) {
        if (callback && typeof callback === 'function') {
          callback(undefined, model);
        }
      }

      function onError(model, err) {
        if (callback && typeof callback === 'function') {
          callback(err);
        }
      }

      options = {
        data: {
          q: sql,
          format: 'json'
        },
        reset: true,
        success: onSuccess,
        error: onError
      };

      this.fetch(options);
    },

    getQuestionsByTarget: function(targetId, callback) {
      this.getAll(function(error, model) {
        if (targetId && targetId !== 'all') {
          var questions = _.uniq(_.filter(model.toJSON().questions, function(question) {
            return _.where(question.targets, {id: Number(targetId)}).length > 0;
          }), false, function(question) {
            return question.id;
          });

          model.attributes.questions = questions;
        }

        if (callback && typeof callback === 'function') {
          callback(error, model);
        }
      });
    },

    getTargetsByQuestion: function(questionId, callback) {
      this.getAll(function(error, model) {
        if (questionId && questionId !== 'all') {
          var targets = _.where(model.toJSON().questions, {
            id: Number(questionId)
          })[0].targets;

          model.attributes.targets = targets;
        }

        if (callback && typeof callback === 'function') {
          callback(error, model);
        }
      });
    }

  });

  return QuestionModel;

});
