'use strict';

define([
  '_string',
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
          question.answers = _.sortBy(_.map(_.where(data.rows, {
            questionid: question.questionid
          }), function(answer) {
            answer.answervalue = answer.answervalue.split('.')[0];
            return answer;
          }), function(answer) {
            return answer.targetname;
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
          q: this.getQuery(params),
          format: 'json'
        },
        reset: true,
        success: onSuccess,
        error: onError
      };

      this.fetch(options);
    },

    getQuery: function(params) {
      var query;
      var targets = '';
      var questions = '';
      var tlen = params.target.length;
      var qlen = params.question.length;

      if (params.target !== 'all') {
        _.each(params.target, function(t, i) {
          if (i === tlen -1) {
            targets += '\'' + t +'\'';
          } else {
            targets += '\'' + t +'\',';
          }
        });
      }

      if (params.question !== 'all') {
        _.each(params.question, function(q, i) {
          if (i === qlen -1) {
            questions += '\'' + q +'\'';
          } else {
            questions += '\'' + q +'\',';
          }
        });
      }

      if (params) {
        if (params.question === 'all' && params.target === 'all') {
          query = sprintf(sql, ' ');
        } else if (params.question !== 'all' && params.target !== 'all') {
          query = sprintf(sql, 'AND targetid IN (' + targets + ') AND criterias.questionid IN (' + questions + ')');
        } else if (params.question !== 'all' && params.target === 'all') {
          query = sprintf(sql, 'AND criterias.questionid IN (' + questions + ')');
        } else if (params.question === 'all' && params.target !== 'all') {
          query = sprintf(sql, 'AND targetid IN (' + targets + ')');
        }
      } else {
        query = sprintf(sql, ' ');
      }

      return query;
    }

  });

  return AnswersCollection;

});
