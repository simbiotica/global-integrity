'use strict';

define([
  'underscore',
  'backbone',
  'sprintf',
  'models/question',
  'text!../../queries/questions.pgsql'
], function(_, Backbone, sprintf, QuestionModel, sql) {

  sprintf = sprintf.sprintf;

  var QuestionsCollection = Backbone.Collection.extend({

    url: 'http://globalintegrity.cartodb.com/api/v2/sql',

    parse: function(data) {
      var result;

      function getTargets(targets) {
        return _.map(targets, function(t) {
          var item = t.split('-');
          return {
            id: Number(item[0]),
            text: item[1]
          };
        });
      }

      result = {

        questions: _.map(data.rows, function(d) {
          return {
            id: d.questionid,
            text: d.questiontext,
            targets: getTargets(d.target_ids)
          };
        }),

        targets: _.uniq(_.flatten(_.map(data.rows, function(d) {
          return getTargets(d.target_ids);
        }), true), false, function(d) {
          return d.id;
        })

      };

      return result;
    },

    getAll: function(callback) {
      var options;

      function onSuccess(collection) {
        if (callback && typeof callback === 'function') {
          callback(undefined, collection);
        }
      }

      function onError(collection, err) {
        if (callback && typeof callback === 'function') {
          callback(err);
        }
      }

      options = {
        data: {
          q: sql,
          format: 'json'
        },
        success: onSuccess,
        error: onError
      };

      this.fetch(options);
    },

    getTargetsByQuestion: function(questionId, callback) {
      this.getAll(function(error, collection) {
        var targets = _.where(collection.toJSON().questions, {
          id: questionId
        })[0].targets;

        collection.attributes.targets = targets;

        if (callback && typeof callback === 'function') {
          callback(undefined, collection);
        }
      });
    }

  });

  return QuestionsCollection;

});
