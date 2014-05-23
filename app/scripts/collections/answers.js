'use strict';

define([
  'underscore',
  'backbone',
  'sprintf',
  'models/answer',
  'text!../../queries/answers.pgsql'
], function(_, Backbone, sprintf, AnswerModel, sql) {

  sprintf = sprintf.sprintf;

  var AnswersCollection = Backbone.Collection.extend({

    model: AnswerModel,

    url: 'http://globalintegrity.cartodb.com/api/v2/sql',

    parse: function(data) {

      if (!this.data) {
        this.data = data.rows;
      }

      if (!this.categories) {
        var categories = _.uniq(_.reject(_.map(data.rows, function(d) {
          console.log(d);
          return {
            id: d.categoryid,
            name: d.categoryname
          };
        }), function(d) {
          return d.name === '';
        }), false, function(d) {
          return d.id;
        });

        this.categories = categories;
      }

      var result = _.reject(_.map(this.categories, function(category) {
        category.questions = _.reject(_.where(data.rows, {
          categoryid: category.id
        }), function(answer) {
          return answer.questiontext === '';
        });

        category.questions = _.map(category.questions, function(question) {
          question.answers = _.where(data.rows, {
            questionid: question.questionid
          });
          return question;
        });

        return category;
      }), function(r) {
        return r.questions.length === 0;
      });

      return result;
    },

    getData: function(params, callback) {
      var options, query;

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

      if (!params) {
        query = sprintf(sql, ' ');
      } else if (params.question !== 'all' && params.target !== 'all') {
        query = sprintf(sql, 'WHERE categoryid IN (\'' + Number(params.target) + '\') AND questionid IN (\'' + Number(params.question) + '\')');
      } else if (params.question !== 'all' && params.target === 'all') {
        query = sprintf(sql, 'WHERE questionid IN (\'' + Number(params.question) + '\')');
      } else if (params.question === 'all' && params.target !== 'all') {
        query = sprintf(sql, 'WHERE categoryid IN (\'' + Number(params.target) + '\')');
      }

      console.log(query);

      options = {
        data: {
          q: query,
          format: 'json'
        },
        success: onSuccess,
        error: onError
      };

      this.fetch(options);
    }

  });

  return AnswersCollection;

});
