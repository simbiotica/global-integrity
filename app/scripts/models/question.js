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

      function getTargets(targets) {
        return _.map(targets, function(t) {
          var item = t.split('---');
          return {
            id: Number(item[0]),
            text: item[1]
          };
        });
      }

      result = {

        questions: _.sortBy(_.map(data.rows, function(d) {
          return {
            id: d.questionid,
            text: d.questiontext,
            targets: getTargets(d.target_ids)
          };
        }), function(question) {
          return question.text;
        }),

        targets: _.sortBy(_.uniq(_.flatten(_.map(data.rows, function(d) {
          return getTargets(d.target_ids);
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

    getTargetsByQuestion: function(questionId, callback) {
      this.getAll(function(error, collection) {
        if (questionId && questionId !== 'all') {
          var targets = _.where(collection.toJSON().questions, {
            id: questionId
          })[0].targets;

          collection.attributes.targets = targets;
        }

        if (callback && typeof callback === 'function') {
          callback(undefined, collection);
        }
      });
    },

  });

  return QuestionModel;

});
