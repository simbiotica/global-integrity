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

      var self = this;

      if (!this.data) {
        this.data = data.rows;
      }

      if (!this.categories) {
        var categories = _.uniq(_.reject(_.map(data.rows, function(d) {
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

        category.questions = _.where(data.rows, {
          categoryid: category.id
        });

        if (category.questions.length > 1) {
          category.questions = _.reject(category.questions, function(answer) {
            return answer.questiontext === '';
          });
        } else if (category.questions.length === 1) {
          category.questions = _.filter(self.data, function(question) {
            return (question.questionid === category.questions[0].questionid && question.questiontext !== '');
          });
        }

        category.questions = _.uniq(_.map(category.questions, function(question) {
          question.answers = _.map(_.where(data.rows, {
            questionid: question.questionid
          }), function(answer) {
            answer.answervalue = answer.answervalue.split('.')[0];
            return answer;
          });

          question.criterias = _.sortBy(_.map(_.where(data.rows, {
            questionid: question.questionid
          })[0].criterias, function(criteria) {
            if (typeof criteria === 'string') {
              var c = criteria.split('|');
              return {
                key: c[0],
                value: c[1]
              };
            } else {
              return criteria;
            }
          }), function(criteria) {
            return criteria.key;
          });

          return question;
        }), false, function(question) {
          return question.questionid;
        });

        return category;
      }), function(category) {
        return category.questions.length === 0;
      });

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
          q: sprintf(sql, ' '),
          format: 'json'
        },
        reset: true,
        success: onSuccess,
        error: onError
      };

      this.fetch(options);
    },

    getData: function(params, callback) {
      var options, query, self = this;

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

      if (params) {
        if (params.question === 'all' && params.target === 'all') {
          query = sprintf(sql, ' ');
        } else if (params.question !== 'all' && params.target !== 'all') {
          query = sprintf(sql, 'AND targetid IN (\'' + Number(params.target) + '\') AND dnorm.questionid IN (\'' + Number(params.question) + '\') ');
        } else if (params.question !== 'all' && params.target === 'all') {
          query = sprintf(sql, 'AND dnorm.questionid IN (\'' + Number(params.question) + '\')');
        } else if (params.question === 'all' && params.target !== 'all') {
          query = sprintf(sql, 'AND targetid IN (\'' + Number(params.target) + '\')');
        }
      } else {
        query = sprintf(sql, ' ');
      }

      options = {
        data: {
          q: query,
          format: 'json'
        },
        reset: true,
        success: onSuccess,
        error: onError
      };

      if (!this.data) {
        this.getAll(function(err) {
          if (err) {
            throw err.responseText;
          }
          self.fetch(options);
        });
      } else {
        this.fetch(options);
      }
    }

  });

  return AnswersCollection;

});
